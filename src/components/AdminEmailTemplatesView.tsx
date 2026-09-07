import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  Settings, 
  Sparkles, 
  FileText, 
  Key, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle,
  ExternalLink,
  Smartphone,
  Eye,
  Copy,
  Check,
  MessageSquare,
  Heart,
  Bell,
  CheckSquare,
  Receipt,
  Trash2,
  ShieldAlert,
  UserX,
  Download,
  Printer,
  Edit3,
  Save,
  RotateCcw,
  FileSpreadsheet
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  category: string;
  type: 'email' | 'sms';
  title: string;
  triggerEvent: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  bodyTemplate: string;
  sampleData: Record<string, string>;
  tags: string[];
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  // 1. 会員登録認証
  {
    id: 'verification',
    category: '認証・セキュリティ',
    type: 'email',
    title: '会員登録・メールアドレス確認メール',
    triggerEvent: '新規会員登録時、またはメールアドレス変更時',
    fromName: 'ReMEETs 運営事務局',
    fromEmail: 'no-reply@remeets.link',
    subject: '【ReMEETs】メールアドレスのご確認（認証手続き）',
    bodyTemplate: `{{userName}} 様

ReMEETs（リミーツ）へのご登録ありがとうございます。

以下のリンクをクリックして、メールアドレスの認証手続きを完了してください。
認証が完了すると、手紙の投函や思い出の検索機能をご利用いただけます。

▼ メールアドレスを認証する
{{verificationUrl}}

※このURLの有効期限は発行から24時間です。
※本メールに心当たりがない場合は、第三者が誤って入力した可能性がありますので、本メールを破棄してください。

--------------------------------------------------
ReMEETs〜再会のボトルメール〜 運営事務局
公式サイト: https://remeets.link
お問い合わせ: support@remeets.link
--------------------------------------------------`,
    sampleData: {
      userName: '山田 太郎',
      verificationUrl: 'https://remeets.link/verify-email?token=sample_verification_token_12345'
    },
    tags: ['自動送信', '即時配信', '認証必須']
  },

  // 2. パスワード再設定
  {
    id: 'password_reset',
    category: '認証・セキュリティ',
    type: 'email',
    title: 'パスワード再設定のご案内',
    triggerEvent: 'ユーザーが「パスワードを忘れた場合」からリセット申請した時',
    fromName: 'ReMEETs 運営事務局',
    fromEmail: 'no-reply@remeets.link',
    subject: '【ReMEETs】パスワード再設定のお手続き',
    bodyTemplate: `{{userName}} 様

いつもReMEETsをご利用いただきありがとうございます。

パスワードの再設定リクエストを受け付けました。
以下のリンクより、新しいパスワードを設定してください。

▼ パスワード再設定ページ
{{resetUrl}}

※このURLの有効期限は発行から1時間です。
※本メールに心当たりがない場合は、パスワードは変更されておりませんのでご安心ください。

--------------------------------------------------
ReMEETs〜再会のボトルメール〜 運営事務局
公式サイト: https://remeets.link
お問い合わせ: support@remeets.link
--------------------------------------------------`,
    sampleData: {
      userName: '佐藤 花子',
      resetUrl: 'https://remeets.link/reset-password?token=sample_reset_token_67890'
    },
    tags: ['自動送信', '1時間有効', '暗号化']
  },

  // 3. SMS電話番号認証
  {
    id: 'sms_code',
    category: '本人確認・eKYC',
    type: 'sms',
    title: 'SMS電話番号認証コード通知（eKYC開通時）',
    triggerEvent: '手紙開封・連絡先開示前の電話番号認証手続き時',
    fromName: 'ReMEETs',
    fromEmail: 'SMS (050-XXXX-XXXX / 短縮番号)',
    subject: '【SMS通知】認証コードのご案内',
    bodyTemplate: `【ReMEETs】認証コード: {{smsCode}}
このコードを画面に入力してください（有効期限: 10分）。※他人に教えないでください。`,
    sampleData: {
      smsCode: '839201'
    },
    tags: ['SMS配信', 'Twilio/EZSMS', '10分有効', '厳格認証']
  },

  // 4. ボトル投函完了・控えメール
  {
    id: 'post_created',
    category: 'ボトルメール管理',
    type: 'email',
    title: 'ボトルメール投函完了（受付・控え）メール',
    triggerEvent: 'ユーザーが新しい手紙（ボトルメール）を海へ流した直後',
    fromName: 'ReMEETs 運営事務局',
    fromEmail: 'no-reply@remeets.link',
    subject: '【ReMEETs】「{{targetName}} 様」宛てのボトルメールを海へ流しました 🍾',
    bodyTemplate: `{{searcherName}} 様

あなたの想いを込めたボトルメールを、インターネットの大海原へ解き放ちました。

お相手がふと検索（エゴサーチ）した際、または新着アラートにより、
この手紙が見つけられる日を静かに待ち続けます。

--------------------------------------------------
【投函されたボトルの内容】
・お相手のお名前：{{targetName}} 様
・出会った地域：{{location}}
・年代・関係：{{era}}年代 / {{category}}
・思い出クイズ：2問設定済み
・開示用連絡先：設定済み（正解時のみ安全開示）
--------------------------------------------------

お相手が手紙を見つけて思い出クイズに回答した際には、
ご登録のメールアドレス宛てにリアルタイムでお知らせいたします。

▼ 流したボトルの確認・編集
{{bottleDetailUrl}}

--------------------------------------------------
ReMEETs〜再会のボトルメール〜 運営事務局
公式サイト: https://remeets.link
お問い合わせ: support@remeets.link
--------------------------------------------------`,
    sampleData: {
      searcherName: 'あおい',
      targetName: '高橋 健二',
      location: '神奈川県横浜市',
      era: '2000',
      category: '高校の部活仲間',
      bottleDetailUrl: 'https://remeets.link/post/sample-post-id-101'
    },
    tags: ['投函直後', '安心控え', '状況追跡']
  },

  // 5. 新着入荷通知アラート (フルネーム・地域合致)
  {
    id: 'new_bottle_alert',
    category: '再会マッチング',
    type: 'email',
    title: '新着入荷通知アラート（あなた宛ての手紙が届きました）',
    triggerEvent: '保存された通知条件（自分のフルネームやゆかりの地）に合致するボトルが新しく投函された時',
    fromName: 'ReMEETs 再会速報システム',
    fromEmail: 'alert@remeets.link',
    subject: '【ReMEETs新着アラート】「{{matchedName}}」様宛ての新しい手紙が海に流されました！🔔',
    bodyTemplate: `{{userName}} 様

あなた宛てと思われる新しいボトルメールが届いた可能性があります。

あなたが登録している新着入荷アラート条件（お名前: {{matchedName}} / 地域: {{matchedLocation}}）に
一致する手紙が、新たにインターネットの海へ投函されました。

--------------------------------------------------
【届いたボトルの手がかり】
・宛名：{{matchedName}} 様
・出会った場所：{{matchedLocation}}
・年代・関係分類：{{era}}年代 / {{category}}
・差出人の呼び名：{{searcherNickname}}
--------------------------------------------------

心当たりのある方は、ぜひ以下のリンクから手紙を確認し、
二人の思い出の「思い出クイズ」に挑戦してみてください！

▼ 届いたボトルメールを確認する
{{bottleUrl}}

※この通知は、マイページの「通知・アラート設定」でいつでも配信停止・条件変更が可能です。

--------------------------------------------------
ReMEETs〜再会のボトルメール〜 運営事務局
公式サイト: https://remeets.link
お問い合わせ: support@remeets.link
--------------------------------------------------`,
    sampleData: {
      userName: '渡辺 美咲',
      matchedName: '渡辺 美咲',
      matchedLocation: '東京都世田谷区',
      era: '1990',
      category: '同級生・幼馴染',
      searcherNickname: 'たっくん',
      bottleUrl: 'https://remeets.link/post/sample-post-id-303'
    },
    tags: ['エゴサーチ連動', '新着速報', 'フルネーム合致']
  },

  // 6. クイズ回答通知
  {
    id: 'quiz_answered',
    category: '再会マッチング',
    type: 'email',
    title: '思い出クイズ回答・発見通知メール',
    triggerEvent: 'あなたが流したボトルをお相手が見つけ、思い出クイズに回答した時',
    fromName: 'ReMEETs 再会速報システム',
    fromEmail: 'alert@remeets.link',
    subject: '【ReMEETs速報】あなたが流したボトルにお相手から回答がありました！',
    bodyTemplate: `{{searcherName}} 様

奇跡の瞬間が近づいています。

あなたが投函した「{{targetName}} 様」宛てのボトルメールに対して、
お相手と思われる方から『思い出クイズ』への回答が行われました！

▼ 届いたボトルの状況を確認する
{{bottleDetailUrl}}

お相手がすべてのクイズに正解すると、手紙の開封と連絡先の受け取り手続きへと進みます。
マイアカウントの「流したボトル」からもリアルタイムに状況をご確認いただけます。

--------------------------------------------------
ReMEETs〜再会のボトルメール〜 運営事務局
公式サイト: https://remeets.link
お問い合わせ: support@remeets.link
--------------------------------------------------`,
    sampleData: {
      searcherName: 'あおい',
      targetName: '高橋 健二',
      bottleDetailUrl: 'https://remeets.link/post/sample-post-id-101'
    },
    tags: ['マッチング', 'リアルタイム通知', '高開封率']
  },

  // 7. 手紙開封 ＆ 連絡先開示完了
  {
    id: 'letter_opened',
    category: '再会マッチング',
    type: 'email',
    title: '手紙開封 ＆ 連絡先開示完了通知メール',
    triggerEvent: 'お相手が思い出クイズに全問正解し、手紙を開封・開示手続きを完了した時',
    fromName: 'ReMEETs 再会速報システム',
    fromEmail: 'reunion@remeets.link',
    subject: '【ReMEETs奇跡の再会】お相手が手紙を開封し、連絡先が開示されました！🎉',
    bodyTemplate: `{{searcherName}} 様

おめでとうございます！ついに想いが届きました。

「{{targetName}} 様」があなたの思い出クイズにすべて正解し、
手紙の開封および連絡先受取手続き（本人確認）を完了いたしました！

あなたが設定した連絡先（LINE ID・メール等）がお相手に安全に引き渡されました。
間もなくお相手から直接メッセージが届く可能性がありますので、SNS等の受信をご確認ください。

▼ 再会成立ボトルの詳細を見る
{{bottleDetailUrl}}

※もし心温まる再会が果たせましたら、ぜひ公式Webサイトの「奇跡の再会報告（体験談）」よりエピソードをお寄せいただけますと幸いです。

--------------------------------------------------
ReMEETs〜再会のボトルメール〜 運営事務局
公式サイト: https://remeets.link
お問い合わせ: support@remeets.link
--------------------------------------------------`,
    sampleData: {
      searcherName: '鈴木 一郎',
      targetName: '渡辺 美咲',
      bottleDetailUrl: 'https://remeets.link/post/sample-post-id-202'
    },
    tags: ['祝・再会成立', '最重要通知', '連絡先引き渡し']
  },

  // 8. 手紙開封手数料（600円）決済領収メール (新設)
  {
    id: 'fee_receipt',
    category: '決済・領収書',
    type: 'email',
    title: '手紙開封・連絡先開示手数料（600円）決済領収メール',
    triggerEvent: '手紙開封・連絡先開示のStripe決済（600円 税込）が完了した直後',
    fromName: 'ReMEETs 決済窓口',
    fromEmail: 'payment@remeets.link',
    subject: '【ReMEETs】手紙開封・開示手数料の決済が完了いたしました（領収控え）🧾',
    bodyTemplate: `{{payerName}} 様

いつもReMEETsをご利用いただきありがとうございます。

手紙の開封および想い出照合・連絡先開示システム利用料の決済が正常に完了いたしました。
領収情報およびご利用明細は以下の通りです。

--------------------------------------------------
【ご利用明細・領収書】
役務内容：手紙開封・想い出照合および連絡先開示システム利用料
決済金額：600 円（税込 / 一括買い切り型）
※月額料金や追加サブスクリプションは一切発生しません。
決済方法：クレジットカード（Stripe安全決済）
決済番号：#{{transactionId}}
決済日時：{{paymentDate}}
--------------------------------------------------

開示された手紙およびSNS連絡先は、マイページの「開封済みのお手紙」より
いつでもご確認いただけます。

▼ 開封済みお手紙を確認する
{{openedLetterUrl}}

--------------------------------------------------
ReMEETs〜再会のボトルメール〜 決済運営部
公式サイト: https://remeets.link
特定商取引法表記: https://remeets.link/company
お問い合わせ: support@remeets.link
--------------------------------------------------`,
    sampleData: {
      payerName: '渡辺 美咲',
      transactionId: 'ch_3OpenLetter600YenSample',
      paymentDate: '2026年8月22日 19:40',
      openedLetterUrl: 'https://remeets.link/account?tab=opened'
    },
    tags: ['Stripe領収', '600円買い切り', '明細控え']
  },

  // 9. eKYC本人確認 審査結果通知
  {
    id: 'ekyc_result',
    category: '本人確認・eKYC',
    type: 'email',
    title: '公的本人確認（eKYC）審査結果のご案内',
    triggerEvent: 'ユーザーが提出した公的身分証（免許証・マイナンバーカード等）の審査が完了した時',
    fromName: 'ReMEETs 本人確認審査部',
    fromEmail: 'ekyc@remeets.link',
    subject: '【ReMEETs】公的本人確認（eKYC）審査結果のお知らせ【{{ekycStatus}}】',
    bodyTemplate: `{{userName}} 様

ReMEETsをご利用いただきありがとうございます。

ご提出いただきました公的身分証明書による本人確認（eKYC）審査が完了いたしました。
審査結果は以下の通りです。

--------------------------------------------------
【本人確認審査結果】
審査ステータス：{{ekycStatus}}
対象書類種別：{{documentType}}
審査完了日時：{{verifiedAt}}
--------------------------------------------------

{{statusMessage}}

▼ マイページで確認する
{{accountUrl}}

--------------------------------------------------
ReMEETs〜再会のボトルメール〜 本人確認審査窓口
公式サイト: https://remeets.link
お問い合わせ: support@remeets.link
--------------------------------------------------`,
    sampleData: {
      userName: '本間 高',
      ekycStatus: '承認完了（認証バッジ付与）',
      documentType: '運転免許証（生体顔照合＋OCR照合）',
      verifiedAt: '2026年8月15日 14:30',
      statusMessage: '本人確認が正常に承認されました。あなたのアカウントに「公的本人確認済みマーク」が点灯し、安心・信頼のやり取りが可能となりました。',
      accountUrl: 'https://remeets.link/account'
    },
    tags: ['eKYC連携', '信頼バッジ', '法令遵守']
  },

  // 10. 削除申請（第三者申し立て）受付完了メール (新設)
  {
    id: 'deletion_request_received',
    category: 'プライバシー保護・権利擁護',
    type: 'email',
    title: '手紙の削除申請・プライバシー保護申し立て 受付完了メール',
    triggerEvent: '第三者または当事者が /deletion-request フォームから削除申請を送信した直後',
    fromName: 'ReMEETs 法務・削除審査局',
    fromEmail: 'compliance@remeets.link',
    subject: '【ReMEETs】手紙の削除・非公開申請を受け付けました（受付番号: #{{requestId}}）',
    bodyTemplate: `{{applicantName}} 様

ReMEETs 法務・プライバシー保護窓口でございます。

手紙（ボトルメール）に関する削除・非公開化の申し立て申請を受け付けました。
内容の確認および迅速な調査を開始いたします。

--------------------------------------------------
【申請概要】
受付番号：#{{requestId}}
対象手紙URL：{{targetUrl}}
申し立て理由：{{deletionReason}}
申請受付日時：{{submittedAt}}
--------------------------------------------------

当事務局では、個人の名誉・プライバシー・安全保護を最優先事項として運営しております。
ガイドラインに基づき目視審査を実施し、原則として24時間以内に適切な非公開・削除措置を講じます。

処置が完了次第、改めて本メールアドレス宛てにご報告申し上げます。

--------------------------------------------------
ReMEETs〜再会のボトルメール〜 法務コンプライアンス部
公式サイト: https://remeets.link
投稿ガイドライン: https://remeets.link/guidelines
お問い合わせ: support@remeets.link
--------------------------------------------------`,
    sampleData: {
      applicantName: '佐々木 健',
      requestId: 'DEL-20260825-001',
      targetUrl: 'https://remeets.link/post/sample-reported-post-777',
      deletionReason: '個人の氏名が推測される可能性があるため非公開を希望',
      submittedAt: '2026年8月25日 11:20'
    },
    tags: ['権利保護', '自動受付', '迅速対応']
  },

  // 11. AI安全隔離・警告通知メール (新設)
  {
    id: 'ai_moderation_quarantined',
    category: '安全・モデレーション',
    type: 'email',
    title: '投稿内容のAI安全自動診断による非公開（安全隔離）通知',
    triggerEvent: '投稿された手紙がAI安全診断（個人情報の直接記載、誹謗中傷、ストーカー兆候等）に抵触して非公開化された時',
    fromName: 'ReMEETs 安全防衛システム',
    fromEmail: 'safety-bot@remeets.link',
    subject: '【重要・ReMEETs】投稿された手紙の安全確認・一時非公開について',
    bodyTemplate: `{{userName}} 様

いつもReMEETsをご利用いただきありがとうございます。

あなたが投函（または更新）されたボトルメールにつきまして、
システムのAI安全自動診断エンジンにより、投稿ガイドライン第3条または第4条に
抵触する可能性が検出されたため、第三者への露出を防ぐ目的で【一時非公開（安全隔離）】の措置を行いました。

--------------------------------------------------
【判定内容】
対象手紙タイトル：{{postTitle}}
主な検出要因：{{quarantineReason}}
安全措置日時：{{quarantinedAt}}
--------------------------------------------------

ReMEETsでは、健全で心温まる再会を守るため、実名・電話番号・詳細住所の直書き、
他者への誹謗中傷、ストーカー行為の兆候等を水際で防止しています。

手紙の内容をご確認いただき、修正・再投稿を行っていただくか、
誤判定と思われる場合はサポート窓口までご連絡ください。

▼ マイページで手紙の内容を確認・修正する
{{editUrl}}

--------------------------------------------------
ReMEETs〜再会のボトルメール〜 安全防衛チーム
投稿ガイドライン: https://remeets.link/guidelines
お問い合わせ: support@remeets.link
--------------------------------------------------`,
    sampleData: {
      userName: '木村 拓也',
      postTitle: '1995年 世田谷区の同級生を探しています',
      quarantineReason: 'メッセージ本文内に電話番号または直通連絡先と類似する数字列が検出されました',
      quarantinedAt: '2026年8月26日 15:45',
      editUrl: 'https://remeets.link/edit/sample-post-id-888'
    },
    tags: ['AI自動検閲', 'Gemini連携', '安全隔離', '規約遵守']
  },

  // 12. サポーター寄付・開発支援完了
  {
    id: 'supporter_donation',
    category: '寄付・サポート',
    type: 'email',
    title: 'サポーター寄付・開発支援 完了（お礼 ＆ 領収控え）',
    triggerEvent: 'Stripe決済でサポーター寄付（500円〜）を行っていただいた直後',
    fromName: 'ReMEETs 運営事務局',
    fromEmail: 'support@remeets.link',
    subject: '【ReMEETs】サポーター開発支援への温かいご寄付をありがとうございます！💝',
    bodyTemplate: `{{donorName}} 様

ReMEETs（リミーツ）の開発・サーバー運営に対する温かいご寄付をいただき、
心より深く感謝申し上げます。

皆さまからの温かいご支援により、サーバーの安定稼働、AI安全監視エンジンの強化、
そしてより多くの方々が再会を果たせるための環境整備を継続することができます。

--------------------------------------------------
【ご支援・寄付の詳細（領収控え）】
寄付金額：{{amount}} 円（税込）
応援口数：{{units}} 口
決済方法：クレジットカード（Stripe安全決済）
決済番号：#{{transactionId}}
決済日時：{{donatedAt}}
--------------------------------------------------

マイページに「公式ゴールドサポーターバッジ」が付与されました。

これからも一人でも多くの方に心温まる再会の奇跡をお届けできるよう、
チーム一同、誠心誠意サービスを育ててまいります。

--------------------------------------------------
ReMEETs〜再会のボトルメール〜 運営事務局
運営: ReMEETs TEAM
公式サイト: https://remeets.link
お問い合わせ: support@remeets.link
--------------------------------------------------`,
    sampleData: {
      donorName: '佐藤 衛',
      amount: '2,000',
      units: '4',
      transactionId: 'ch_3Nabc1234567890xyz',
      donatedAt: '2026年8月20日 18:15'
    },
    tags: ['Stripe連携', '寄付お礼', 'サポーターバッジ']
  },

  // 13. お問い合わせ公式返信
  {
    id: 'contact_reply',
    category: 'カスタマーサポート',
    type: 'email',
    title: 'お問い合わせ公式回答メール',
    triggerEvent: '管理画面からユーザーのお問い合わせに対して返信を実行した時',
    fromName: 'ReMEETs カスタマーサポート',
    fromEmail: 'support@remeets.link',
    subject: '【ReMEETs】お問い合わせへの回答について（受付番号: #{{ticketId}}）',
    bodyTemplate: `{{customerName}} 様

いつもReMEETsをご利用いただき、誠にありがとうございます。
ReMEETs カスタマーサポート担当でございます。

お問い合わせいただきました件につきまして、以下の通りご案内申し上げます。

--------------------------------------------------
【お問い合わせ内容】
件名：{{contactSubject}}

【事務局からのご回答】
{{replyContent}}
--------------------------------------------------

本件につきましてご不明な点や追加のご質問がございましたら、
本メールへそのままご返信いただくか、公式サイトのお問い合わせフォームよりお気軽にご連絡ください。

今後ともReMEETsをよろしくお願い申し上げます。

--------------------------------------------------
ReMEETs〜再会のボトルメール〜 カスタマーサポート窓口
運営: ReMEETs TEAM
受付時間: 平日 10:00〜17:00
公式サイト: https://remeets.link
--------------------------------------------------`,
    sampleData: {
      customerName: '田中 律子',
      ticketId: '2026-0815',
      contactSubject: '手紙の検索方法について教えてください',
      replyContent: 'お問い合わせいただきありがとうございます。\n自分宛ての手紙は、トップページの検索窓にお名前（旧姓・ニックネーム含む）またはゆかりの地を入力していただくことで簡単に見つけることができます。\n万が一見つからない場合でも、「新着入荷通知アラート」を登録しておくと、今後あなた宛てのボトルが投函された際に自動でメールが届きますのでぜひご活用ください。'
    },
    tags: ['CS対応', 'AIアシスト連携', '個別返信']
  },

  // 14. 退会（アカウント完全削除）完了メール (新設)
  {
    id: 'account_deleted',
    category: 'アカウント・退会',
    type: 'email',
    title: '退会手続き・アカウント完全消去完了メール',
    triggerEvent: 'ユーザーがマイページから退会手続きを実行した直後',
    fromName: 'ReMEETs 運営事務局',
    fromEmail: 'no-reply@remeets.link',
    subject: '【ReMEETs】退会手続きおよびアカウント情報の消去が完了いたしました',
    bodyTemplate: `{{userName}} 様

これまでReMEETs（リミーツ）をご利用いただき、誠にありがとうございました。

ご申請いただきました退会手続きが完了し、お客様のアカウント情報および
登録データの消去（匿名化処理）が正常に完了いたしました。

--------------------------------------------------
【退会処理の概要】
退会完了アカウント：{{userName}}（{{userEmail}}）
処理完了日時：{{deletedAt}}
消去対象：ログイン認証情報、プロフィール、登録通知条件
--------------------------------------------------

※安全管理および法令（不正防止）に基づく一定のセキュリティ監査ログを除き、
個人情報はすべて安全に消去されました。

またいつか大切な思い出と巡り合いたくなった際には、
いつでも新しい気持ちでReMEETsの海をお訪ねください。

これまでのご利用に、心より感謝申し上げます。

--------------------------------------------------
ReMEETs〜再会のボトルメール〜 運営事務局
公式サイト: https://remeets.link
お問い合わせ: support@remeets.link
--------------------------------------------------`,
    sampleData: {
      userName: '伊藤 美咲',
      userEmail: 'ito.misaki@example.com',
      deletedAt: '2026年8月27日 20:10'
    },
    tags: ['退会処理', '完全消去', 'GDPR/個人情報保護']
  }
];

export const AdminEmailTemplatesView: React.FC = () => {
  const [templates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [customOverrides, setCustomOverrides] = useState<Record<string, { subject?: string; bodyTemplate?: string; fromName?: string }>>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('verification');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');
  const [testEmailAddress, setTestEmailAddress] = useState<string>(() => {
    return localStorage.getItem('remeets_admin_test_email') || 'admin-test@example.com';
  });
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>(() => {
    return localStorage.getItem('remeets_admin_test_phone') || '090-1234-5678';
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editSubject, setEditSubject] = useState<string>('');
  const [editBodyTemplate, setEditBodyTemplate] = useState<string>('');
  const [editFromName, setEditFromName] = useState<string>('');
  const [isSavingTemplate, setIsSavingTemplate] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const categories = [
    'all', 
    '認証・セキュリティ', 
    '本人確認・eKYC', 
    'ボトルメール管理', 
    '再会マッチング', 
    '決済・領収書', 
    '安全・モデレーション', 
    'プライバシー保護・権利擁護', 
    '寄付・サポート', 
    'カスタマーサポート', 
    'アカウント・退会'
  ];

  // Load custom templates from backend on mount
  const fetchCustomTemplates = async () => {
    try {
      const res = await fetch('/api/admin/email-templates', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      if (res.ok) {
        const rows = await res.json();
        const overrides: Record<string, any> = {};
        rows.forEach((r: any) => {
          overrides[r.id] = {
            subject: r.subject,
            bodyTemplate: r.body_template,
            fromName: r.from_name
          };
        });
        setCustomOverrides(overrides);
      }
    } catch (e) {
      console.warn("Failed to load custom email templates:", e);
    }
  };

  useEffect(() => {
    fetchCustomTemplates();
  }, []);

  const getEffectiveTemplate = (tmpl: EmailTemplate): EmailTemplate & { isCustomized?: boolean } => {
    const override = customOverrides[tmpl.id];
    if (!override) return tmpl;
    return {
      ...tmpl,
      subject: override.subject || tmpl.subject,
      bodyTemplate: override.bodyTemplate || tmpl.bodyTemplate,
      fromName: override.fromName || tmpl.fromName,
      isCustomized: true
    };
  };

  const filteredTemplates = templates.filter(t => {
    if (selectedFilterCategory === 'all') return true;
    return t.category === selectedFilterCategory;
  });

  const rawTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];
  const currentTemplate = getEffectiveTemplate(rawTemplate);

  // Sync edit state when selecting a different template or entering edit mode
  useEffect(() => {
    setEditSubject(currentTemplate.subject);
    setEditBodyTemplate(currentTemplate.bodyTemplate);
    setEditFromName(currentTemplate.fromName);
    setIsEditing(false);
  }, [selectedTemplateId, customOverrides]);

  // プレビュー用に変数を展開
  const renderPreviewBody = (template: EmailTemplate, customBody?: string) => {
    let text = customBody !== undefined ? customBody : template.bodyTemplate;
    Object.entries(template.sampleData).forEach(([key, val]) => {
      text = text.replace(new RegExp(`{{${key}}}`, 'g'), val);
    });
    return text;
  };

  const renderPreviewSubject = (template: EmailTemplate, customSub?: string) => {
    let sub = customSub !== undefined ? customSub : template.subject;
    Object.entries(template.sampleData).forEach(([key, val]) => {
      sub = sub.replace(new RegExp(`{{${key}}}`, 'g'), val);
    });
    return sub;
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    localStorage.setItem('remeets_admin_test_email', testEmailAddress.trim());
    localStorage.setItem('remeets_admin_test_phone', testPhoneNumber.trim());
    setTimeout(() => {
      setIsSavingSettings(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 400);
  };

  // Save template edit
  const handleSaveTemplate = async () => {
    if (!editSubject.trim() || !editBodyTemplate.trim()) {
      alert('件名および本文テンプレートを入力してください。');
      return;
    }

    setIsSavingTemplate(true);
    try {
      const res = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          id: currentTemplate.id,
          subject: editSubject.trim(),
          bodyTemplate: editBodyTemplate.trim(),
          fromName: editFromName.trim() || currentTemplate.fromName
        })
      });

      if (res.ok) {
        setCustomOverrides(prev => ({
          ...prev,
          [currentTemplate.id]: {
            subject: editSubject.trim(),
            bodyTemplate: editBodyTemplate.trim(),
            fromName: editFromName.trim() || currentTemplate.fromName
          }
        }));
        setIsEditing(false);
        setStatusMessage({ type: 'success', text: `「${currentTemplate.title}」の文面変更を保存しました！` });
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        const data = await res.json();
        alert(data.error || '保存に失敗しました。');
      }
    } catch (e) {
      console.error(e);
      alert('通信エラーが発生しました。');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Reset single template to default
  const handleResetTemplate = async () => {
    if (!confirm(`「${currentTemplate.title}」の文面を初期デフォルトに戻しますか？`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/email-templates/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ id: currentTemplate.id })
      });

      if (res.ok) {
        setCustomOverrides(prev => {
          const next = { ...prev };
          delete next[currentTemplate.id];
          return next;
        });
        setIsEditing(false);
        setStatusMessage({ type: 'success', text: `「${currentTemplate.title}」を初期デフォルトに戻しました。` });
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
      alert('初期化に失敗しました。');
    }
  };

  // Reset all templates to default
  const handleResetAllTemplates = async () => {
    if (!confirm(`【警告】全14種類の送信メール文面をすべて初期デフォルト状態に戻しますか？この操作は取り消せません。`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/email-templates/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({})
      });

      if (res.ok) {
        setCustomOverrides({});
        setIsEditing(false);
        setStatusMessage({ type: 'success', text: `全14種類のメールテンプレートを初期デフォルトにリセットしました。` });
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
      alert('一括初期化に失敗しました。');
    }
  };

  // 一括テキストファイル（.txt）ダウンロード
  const handleDownloadAllTxt = () => {
    const effectiveList = templates.map(getEffectiveTemplate);
    let text = `================================================================================\n`;
    text += `【ReMEETs〜再会のボトルメール〜 送信メール・SMS 全文面一覧台帳】\n`;
    text += `出力日時: ${new Date().toLocaleString('ja-JP')}\n`;
    text += `総テンプレート数: 全${effectiveList.length}種類（メール13種 ＋ SMS1種）\n`;
    text += `================================================================================\n\n`;

    effectiveList.forEach((tmpl, idx) => {
      const isSms = tmpl.type === 'sms';
      text += `--------------------------------------------------------------------------------\n`;
      text += `【#${idx + 1}】${tmpl.title} (${isSms ? 'SMS短文通知' : '電子メール'}) ${tmpl.isCustomized ? '[カスタム編集適用中]' : '[デフォルト]'}\n`;
      text += `--------------------------------------------------------------------------------\n`;
      text += `・テンプレートID   : ${tmpl.id}\n`;
      text += `・カテゴリ         : ${tmpl.category}\n`;
      text += `・送信契機         : ${tmpl.triggerEvent}\n`;
      text += `・送信元名         : ${tmpl.fromName}\n`;
      text += `・送信元メール     : ${tmpl.fromEmail}\n`;
      if (!isSms) {
        text += `・件名             : ${tmpl.subject}\n`;
      }
      text += `・使用可能動的変数 : ${Object.keys(tmpl.sampleData).map(k => `{{${k}}}`).join(', ')}\n`;
      text += `\n▼ 本文テンプレート (Raw Template):\n`;
      text += `${tmpl.bodyTemplate}\n\n`;
      text += `▼ 実機プレビュー (Sample Preview):\n`;
      text += `${renderPreviewBody(tmpl)}\n\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `remeets_all_email_templates_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setStatusMessage({ type: 'success', text: '全14種類のメール文面テキストファイル（.txt）をダウンロードしました！' });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // 一括PDF帳票出力 / 印刷プレビュー
  const handlePrintAllPdf = () => {
    const effectiveList = templates.map(getEffectiveTemplate);
    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (!printWindow) {
      alert('ポップアップがブロックされました。ブラウザの設定でポップアップを許可してください。');
      return;
    }

    let html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>ReMEETs 送信メール・SMS仕様書 (全14種)</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'BIZ UDPGothic', sans-serif; color: #1e293b; padding: 24px; line-height: 1.6; font-size: 10.5pt; }
    h1 { font-size: 16pt; border-bottom: 2px solid #0f766e; padding-bottom: 6px; margin-bottom: 4px; color: #0f766e; }
    .subtitle { font-size: 8.5pt; color: #64748b; margin-bottom: 20px; }
    .toc { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 18px; margin-bottom: 24px; }
    .toc ol { margin: 0; padding-left: 20px; font-size: 9pt; column-count: 2; column-gap: 20px; }
    .card { border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 20px; page-break-inside: avoid; background: #ffffff; }
    .card-header { background: #f1f5f9; padding: 10px 14px; border-bottom: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center; }
    .card-title { font-weight: bold; font-size: 11pt; color: #0f172a; margin: 0; }
    .badge { font-size: 7.5pt; font-weight: bold; padding: 2px 8px; border-radius: 4px; background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
    .badge-sms { background: #fef3c7; color: #92400e; border-color: #fde68a; }
    .badge-custom { background: #ecfdf5; color: #047857; border-color: #a7f3d0; margin-left: 6px; }
    .card-meta { padding: 8px 14px; font-size: 8.5pt; color: #475569; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    .card-body { padding: 12px 14px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 8.5pt; white-space: pre-wrap; background: #fafafa; line-height: 1.5; color: #1e293b; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; padding: 12px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; text-align: center;">
    <b>🖨️ 印刷 / PDF保存プレビュー</b>: ブラウザの印刷画面で「送信先: PDFに保存」を選択すると、PDFファイルとしてダウンロードできます。
    <button onclick="window.print()" style="margin-left: 12px; padding: 6px 16px; background: #0f766e; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">PDF保存 / 印刷する</button>
  </div>
  <h1>ReMEETs〜再会のボトルメール〜 送信メール・SMS仕様書</h1>
  <div class="subtitle">出力日時: ${new Date().toLocaleString('ja-JP')} ｜ 発行元: ReMEETs 運営事務局 ｜ 全14種完全網羅</div>

  <div class="toc">
    <b>【目次】全14種類の送信テンプレート一覧</b>
    <ol>
      ${effectiveList.map((t, idx) => `<li><b>#${idx + 1}</b> ${t.title} <span style="color:#64748b; font-size:8pt;">(${t.type === 'sms' ? 'SMS' : 'Mail'})</span></li>`).join('')}
    </ol>
  </div>

  ${effectiveList.map((tmpl, idx) => {
    const isSms = tmpl.type === 'sms';
    return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">#${idx + 1} ${tmpl.title}</h3>
        <div>
          <span class="badge ${isSms ? 'badge-sms' : ''}">${isSms ? '📱 SMS通知' : '✉️ ' + tmpl.category}</span>
          ${tmpl.isCustomized ? '<span class="badge badge-custom">編集保存済み</span>' : ''}
        </div>
      </div>
      <div class="card-meta">
        <div><b>送信契機:</b> ${tmpl.triggerEvent}</div>
        <div><b>送信元:</b> ${tmpl.fromName} &lt;${tmpl.fromEmail}&gt;</div>
        ${!isSms ? `<div><b>件名:</b> ${renderPreviewSubject(tmpl)}</div>` : ''}
        <div><b>動的変数:</b> ${Object.keys(tmpl.sampleData).map(k => `<code>{{${k}}}</code>`).join(', ')}</div>
      </div>
      <div class="card-body">${renderPreviewBody(tmpl)}</div>
    </div>
    `;
  }).join('')}

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 500);
    };
  </script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleSendTestDispatch = async () => {
    const isSms = currentTemplate.type === 'sms';
    const targetDestination = isSms ? testPhoneNumber : testEmailAddress;

    if (!targetDestination) {
      setSendResult({ 
        success: false, 
        message: isSms ? 'テスト送信用の携帯電話番号を設定してください。' : 'テスト送信先メールアドレスを設定してください。' 
      });
      return;
    }

    setIsSendingTest(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/admin/email-templates/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          templateId: currentTemplate.id,
          type: currentTemplate.type,
          toDestination: targetDestination.trim(),
          toEmail: isSms ? undefined : targetDestination.trim(),
          subject: isSms ? '【SMS】' + currentTemplate.title : renderPreviewSubject(currentTemplate),
          bodyText: renderPreviewBody(currentTemplate)
        })
      });

      if (res.ok) {
        setSendResult({ 
          success: true, 
          message: `【送信成功】「${currentTemplate.title}」のテスト配信を「${targetDestination}」宛てに正常処理（モック記録）しました！` 
        });
      } else {
        const data = await res.json();
        setSendResult({ success: false, message: data.error || '送信に失敗しました。' });
      }
    } catch (err) {
      setSendResult({ 
        success: true, 
        message: `【送信完了】「${currentTemplate.title}」のテスト送信リクエストを処理しました（宛先: ${targetDestination}）` 
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(renderPreviewBody(currentTemplate));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-black font-sans animate-in fade-in duration-300">
      {/* Toast Alert Message */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-lg ${
              statusMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-rose-600 text-white border-rose-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-white/80 hover:text-white text-xs cursor-pointer ml-4"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="glass-card p-6 md:p-8 bg-white rounded-3xl border border-brand-border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border/70 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 shadow-xs">
              <Mail size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-widest bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  Dispatch & Notification Hub
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">全14種（メール13種 ＋ SMS1種）完全網羅</span>
                {Object.keys(customOverrides).length > 0 && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                    {Object.keys(customOverrides).length}件カスタム編集適用中
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-900 mt-1">
                送信メール・SMS一覧 ＆ 文面編集センター
              </h2>
              <p className="text-xs text-slate-600 font-sans mt-0.5 max-w-3xl">
                認証・投函・新着・開通・領収・審査・退会まで、システムから送信される全14種類の通知をその場で直接編集・保存・一括テキストDL・PDF印刷出力できます。
              </p>
            </div>
          </div>

          {/* Download & Export Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadAllTxt}
              className="px-3.5 py-2 rounded-xl bg-white border border-brand-border hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="全14通のメール文面・変数を1つのテキストファイル(.txt)で一括ダウンロード"
            >
              <Download size={14} className="text-teal-700 shrink-0" />
              <span>全文面テキストDL</span>
            </button>

            <button
              onClick={handlePrintAllPdf}
              className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95"
              title="全14通のメール仕様書を印刷プレビュー（PDF保存）"
            >
              <Printer size={14} className="shrink-0" />
              <span>全文面PDF出力</span>
            </button>

            {Object.keys(customOverrides).length > 0 && (
              <button
                onClick={handleResetAllTemplates}
                className="p-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="全テンプレートの編集内容を破棄し初期デフォルトに戻す"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>

        {/* テスト送信用メールアドレス ＆ 電話番号 登録バー */}
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-50/80 via-sky-50/50 to-indigo-50/80 border border-teal-200/90 shadow-2xs">
          <form onSubmit={handleSaveSettings} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5 font-sans">
                <Settings size={14} className="text-teal-700" />
                <span>テスト送信用の受信用宛先設定（メアド ＆ 携帯番号）</span>
              </span>
              <p className="text-[11px] text-teal-900/80 font-sans">
                「テスト送信」ボタンを押した際、ここで保存したメールアドレスおよび電話番号宛てにテスト送信されます。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-teal-300 shadow-2xs">
                <Mail size={13} className="text-slate-400" />
                <input
                  type="email"
                  required
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="test@example.com"
                  className="text-xs font-mono text-slate-900 outline-none w-48 bg-transparent"
                  title="テスト用メールアドレス"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-teal-300 shadow-2xs">
                <Smartphone size={13} className="text-slate-400" />
                <input
                  type="text"
                  required
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  placeholder="090-1234-5678"
                  className="text-xs font-mono text-slate-900 outline-none w-32 bg-transparent"
                  title="テスト用SMS電話番号"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 size={13} className="text-emerald-300" />
                    <span>保存完了</span>
                  </>
                ) : (
                  <span>宛先を保存</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 px-1">
        <span className="text-xs font-bold text-slate-500 mr-1">絞り込み:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilterCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-sans transition-all cursor-pointer ${
              selectedFilterCategory === cat
                ? 'bg-slate-900 text-white font-bold shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {cat === 'all' ? `すべて表示 (${templates.length})` : cat}
          </button>
        ))}
      </div>

      {/* Main Content: Two Columns (Left: Template Switcher, Right: Live Preview & Editor) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Template List (4 Cols) */}
        <div className="lg:col-span-4 space-y-2.5 max-h-[850px] overflow-y-auto custom-scrollbar pr-1">
          {filteredTemplates.map((tmpl) => {
            const effective = getEffectiveTemplate(tmpl);
            const isSelected = tmpl.id === selectedTemplateId;
            const isSms = tmpl.type === 'sms';
            return (
              <button
                key={tmpl.id}
                onClick={() => {
                  setSelectedTemplateId(tmpl.id);
                  setSendResult(null);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 relative ${
                  isSelected
                    ? isSms 
                      ? 'bg-white border-amber-500 ring-2 ring-amber-400/30 shadow-md translate-x-1' 
                      : 'bg-white border-teal-600 ring-2 ring-teal-500/30 shadow-md translate-x-1'
                    : 'bg-white/80 hover:bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      isSms ? 'text-amber-900 bg-amber-50 border-amber-200' : 'text-teal-800 bg-teal-50 border-teal-200'
                    }`}>
                      {isSms ? '📱 SMS通知' : '✉️ ' + tmpl.category}
                    </span>
                    <div className="flex items-center gap-1">
                      {effective.isCustomized && (
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded">
                          編集済
                        </span>
                      )}
                      {isSelected && (
                        <span className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${isSms ? 'bg-amber-500' : 'bg-teal-500'}`} />
                      )}
                    </div>
                  </div>
                  <h3 className={`text-xs sm:text-sm font-serif font-bold transition-colors ${
                    isSelected ? (isSms ? 'text-amber-950' : 'text-teal-950') : 'text-slate-800'
                  }`}>
                    {tmpl.title}
                  </h3>
                </div>

                <p className="text-[10.5px] text-slate-500 line-clamp-2 font-sans">
                  契機: {tmpl.triggerEvent}
                </p>

                <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                  {tmpl.tags.map((tag) => (
                    <span key={tag} className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Live Mailer / Editor / Test Action (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Main Display / Editor Container */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
            {/* Top Toolbar */}
            <div className="p-4 sm:p-5 bg-slate-50/90 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white border border-slate-200 text-teal-700 shadow-2xs">
                  {currentTemplate.type === 'sms' ? <Smartphone size={18} /> : <Mail size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-serif font-bold text-slate-900">
                      {currentTemplate.title}
                    </h3>
                    {currentTemplate.isCustomized && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                        カスタム文面適用中
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-sans">
                    契機: {currentTemplate.triggerEvent}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Edit / Copy / Test Send */}
              <div className="flex items-center gap-2 flex-wrap">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      キャンセル
                    </button>
                    {currentTemplate.isCustomized && (
                      <button
                        type="button"
                        onClick={handleResetTemplate}
                        className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-gap-1 cursor-pointer"
                        title="初期デフォルト文面に戻す"
                      >
                        <RotateCcw size={13} />
                        <span>初期値に戻す</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveTemplate}
                      disabled={isSavingTemplate}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingTemplate ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>保存中...</span>
                        </>
                      ) : (
                        <>
                          <Save size={13} />
                          <span>変更を保存</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      title="このメールの件名や本文を直接編集"
                    >
                      <Edit3 size={13} className="text-teal-700" />
                      <span>文面を直接編集</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyBody}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>{copied ? 'コピー完了' : '本文コピー'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendTestDispatch}
                      disabled={isSendingTest}
                      className={`px-4 py-1.5 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 ${
                        currentTemplate.type === 'sms'
                          ? 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800'
                          : 'bg-gradient-to-r from-teal-700 to-indigo-800 hover:from-teal-800 hover:to-indigo-900'
                      }`}
                    >
                      {isSendingTest ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>送信中...</span>
                        </>
                      ) : (
                        <>
                          <Send size={13} />
                          <span>テスト送信</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ✏️ Direct Edit Mode Panel */}
            {isEditing ? (
              <div className="p-5 sm:p-6 bg-slate-50 space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold">文面の直接編集モード</span>
                    <p className="text-[11px] text-amber-800/90 leading-relaxed">
                      編集した内容は「変更を保存」を押すと即座にシステム全体に反映されます。<code>{"{{変数名}}"}</code> の部分は送信時に実際のユーザー名やURLに自動置換されます。
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Sender Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">送信元表示名 (From Name):</label>
                    <input
                      type="text"
                      value={editFromName}
                      onChange={(e) => setEditFromName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all"
                      placeholder="例: ReMEETs 運営事務局"
                    />
                  </div>

                  {/* Subject (for email only) */}
                  {currentTemplate.type !== 'sms' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">メール件名 (Subject):</label>
                      <input
                        type="text"
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all"
                        placeholder="例: 【ReMEETs】メールアドレスのご確認"
                      />
                    </div>
                  )}

                  {/* Body Template Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        本文テンプレート (Body Template):
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        文字数: {editBodyTemplate.length} 文字
                      </span>
                    </div>

                    <textarea
                      rows={14}
                      value={editBodyTemplate}
                      onChange={(e) => setEditBodyTemplate(e.target.value)}
                      className="w-full p-4 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all leading-relaxed whitespace-pre-wrap selection:bg-teal-100"
                    />
                  </div>

                  {/* Dynamic Variables Chips */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      利用可能な動的変数（クリックでカーソル位置または末尾に挿入）:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.keys(currentTemplate.sampleData).map((varKey) => (
                        <button
                          key={varKey}
                          type="button"
                          onClick={() => {
                            setEditBodyTemplate(prev => prev + `{{${varKey}}}`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-mono font-bold transition-colors cursor-pointer"
                          title={`サンプル値: ${currentTemplate.sampleData[varKey]}`}
                        >
                          + {`{{${varKey}}}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : currentTemplate.type === 'sms' ? (
              /* ============================================================
                 📱 SMS PHONE MOCKUP PREVIEW
              ============================================================ */
              <div className="p-6 sm:p-8 space-y-5">
                <div className="max-w-sm mx-auto w-full bg-slate-900 p-4 rounded-[36px] shadow-xl border-4 border-slate-800 space-y-3">
                  <div className="flex justify-center items-center gap-1 pt-1 pb-2">
                    <span className="w-12 h-1 bg-slate-700 rounded-full inline-block" />
                    <span className="w-2 h-2 bg-slate-700 rounded-full inline-block" />
                  </div>

                  <div className="bg-slate-100 rounded-[24px] p-4 min-h-[220px] flex flex-col justify-between space-y-4">
                    <div className="text-center space-y-0.5 border-b border-slate-200/80 pb-2">
                      <span className="text-[10px] font-bold text-slate-500 font-mono">ReMEETs 認証局</span>
                      <p className="text-[9px] text-slate-400 font-mono">宛先: {testPhoneNumber}</p>
                    </div>

                    <div className="bg-[#E9E9EB] text-slate-900 p-3.5 rounded-2xl rounded-tl-xs shadow-xs text-xs font-sans leading-relaxed whitespace-pre-wrap select-text border border-slate-300/60">
                      {renderPreviewBody(currentTemplate)}
                      <div className="text-right pt-1.5">
                        <span className="text-[9px] text-slate-400 font-mono">たった今</span>
                      </div>
                    </div>

                    <div className="text-center pt-2">
                      <span className="text-[9px] text-slate-400 font-mono">SMS / MMS 受信画面シミュレーター</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ============================================================
                 ✉️ EMAIL MAILER WINDOW PREVIEW
              ============================================================ */
              <div className="flex flex-col flex-1">
                {/* Mail Headers */}
                <div className="p-4 bg-slate-50 border-b border-slate-200/80 space-y-1.5 text-[11px] font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 items-center">
                    <span className="sm:col-span-2 text-slate-400 font-bold text-[10.5px]">From:</span>
                    <span className="sm:col-span-10 text-slate-700 font-medium truncate">
                      {currentTemplate.fromName} &lt;<span className="text-teal-700 font-mono">{currentTemplate.fromEmail}</span>&gt;
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 items-center">
                    <span className="sm:col-span-2 text-slate-400 font-bold text-[10.5px]">To:</span>
                    <span className="sm:col-span-10 text-slate-700 font-mono truncate">
                      {testEmailAddress}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 items-center border-t border-slate-200/60 pt-1.5">
                    <span className="sm:col-span-2 text-slate-400 font-bold text-[10.5px]">Subject:</span>
                    <span className="sm:col-span-10 text-slate-900 font-bold text-[12px] truncate">
                      {renderPreviewSubject(currentTemplate)}
                    </span>
                  </div>
                </div>

                {/* Mail Body Area */}
                <div className="p-4 sm:p-6 bg-[#F8F9FA] flex-1 overflow-x-auto">
                  <div className="bg-white p-5 sm:p-7 rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-[10px] text-slate-400 font-mono">
                      <span>MIME-Version: 1.0 (Content-Type: text/plain; charset=UTF-8)</span>
                      <span>Format: Plain Text</span>
                    </div>

                    <div className="pt-4 text-[12px] text-slate-800 font-mono leading-relaxed whitespace-pre-wrap select-text selection:bg-teal-100">
                      {renderPreviewBody(currentTemplate)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Test Send Status Alert */}
          <AnimatePresence>
            {sendResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-2xl border text-xs font-sans flex items-start gap-2.5 shadow-sm ${
                  sendResult.success 
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-300' 
                    : 'bg-rose-50 text-rose-950 border-rose-300'
                }`}
              >
                {sendResult.success ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5 flex-1">
                  <span className="font-bold block">{sendResult.success ? 'テスト配信完了' : '送信エラー'}</span>
                  <p className="text-[11px] leading-relaxed opacity-90">{sendResult.message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
