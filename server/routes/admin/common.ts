import express from "express";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { GoogleGenAI } from "@google/genai";
import { db, setDb, seedData, generateAdditionalSamplePosts, reseedCleanUniquePosts, getPasswordPolicy, validatePasswordAgainstPolicy } from "../../db";
import { JWT_SECRET, ADMIN_ROLES, ROLE_PERMISSIONS } from "../../config";
import { authenticateToken, optionalAuthenticateToken, isAdmin, requirePermission, logAction, sanitizeLogText } from "../../middleware/auth";
import { filterNGWords, detectInappropriateWords, evaluateContentSafety } from "../../moderation";
import { broadcastToUser, sendNotificationEmail } from "../../websocket";
import { sendPasswordResetEmail } from "../../mail";

export {
  express,
  Database,
  bcrypt,
  jwt,
  crypto,
  fs,
  path,
  execSync,
  GoogleGenAI,
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
};

// 🌟 既存DBユーザーIDの完全UID化マイグレーション即時実行
export function executeUidMigration() {
  try {
    if (!db) return;
    const users = db.prepare("SELECT id, username, email, full_name, nickname FROM users WHERE username != 'admin' AND email != 'sim_spammer_bot@test.local' AND username != 'sim_spammer_bot'").all() as any[];
    const updateStmt = db.prepare("UPDATE users SET username = ? WHERE id = ?");

    const usedUids = new Set<string>();
    users.forEach(u => {
      if (u.username && /^UID-\d{6}$/.test(u.username)) {
        usedUids.add(u.username);
      }
    });

    let updatedCount = 0;
    for (const u of users) {
      if (!u.username || !/^UID-\d{6}$/.test(u.username)) {
        let newUid = '';
        while (true) {
          const num = Math.floor(100000 + Math.random() * 900000);
          newUid = `UID-${num}`;
          if (!usedUids.has(newUid)) {
            usedUids.add(newUid);
            break;
          }
        }
        updateStmt.run(newUid, u.id);
        console.log(`[Instant UID Migration] User #${u.id} (${u.email || u.nickname}): "${u.username}" -> "${newUid}"`);
        updatedCount++;
      }
    }
    if (updatedCount > 0) {
      console.log(`[Instant UID Migration] Successfully migrated ${updatedCount} users to UID-xxxxxx format!`);
    }
  } catch (err) {
    console.error("[Instant UID Migration] Error migrating users:", err);
  }
}

// モジュール読み込み時に即時実行
try {
  executeUidMigration();
} catch (e) {}

// 📝 モデレーション処置履歴記録用共通関数
export const recordModerationHistory = (data: {
  postId?: number | string;
  actionType: string;
  actionLabel: string;
  targetName?: string;
  searcherName?: string;
  authorUserId?: number;
  authorUsername?: string;
  message?: string;
  aiReason?: string;
  adminId?: number;
  adminUsername?: string;
  details?: string;
}) => {
  try {
    db.prepare(`
      INSERT INTO moderation_history (
        post_id, action_type, action_label, target_name, searcher_name,
        author_user_id, author_username, message, ai_reason, admin_id, admin_username, details, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      data.postId ? Number(data.postId) : null,
      data.actionType,
      data.actionLabel,
      data.targetName || null,
      data.searcherName || null,
      data.authorUserId || null,
      data.authorUsername || null,
      data.message || null,
      data.aiReason || null,
      data.adminId || null,
      data.adminUsername || 'Admin',
      data.details || null
    );
  } catch (err) {
    console.error("Failed to record moderation history:", err);
  }
};

// Automated Support Ticket Classifier using Keyword Analysis
export function classifyTicketKeywords(subject: string = '', message: string = '') {
  const combined = `${subject || ''} ${message || ''}`.toLowerCase();

  const urgentKeywords = [
    '緊急', '至急', '大至急', '即時', '今すぐ', '警察', '被害', '脅迫', '通報', '恐喝', 
    '違法', '詐欺', 'ストーカー', '乗っ取り', '不正アクセス', '不正利用', '事故', '法的措置', 
    '訴訟', '弁護士', '情報漏洩', '流出', '身の危険', '返金', '誤請求', '二重請求', '二重決済', 
    '危険', 'クレーム', '損害賠償', '至急対応', '警察庁', '捜査',
    'urgent', 'emergency', 'immediate', 'police', 'fraud', 'hacked', 'lawyer', 'scam', 'refund', 'leak', 'danger'
  ];

  const technicalKeywords = [
    'エラー', '不具合', 'バグ', '動かない', '開かない', '表示されない', '接続できない', 
    'カメラ', 'クラッシュ', '落ちる', 'フリーズ', '読み込めない', '404', '500', '502', '503',
    '画面真っ白', 'ボタンが押せない', '送信できない', '決済エラー', 'stripeエラー', 'ロード中', 
    'タイムアウト', '動作不良', '読み込みエラー', 'アップロードできない', '画面崩れ', '障害', 
    '通信障害', 'サーバーエラー', 'バグ報告',
    'error', 'bug', 'issue', 'crash', 'camera', 'failed', 'fail', 'loading', 'freeze', 'glitch', 'timeout', '500', '404', 'broken'
  ];

  const accountKeywords = [
    'アカウント', '退会', '解約', '登録', 'パスワード', 'メールアドレス', '認証', 
    '認証コード', 'sms', 'ekyc', '本人確認', '年齢確認', '通知', '再開', 'ユーザー情報', 
    'ログイン情報', 'プロフィール', '利用停止', 'ブロック', 'パスワード変更', 'パスワード再設定', 
    'ログインできない', 'メアド変更', 'アドレス変更', '再ログイン', '登録削除', 'アカウント削除',
    'account', 'delete account', 'signup', 'register', 'profile', 'password', 'login', 'verification', 'auth', 'sms', 'ekyc', 'unsubscribe'
  ];

  const matchedUrgent = urgentKeywords.filter(kw => combined.includes(kw.toLowerCase()));
  const matchedTechnical = technicalKeywords.filter(kw => combined.includes(kw.toLowerCase()));
  const matchedAccount = accountKeywords.filter(kw => combined.includes(kw.toLowerCase()));

  if (matchedUrgent.length > 0) {
    return {
      category: 'urgent',
      category_en: 'Urgent',
      category_label: '緊急',
      matched_keywords: Array.from(new Set(matchedUrgent)),
      priority_score: 3,
      triage_tip: '🚨 最優先トリアージ対象：ユーザーの被害防止・金銭トラブル・警察捜査照会等の可能性があります。迅速な確認および返金・アカウント保全等の措置を検討してください。'
    };
  }

  if (matchedTechnical.length > 0) {
    return {
      category: 'technical',
      category_en: 'Technical',
      category_label: '技術・不具合',
      matched_keywords: Array.from(new Set(matchedTechnical)),
      priority_score: 2,
      triage_tip: '⚙️ 技術トリアージ対象：カメラ・決済・認証または画面描画の不具合報告です。ご利用環境（端末・OS・ブラウザ）のヒアリングや調査状況を伝えてください。'
    };
  }

  if (matchedAccount.length > 0) {
    return {
      category: 'account',
      category_en: 'Account-related',
      category_label: 'アカウント関連',
      matched_keywords: Array.from(new Set(matchedAccount)),
      priority_score: 1,
      triage_tip: '👤 アカウントトリアージ対象：ログイン再設定、退会、eKYC本人確認等の手続きに関するご相談です。具体的な操作手順や規約案内をスムーズに提示してください。'
    };
  }

  return {
    category: 'general',
    category_en: 'General',
    category_label: '一般・ご意見',
    matched_keywords: [],
    priority_score: 0,
    triage_tip: '💬 一般トリアージ対象：サービスへの温かいご感想、メディア取材依頼、一般的なお問い合わせです。丁寧な公式サポート対応を行ってください。'
  };
}

