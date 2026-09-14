
import express from "express";
import {
  db,
  setDb,
  seedData,
  generateAdditionalSamplePosts,
  reseedCleanUniquePosts,
  getPasswordPolicy,
  validatePasswordAgainstPolicy,
  JWT_SECRET,
  ADMIN_ROLES,
  ROLE_PERMISSIONS,
  authenticateToken,
  optionalAuthenticateToken,
  isAdmin,
  requirePermission,
  logAction,
  sanitizeLogText,
  filterNGWords,
  detectInappropriateWords,
  evaluateContentSafety,
  broadcastToUser,
  sendNotificationEmail,
  sendPasswordResetEmail,
  recordModerationHistory,
  classifyTicketKeywords,
} from "./common";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { GoogleGenAI } from "@google/genai";

let lastNgWordsFetch = 0;

export const communicationRouter = express.Router();


  communicationRouter.get("/broadcasts/segment-preview", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const segment = (req.query.segment as string) || 'all';
      let count = 0;
      if (segment === 'verified') {
        const row = db.prepare("SELECT COUNT(*) as count FROM users WHERE (age_verified = 1 OR is_ekyc_verified = 1 OR kyc_status = 'verified') AND (is_blocked = 0 OR is_blocked IS NULL)").get() as any;
        count = row?.count || 0;
      } else if (segment === 'unverified') {
        const row = db.prepare("SELECT COUNT(*) as count FROM users WHERE (age_verified = 0 OR age_verified IS NULL) AND (is_ekyc_verified = 0 OR is_ekyc_verified IS NULL) AND (is_blocked = 0 OR is_blocked IS NULL)").get() as any;
        count = row?.count || 0;
      } else if (segment === 'active_posts') {
        const row = db.prepare("SELECT COUNT(DISTINCT u.id) as count FROM users u JOIN posts p ON u.id = p.user_id WHERE p.status != 'deleted' AND (u.is_blocked = 0 OR u.is_blocked IS NULL)").get() as any;
        count = row?.count || 0;
      } else if (segment === 'active_disclosure') {
        const row = db.prepare("SELECT COUNT(DISTINCT u.id) as count FROM users u JOIN posts p ON (u.id = p.user_id OR u.id = p.verified_by) WHERE p.status = 'resolved' AND (u.is_blocked = 0 OR u.is_blocked IS NULL)").get() as any;
        count = row?.count || 0;
      } else {
        const row = db.prepare("SELECT COUNT(*) as count FROM users WHERE (is_blocked = 0 OR is_blocked IS NULL)").get() as any;
        count = row?.count || 0;
      }
      res.json({ segment, count });
    } catch (err) {
      console.error("Failed to get segment preview:", err);
      res.status(500).json({ error: "Failed to get segment count" });
    }
  });



  communicationRouter.post("/bulk-notification", authenticateToken, isAdmin, (req: any, res) => {
    const { title, content, link, category = 'general', priority = 'normal', channels = { inApp: true, email: false }, targetSegment = 'all' } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required" });

    try {
      let query = "SELECT id, email, username FROM users WHERE (is_blocked = 0 OR is_blocked IS NULL)";
      if (targetSegment === 'verified') {
        query = "SELECT id, email, username FROM users WHERE (age_verified = 1 OR is_ekyc_verified = 1 OR kyc_status = 'verified') AND (is_blocked = 0 OR is_blocked IS NULL)";
      } else if (targetSegment === 'unverified') {
        query = "SELECT id, email, username FROM users WHERE (age_verified = 0 OR age_verified IS NULL) AND (is_ekyc_verified = 0 OR is_ekyc_verified IS NULL) AND (is_blocked = 0 OR is_blocked IS NULL)";
      } else if (targetSegment === 'active_posts') {
        query = "SELECT DISTINCT u.id, u.email, u.username FROM users u JOIN posts p ON u.id = p.user_id WHERE p.status != 'deleted' AND (u.is_blocked = 0 OR u.is_blocked IS NULL)";
      } else if (targetSegment === 'active_disclosure') {
        query = "SELECT DISTINCT u.id, u.email, u.username FROM users u JOIN posts p ON (u.id = p.user_id OR u.id = p.verified_by) WHERE p.status = 'resolved' AND (u.is_blocked = 0 OR u.is_blocked IS NULL)";
      }

      const users = db.prepare(query).all() as any[];
      const fullMessage = title ? `【${title}】\n${content}` : content;
      
      const insertNotificationStmt = db.prepare("INSERT INTO notifications (user_id, type, content, link, is_read, created_at) VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)");
      
      users.forEach(user => {
        if (channels.inApp !== false) {
          insertNotificationStmt.run(user.id, 'admin_broadcast', fullMessage, link || null);
          
          // Broadcast via WebSocket
          broadcastToUser(user.id, {
            type: "notification",
            notification: {
              type: 'admin_broadcast',
              content: fullMessage,
              link: link || null,
              is_read: 0,
              created_at: new Date().toISOString()
            }
          });
        }

        // Send email notification if enabled
        if (channels.email === true && user.email) {
          sendNotificationEmail(user.id, 'admin_broadcast', fullMessage, link || "");
        }
      });

      // Insert into admin_broadcast_history
      const historyStmt = db.prepare(`
        INSERT INTO admin_broadcast_history (
          admin_id, title, category, priority, channels, target_segment, content, link, user_count, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      historyStmt.run(
        req.user.id,
        title || null,
        category,
        priority,
        JSON.stringify(channels),
        targetSegment,
        content,
        link || null,
        users.length
      );

      logAction(req.user.id, "bulk_notification_sent", `Title: ${title || 'なし'}, Users: ${users.length}, Segment: ${targetSegment}`, req.ip);
      res.json({ success: true, count: users.length });
    } catch (err) {
      console.error("Bulk notification error:", err);
      res.status(500).json({ error: "Failed to send bulk notifications" });
    }
  });



  communicationRouter.get("/broadcasts", authenticateToken, isAdmin, (req, res) => {
    try {
      // 1. Get from admin_broadcast_history
      const historyRows = db.prepare(`
        SELECT * FROM admin_broadcast_history ORDER BY created_at DESC
      `).all() as any[];

      // For each history item, compute read_count from notifications table
      const broadcastsWithStats = historyRows.map(row => {
        let channelsObj = { inApp: true, email: false };
        try {
          if (row.channels) channelsObj = JSON.parse(row.channels);
        } catch (e) {}

        const fullMessage = row.title ? `【${row.title}】\n${row.content}` : row.content;
        const readStats = db.prepare(`
          SELECT 
            COUNT(*) as total_deliveries,
            SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read_count
          FROM notifications 
          WHERE type = 'admin_broadcast' AND (content = ? OR content = ?)
        `).get(fullMessage, row.content) as any;

        return {
          id: row.id,
          title: row.title,
          category: row.category || 'general',
          priority: row.priority || 'normal',
          channels: channelsObj,
          target_segment: row.target_segment || 'all',
          content: row.content,
          full_message: fullMessage,
          link: row.link,
          user_count: row.user_count || readStats?.total_deliveries || 0,
          read_count: readStats?.read_count || 0,
          created_at: row.created_at
        };
      });

      // 2. Also check if there are legacy notifications that were not recorded in history
      const legacyBroadcasts = db.prepare(`
        SELECT content, link, created_at, COUNT(*) as user_count,
               SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read_count
        FROM notifications 
        WHERE type = 'admin_broadcast' 
        GROUP BY content, created_at 
        ORDER BY created_at DESC
      `).all() as any[];

      // Merge legacy if not already in broadcastsWithStats
      const existingContents = new Set(broadcastsWithStats.map(b => b.content));
      const existingFull = new Set(broadcastsWithStats.map(b => b.full_message));

      legacyBroadcasts.forEach((lb, idx) => {
        if (!existingContents.has(lb.content) && !existingFull.has(lb.content)) {
          broadcastsWithStats.push({
            id: `legacy-${idx}`,
            title: null,
            category: 'general',
            priority: 'normal',
            channels: { inApp: true, email: true },
            target_segment: 'all',
            content: lb.content,
            full_message: lb.content,
            link: lb.link,
            user_count: lb.user_count,
            read_count: lb.read_count || 0,
            created_at: lb.created_at
          });
        }
      });

      // Sort by created_at DESC
      broadcastsWithStats.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      res.json(broadcastsWithStats);
    } catch (err) {
      console.error("Failed to fetch broadcasts:", err);
      res.status(500).json({ error: "Failed to fetch broadcasts" });
    }
  });



  communicationRouter.delete("/broadcasts", authenticateToken, isAdmin, (req: any, res) => {
    const { id, content, created_at } = req.body;
    try {
      if (id && typeof id === 'number') {
        db.prepare("DELETE FROM admin_broadcast_history WHERE id = ?").run(id);
      }
      if (content) {
        db.prepare("DELETE FROM notifications WHERE type = 'admin_broadcast' AND (content = ? OR content LIKE '%' || ? || '%')").run(content, content);
      } else if (created_at) {
        db.prepare("DELETE FROM notifications WHERE type = 'admin_broadcast' AND created_at = ?").run(created_at);
      }
      logAction(req.user.id, "bulk_notification_deleted", `Broadcast ID: ${id || 'N/A'}, Content: ${(content || '').substring(0, 50)}`, req.ip);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to delete broadcast:", err);
      res.status(500).json({ error: "Failed to delete broadcast" });
    }
  });



  // --- 2. 📬 お問い合わせ (Contacts) Seed & Clear ---
  communicationRouter.post("/contacts/seed", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const sampleContacts = [
        {
          name: "鈴木 一郎",
          email: "ichiro.suzuki@example.com",
          subject: "【質問】思い出の合言葉がどうしても思い出せません",
          message: "昔の同級生らしきボトルメールを見つけましたが、秘密の質問の答えの漢字表記が分かりません。ヒント等の救済措置はありますでしょうか？"
        },
        {
          name: "高橋 花子",
          email: "hanako.t@example.com",
          subject: "【決済】クレジットカード決済後の画面遷移について",
          message: "開通手数料600円の決済を完了しましたが、通信が切れてしまいメッセージが開示されているか確認したいです。"
        },
        {
          name: "中村 誠",
          email: "makoto.n@example.com",
          subject: "【本人確認】マイナンバーカードの撮影エラー",
          message: "eKYCの書類アップロードで厚み撮影がうまくいきません。再提出の手順をご教示いただけますでしょうか。"
        },
        {
          name: "小林 優子",
          email: "yuko.k@example.com",
          subject: "【要望】通知メールの受信設定について",
          message: "メッセージに返信が届いた際の通知をLINE連携でも受け取れるようにしたいです。今後のアップデート予定はありますか？"
        },
        {
          name: "渡辺 大輔",
          email: "daisuke.w@example.com",
          subject: "【通報】不適切な宣伝メッセージの報告",
          message: "投資話を持ちかけるような怪しいボトルメールを見かけましたので調査・対応をお願いいたします。"
        }
      ];

      const insertContact = db.prepare("INSERT INTO contacts (name, email, subject, message, status, created_at) VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)");
      const insertMessage = db.prepare("INSERT INTO contact_messages (contact_id, sender_type, sender_name, message, created_at) VALUES (?, 'user', ?, ?, CURRENT_TIMESTAMP)");

      for (const c of sampleContacts) {
        const info = insertContact.run(c.name, c.email, c.subject, c.message);
        insertMessage.run(info.lastInsertRowid, c.name, c.message);
      }
      logAction(req.user.id, "CONTACTS_SAMPLE_SEEDED", `Seeded ${sampleContacts.length} sample contacts`, req.ip);
      res.json({ success: true, count: sampleContacts.length });
    } catch (err) {
      console.error("Seed contacts error:", err);
      res.status(500).json({ error: "お問い合わせサンプルの生成に失敗しました" });
    }
  });



  communicationRouter.post("/contacts/clear-all", authenticateToken, isAdmin, (req: any, res) => {
    try {
      db.prepare("DELETE FROM contact_messages").run();
      const result = db.prepare("DELETE FROM contacts").run();
      logAction(req.user.id, "CONTACTS_ALL_CLEARED", `Cleared all ${result.changes} contacts`, req.ip);
      res.json({ success: true, count: result.changes });
    } catch (err) {
      console.error("Clear contacts error:", err);
      res.status(500).json({ error: "お問い合わせ履歴の一括クリアに失敗しました" });
    }
  });

  // --- 3. 🚨 ユーザー通報 (Reports) Seed & Clear ---


  communicationRouter.post("/contact", (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "すべての項目を入力してください。" });
    }
    try {
      db.prepare("INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)")
        .run(name, email, subject, message);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "送信に失敗しました。時間をおいて再度お試しください。" });
    }
  });

  // --- Page View Logging ---


  communicationRouter.get("/contacts", authenticateToken, isAdmin, (req, res) => {
    try {
      const contacts = db.prepare("SELECT * FROM contacts ORDER BY created_at DESC").all() as any[];
      const enrichedContacts = contacts.map(c => {
        const cl = classifyTicketKeywords(c.subject || '', c.message || '');
        return {
          ...c,
          category: cl.category,
          category_en: cl.category_en,
          category_label: cl.category_label,
          matched_keywords: cl.matched_keywords,
          priority_score: cl.priority_score,
          triage_tip: cl.triage_tip
        };
      });
      res.json(enrichedContacts);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });



  communicationRouter.post("/contacts/seed-samples", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const samples = [
        { 
          name: "佐々木 健一", 
          email: "sasaki.ken@example.com", 
          subject: "【至急】アカウント乗っ取りの疑いと不正利用・返金について", 
          message: "大至急対応をお願いいたします。自分以外の第三者がログインし、二重決済が発生しているようです。警察への相談も検討しているため、直ちにアクセス履歴の調査と返金手続きを行ってください。" 
        },
        { 
          name: "渡辺 真由美", 
          email: "watanabe.m@example.com", 
          subject: "【緊急】嫌がらせ・ストーカー被害の通報とログ保全要請", 
          message: "緊急でご連絡しております。特定の相手から脅迫めいたメッセージが届いており、身の危険を感じています。対象アカウントの即時停止と、警察への捜査照会に備えた証拠ログの保全をお願いします。" 
        },
        { 
          name: "田中 一郎", 
          email: "tanaka@example.com", 
          subject: "【不具合報告】モバイル版カメラ撮影時に500エラーで画面がクラッシュする", 
          message: "eKYC本人確認の撮影画面で、カメラを起動しようとすると画面がフリーズしてクラッシュし、エラーコード500が表示されて先に進めません。至急バグの修正をお願いします。" 
        },
        { 
          name: "伊藤 美咲", 
          email: "ito.misaki@example.com", 
          subject: "【システム障害】SMS認証コードが受信できずボタンが押せません", 
          message: "携帯番号を入力して認証コードを送信しましたが、10分以上待ってもSMSが届きません。画面がロード中のままタイムアウトしてしまいます。" 
        },
        { 
          name: "山田 太郎", 
          email: "yamada@example.com", 
          subject: "【アカウント】ログインパスワードの再設定とメールアドレス変更", 
          message: "以前登録したメールアドレスを変更したいため、パスワード再設定とユーザープロフィールの更新手順を教えてください。" 
        },
        { 
          name: "高橋 三郎", 
          email: "takahashi@example.com", 
          subject: "【退会手続き】アカウント削除と個人データの消去依頼", 
          message: "無事に目的の知人と再会できたため、サービスのアカウント退会と登録情報の完全削除をお願いしたいです。手続き方法をご案内ください。" 
        },
        { 
          name: "佐藤 花子", 
          email: "sato@example.com", 
          subject: "広告掲載およびメディア取材の依頼について", 
          message: "WEBメディア編集部です。ReMEETsの温かい想い出ボトルメールの取り組みについて取材およびタイアップ掲載を希望しております。広報窓口のご担当者様をご教示いただけますと幸いです。" 
        },
        { 
          name: "鈴木 次郎", 
          email: "suzuki@example.com", 
          subject: "感謝のメッセージ：30年ぶりの再会が叶いました！", 
          message: "このサイトのおかげで30年ぶりに小学校の親友と再会できました！最初は半信半疑でしたが本当に奇跡が起きました。心より感謝申し上げます。" 
        }
      ];

      for (const s of samples) {
        db.prepare("INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)")
          .run(s.name, s.email, s.subject, s.message);
      }

      res.json({ success: true, message: "サンプルお問い合わせ（全分類対応8件）を投入しました。" });
    } catch (err) {
      console.error("Failed to seed sample contacts:", err);
      res.status(500).json({ error: "Failed to seed sample contacts" });
    }
  });



  communicationRouter.post("/contacts/:id/ai-draft", authenticateToken, isAdmin, async (req: any, res) => {
    const { id } = req.params;
    const { tone } = req.body || {};

    try {
      const contact = db.prepare("SELECT * FROM contacts WHERE id = ?").get(id);
      if (!contact) {
        return res.status(404).json({ error: "お問い合わせが見つかりません。" });
      }

      const userName = contact.name || "ユーザー";
      const userSubject = contact.subject || "お問い合わせ";
      const userMessage = contact.message || "";

      let toneInstruction = "丁寧で温かみのある標準的な公式サポート対応トーン";
      if (tone === "apology") {
        toneInstruction = "不具合やご不便に対する誠実なお詫びと、現状の確認・今後の対応方針を伝える誠心誠意のトーン";
      } else if (tone === "guide") {
        toneInstruction = "サービスの仕組み（想い出ボトル投函、クイズ照合、eKYC本人確認、連絡先安全開示等）を初心者にも分かりやすく丁寧に解説・案内するトーン";
      } else if (tone === "gratitude") {
        toneInstruction = "温かい想い出や応援の声を寄せてくださったことへの感謝と共感を込めたトーン";
      } else if (tone === "concise") {
        toneInstruction = "要点を簡潔・明瞭に箇条書き等も交えて整理したスピーディーな案内トーン";
      }

      let generatedDraft = "";

      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              }
            }
          });

          const prompt = `
あなたは「想い出のボトルメール・再会マッチングプラットフォーム ReMEETs（リミーツ）」の公式カスタマーサポート運営事務局の担当者です。
ユーザーから届いた以下のお問い合わせに対して、メール返信用の上質で丁寧な「下書き（ドラフト）」を作成してください。

【サービス概要・重要仕様】
- ReMEETsは想い出のボトルメールを海に流し、想い出クイズの完全一致によってお相手と再会・照合する安心・安全なプラットフォームです。
- アプリ内でのメッセージ送受信は行わず、想い出クイズ照合・eKYC本人確認・決済完了後に「連絡先（LINE ID・メールアドレス等）」とメッセージ全文を一度だけ安全に開示・引き渡す仕組みです。
- 誹謗中傷や悪用を防ぐため、AIリアルタイム安全防衛エンジンとeKYC公的本人確認を備えています。

【お問い合わせ情報】
- 差出人名: ${userName} 様
- お問い合わせ件名: ${userSubject}
- お問い合わせ本文:
${userMessage}

【指定返信トーン】
${toneInstruction}

【返信メール作成ルール】
1. 冒頭で「${userName} 様」と呼びかけ、ReMEETsサポート事務局へのお問い合わせへの感謝を述べます。
2. お問い合わせ内容（${userSubject}）に対して、具体的・親切・正確・わかりやすく回答や案内を記載します。
3. 必要に応じて「ご不明点や追加のご質問がございましたら、本メールへのご返信にてお気軽にお知らせください」等の案内を添えます。
4. 末尾に「ReMEETs カスタマーサポート運営事務局」の署名を添えます。
5. 前置きや解説（「以下が下書きです」等）は一切含めず、返信メール本文のみを出力してください。
`;

          const aiResponse = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: prompt,
          });

          if (aiResponse && aiResponse.text) {
            generatedDraft = aiResponse.text.trim();
          }
        } catch (aiErr) {
          console.error("Gemini API draft generation error:", aiErr);
        }
      }

      // Fallback template if Gemini API key is not present or failed
      if (!generatedDraft) {
        generatedDraft = `${userName} 様

いつもReMEETsをご利用いただき、誠にありがとうございます。
ReMEETsカスタマーサポート運営事務局でございます。

この度は「${userSubject}」につきまして、お問い合わせをいただき重ねて御礼申し上げます。

お問い合わせいただきました内容につきまして、事務局にて確認いたしました。
${userMessage.length > 0 ? `（お問い合わせ内容：${userMessage.slice(0, 40)}...）\n\n` : ''}担当チームにて詳細を確認のうえ、順次ご案内・サポートを進めさせていただきます。
仕様のご案内やお手続きに関しましては、安心・安全にご利用いただけるよう丁寧に対応いたします。

もし追加のご不明点や気になる点などがございましたら、本メールにご返信いただくか、お問い合わせフォームよりお気軽にお知らせください。

今後ともReMEETsをよろしくお願い申し上げます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ReMEETs カスタマーサポート運営事務局
公式サイト: https://remeets.jp
お問い合わせ: support@remeets.jp
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      }

      res.json({ draft: generatedDraft });
    } catch (err) {
      console.error("AI draft error:", err);
      res.status(500).json({ error: "下書きの生成に失敗しました。" });
    }
  });



  communicationRouter.post("/contacts/:id/reply", authenticateToken, isAdmin, async (req: any, res) => {
    const { id } = req.params;
    const { replyMessage } = req.body;

    if (!replyMessage) {
      return res.status(400).json({ error: "Reply message is required" });
    }

    try {
      const contact = db.prepare("SELECT * FROM contacts WHERE id = ?").get(id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }

      // Send Email (Mock)
      // In a real implementation using nodemailer:
      // const transporter = nodemailer.createTransport({...});
      // await transporter.sendMail({
      //   to: contact.email,
      // });

      console.log(`[EMAIL MOCK] -----------------------------------`);
      console.log(`To: ${contact.email}`);
      console.log(`[EMAIL MOCK] -----------------------------------`);

      db.prepare("UPDATE contacts SET status = 'replied', reply_message = ?, replied_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(replyMessage, id);

      logAction(req.user.id, "ADMIN_CONTACT_REPLY", `Replied to contact ID: ${id}`, req.ip);
      
      res.json({ message: "Reply sent successfully" });
    } catch (err) {
      console.error("Reply error:", err);
      res.status(500).json({ error: "Failed to send reply" });
    }
  });

  // Admin Contacts: Update Status


  // Admin Contacts: Update Status
  communicationRouter.patch("/contacts/:id/status", authenticateToken, isAdmin, (req: any, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !['pending', 'replied'].includes(status)) {
      return res.status(400).json({ error: "Invalid status (must be 'pending' or 'replied')" });
    }
    try {
      db.prepare("UPDATE contacts SET status = ? WHERE id = ?").run(status, id);
      logAction(req.user?.id || 1, "ADMIN_CONTACT_STATUS_UPDATE", `Updated contact ID ${id} status to ${status}`, req.ip);
      res.json({ success: true, message: "Status updated" });
    } catch (err) {
      console.error("Status update error:", err);
      res.status(500).json({ error: "Failed to update contact status" });
    }
  });

  // Admin Contacts: Single Delete


  // Admin Contacts: Single Delete
  communicationRouter.delete("/contacts/:id", authenticateToken, isAdmin, (req: any, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM contacts WHERE id = ?").run(id);
      logAction(req.user?.id || 1, "ADMIN_CONTACT_DELETE", `Deleted contact ID ${id}`, req.ip);
      res.json({ success: true, message: "Contact deleted" });
    } catch (err) {
      console.error("Delete contact error:", err);
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });

  // Admin Contacts: Batch Status Update


  // Admin Contacts: Batch Status Update
  communicationRouter.post("/contacts/batch-status", authenticateToken, isAdmin, (req: any, res) => {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !['pending', 'replied'].includes(status)) {
      return res.status(400).json({ error: "Invalid request (ids array and valid status required)" });
    }
    try {
      const placeholders = ids.map(() => '?').join(',');
      db.prepare(`UPDATE contacts SET status = ? WHERE id IN (${placeholders})`).run(status, ...ids);
      logAction(req.user?.id || 1, "ADMIN_CONTACT_BATCH_STATUS", `Batch updated ${ids.length} contacts to status ${status}`, req.ip);
      res.json({ success: true, count: ids.length, message: `${ids.length}件のお問い合わせのステータスを一括更新しました` });
    } catch (err) {
      console.error("Batch status error:", err);
      res.status(500).json({ error: "Failed to batch update contacts" });
    }
  });

  // Admin Contacts: Batch Delete


  // Admin Contacts: Batch Delete
  communicationRouter.post("/contacts/batch-delete", authenticateToken, isAdmin, (req: any, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid request (ids array required)" });
    }
    try {
      const placeholders = ids.map(() => '?').join(',');
      db.prepare(`DELETE FROM contacts WHERE id IN (${placeholders})`).run(...ids);
      logAction(req.user?.id || 1, "ADMIN_CONTACT_BATCH_DELETE", `Batch deleted ${ids.length} contacts`, req.ip);
      res.json({ success: true, count: ids.length, message: `${ids.length}件のお問い合わせを一括削除しました` });
    } catch (err) {
      console.error("Batch delete error:", err);
      res.status(500).json({ error: "Failed to batch delete contacts" });
    }
  });

  // Admin Email Templates Management Endpoints


  // Admin Email Templates Management Endpoints
  communicationRouter.get("/email-templates", authenticateToken, isAdmin, (req, res) => {
    try {
      const customTemplates = db.prepare("SELECT * FROM system_email_templates").all();
      res.json(customTemplates);
    } catch (err) {
      console.error("Failed to fetch email templates:", err);
      res.status(500).json({ error: "Failed to fetch email templates" });
    }
  });



  communicationRouter.post("/email-templates", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const { id, subject, bodyTemplate, fromName } = req.body;
      if (!id || !subject || !bodyTemplate) {
        return res.status(400).json({ error: "id, subject, and bodyTemplate are required" });
      }

      db.prepare(`
        INSERT INTO system_email_templates (id, subject, body_template, from_name, updated_at)
        VALUES (?, ?, ?, ?, datetime('now', 'localtime'))
        ON CONFLICT(id) DO UPDATE SET
          subject = excluded.subject,
          body_template = excluded.body_template,
          from_name = excluded.from_name,
          updated_at = datetime('now', 'localtime')
      `).run(id, subject, bodyTemplate, fromName || null);

      logAction(req.user?.id || 1, "EMAIL_TEMPLATE_UPDATED", `メールテンプレート更新: ${id} (${subject})`, req.ip);

      res.json({ success: true, message: `Template ${id} saved successfully` });
    } catch (err) {
      console.error("Failed to save email template:", err);
      res.status(500).json({ error: "Failed to save email template" });
    }
  });



  communicationRouter.post("/email-templates/reset", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const { id } = req.body;
      if (id) {
        db.prepare("DELETE FROM system_email_templates WHERE id = ?").run(id);
        logAction(req.user?.id || 1, "EMAIL_TEMPLATE_RESET", `メールテンプレート初期化: ${id}`, req.ip);
      } else {
        db.prepare("DELETE FROM system_email_templates").run();
        logAction(req.user?.id || 1, "EMAIL_TEMPLATE_RESET_ALL", `全メールテンプレート初期化`, req.ip);
      }
      res.json({ success: true, message: "Template reset successfully" });
    } catch (err) {
      console.error("Failed to reset email template:", err);
      res.status(500).json({ error: "Failed to reset email template" });
    }
  });

  // Admin Email Templates: Send Test Email


  // Admin Email Templates: Send Test Email
  communicationRouter.post("/email-templates/send-test", authenticateToken, isAdmin, async (req: any, res) => {
    const { templateId, toEmail, subject, bodyText } = req.body;

    if (!toEmail || !subject || !bodyText) {
      return res.status(400).json({ error: "Missing required fields (toEmail, subject, bodyText)" });
    }

    try {
      console.log(`\n======================================================`);
      console.log(`[ADMIN TEST EMAIL DISPATCH] 📨`);
      console.log(`Template: ${templateId}`);
      console.log(`To: ${toEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log(`------------------------------------------------------`);
      console.log(bodyText);
      console.log(`======================================================\n`);

      logAction(req.user?.id || 1, "ADMIN_TEST_EMAIL_SENT", `Sent test email '${templateId}' to ${toEmail}`, req.ip);

      res.json({ 
        success: true, 
        message: `Test email (${templateId}) dispatched successfully to ${toEmail}` 
      });
    } catch (err) {
      console.error("Test email dispatch error:", err);
      res.status(500).json({ error: "Failed to dispatch test email" });
    }
  });

  // ──────────────────────────────────────────────────────────
  // 🖼️ Asset Cleaner & Image Management APIs
  // ──────────────────────────────────────────────────────────

  // Helper to format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Helper to scan codebase for image usage
  const scanImageUsage = () => {
    const rootDir = process.cwd();
    const extensions = [".ts", ".tsx", ".js", ".jsx", ".html", ".css", ".json"];
    const scanDirs = [
      path.join(rootDir, "src"),
      path.join(rootDir, "server"),
      path.join(rootDir, "public")
    ];

    const fileMap: { [relPath: string]: string } = {};

    const walk = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist") continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (extensions.includes(path.extname(entry.name).toLowerCase())) {
          try {
            const rel = path.relative(rootDir, full);
            fileMap[rel] = fs.readFileSync(full, "utf-8");
          } catch {}
        }
      }
    };

    scanDirs.forEach(walk);
    return fileMap;
  };

  // 1. Get all images with usage detection
