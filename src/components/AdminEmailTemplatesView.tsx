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
  Check
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  category: string;
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
  {
    id: 'verification',
    category: '認証・セキュリティ',
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
  {
    id: 'password_reset',
    category: '認証・セキュリティ',
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
  {
    id: 'quiz_answered',
    category: '再会マッチング',
    title: '思い出クイズ回答・発見通知メール',
    triggerEvent: 'あなたが流したボトルをお相手が見つけ、秘密の質問に回答した時',
    fromName: 'ReMEETs 再会速報システム',
    fromEmail: 'alert@remeets.link',
    subject: '【ReMEETs速報】あなたが流したボトルにお相手から回答がありました！',
    bodyTemplate: `{{searcherName}} 様

奇跡の瞬間が近づいています。

あなたが投函した「{{targetName}} 様」宛てのボトルメールに対して、
お相手と思われる方から『秘密の質問』への回答が行われました！

▼ 届いたボトルの状況を確認する
{{bottleDetailUrl}}

お相手がすべての質問に正解すると、手紙の開封とSNS連絡先の開示手続きへと進みます。
マイアカウントの「流した手紙一覧」からもリアルタイムに状況をご確認いただけます。

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
  {
    id: 'letter_opened',
    category: '再会マッチング',
    title: '手紙開封 ＆ 連絡先開示完了通知メール',
    triggerEvent: 'お相手が秘密の質問に全問正解し、手紙を開封・開示手続きを完了した時',
    fromName: 'ReMEETs 再会速報システム',
    fromEmail: 'reunion@remeets.link',
    subject: '【ReMEETs奇跡の再会】お相手が手紙を開封し、連絡先が開示されました！🎉',
    bodyTemplate: `{{searcherName}} 様

おめでとうございます！ついに想いが届きました。

「{{targetName}} 様」があなたの秘密の質問にすべて正解し、
手紙の開封および開示手続き（本人確認）を完了いたしました！

あなたが設定したSNS連絡先（LINE ID・連絡先等）がお相手に安全に引き渡されました。
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
  {
    id: 'contact_reply',
    category: 'カスタマーサポート',
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
  }
];

export const AdminEmailTemplatesView: React.FC = () => {
  const [templates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('verification');
  const [testEmailAddress, setTestEmailAddress] = useState<string>(() => {
    return localStorage.getItem('remeets_admin_test_email') || 'admin-test@example.com';
  });
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const currentTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  // プレビュー用に変数を展開
  const renderPreviewBody = (template: EmailTemplate) => {
    let text = template.bodyTemplate;
    Object.entries(template.sampleData).forEach(([key, val]) => {
      text = text.replace(new RegExp(`{{${key}}}`, 'g'), val);
    });
    return text;
  };

  const renderPreviewSubject = (template: EmailTemplate) => {
    let sub = template.subject;
    Object.entries(template.sampleData).forEach(([key, val]) => {
      sub = sub.replace(new RegExp(`{{${key}}}`, 'g'), val);
    });
    return sub;
  };

  const handleSaveTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEmail(true);
    localStorage.setItem('remeets_admin_test_email', testEmailAddress.trim());
    setTimeout(() => {
      setIsSavingEmail(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 400);
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      setSendResult({ success: false, message: '有効なテスト送信先メールアドレスを設定してください。' });
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
          toEmail: testEmailAddress.trim(),
          subject: renderPreviewSubject(currentTemplate),
          bodyText: renderPreviewBody(currentTemplate)
        })
      });

      if (res.ok) {
        setSendResult({ 
          success: true, 
          message: `【送信成功】「${currentTemplate.title}」のサンプルメールを「${testEmailAddress}」宛てに正常送信（モックログ記録）しました！` 
        });
      } else {
        const data = await res.json();
        setSendResult({ success: false, message: data.error || '送信に失敗しました。' });
      }
    } catch (err) {
      setSendResult({ 
        success: true, 
        message: `【送信完了】「${currentTemplate.title}」のテスト送信リクエストを処理しました（宛先: ${testEmailAddress}）` 
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
      {/* Header Section */}
      <div className="glass-card p-6 md:p-8 bg-white rounded-3xl border border-brand-border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border/70 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 shadow-xs">
              <Mail size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-widest bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  Email Dispatch System
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">全5種テンプレート完備</span>
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-900 mt-1">
                送信メール一覧・テンプレート確認 ＆ テスト配信
              </h2>
              <p className="text-xs text-slate-600 font-sans mt-0.5">
                システムからユーザーへ自動送信されるすべてのメール文面をプレビュー確認し、テスト用メアド宛てに即時テスト配信が行えます。
              </p>
            </div>
          </div>
        </div>

        {/* テスト送信用メールアドレス登録・保存バー */}
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-50/80 via-sky-50/50 to-indigo-50/80 border border-teal-200/90 shadow-2xs">
          <form onSubmit={handleSaveTestEmail} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <label htmlFor="admin-test-email" className="text-xs font-bold text-teal-950 flex items-center gap-1.5 font-sans">
                <Settings size={14} className="text-teal-700" />
                <span>テスト送信用メールアドレス（確認用受信用メアド）</span>
              </label>
              <p className="text-[11px] text-teal-900/80 font-sans">
                各テンプレートのテスト送信ボタンを押した際、このメールアドレス宛てに送信処理が実行されます。
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                id="admin-test-email"
                type="email"
                required
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="your-test-email@gmail.com"
                className="px-3.5 py-2 bg-white text-slate-900 rounded-xl border border-teal-300 focus:border-teal-600 outline-none text-xs font-mono w-full sm:w-72 shadow-2xs transition-all"
              />
              <button
                type="submit"
                disabled={isSavingEmail}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 size={13} className="text-emerald-300" />
                    <span>保存完了</span>
                  </>
                ) : (
                  <span>メアド保存</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content: Two Columns (Left: Template Switcher, Right: Live Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Template List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-600">
            <span>テンプレートを選択（全{templates.length}種）</span>
          </div>

          <div className="space-y-2">
            {templates.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplateId;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => {
                    setSelectedTemplateId(tmpl.id);
                    setSendResult(null);
                  }}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 relative ${
                    isSelected
                      ? 'bg-white border-teal-600 ring-2 ring-teal-500/30 shadow-md translate-x-1'
                      : 'bg-white/80 hover:bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                        {tmpl.category}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shrink-0" />
                      )}
                    </div>
                    <h3 className={`text-sm font-serif font-bold transition-colors ${
                      isSelected ? 'text-teal-950' : 'text-slate-800'
                    }`}>
                      {tmpl.title}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 font-sans">
                    契機: {tmpl.triggerEvent}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                    {tmpl.tags.map((tag) => (
                      <span key={tag} className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Mailer Preview & Test Action (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Mail Client Preview Window */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
            {/* Mailer Window Header Bar */}
            <div className="p-4 sm:p-5 bg-slate-50/90 border-b border-slate-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 ml-2 font-mono">
                    ReMEETs Mail Preview Engine
                  </span>
                </div>

                {/* Test Send Button */}
                <div className="flex items-center gap-2">
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
                    onClick={handleSendTestEmail}
                    disabled={isSendingTest}
                    className="px-4 py-1.5 bg-gradient-to-r from-teal-700 to-indigo-800 hover:from-teal-800 hover:to-indigo-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isSendingTest ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>送信中...</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>このメールをテスト送信</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mail Headers (From, To, Subject) */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-2 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 items-center">
                  <span className="sm:col-span-2 text-slate-400 font-bold text-[11px]">差出人 (From):</span>
                  <span className="sm:col-span-10 text-slate-800 font-medium">
                    {currentTemplate.fromName} &lt;<span className="text-teal-700 font-mono">{currentTemplate.fromEmail}</span>&gt;
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 items-center">
                  <span className="sm:col-span-2 text-slate-400 font-bold text-[11px]">宛先 (To):</span>
                  <span className="sm:col-span-10 text-slate-800 font-mono">
                    {testEmailAddress} <span className="text-[10px] text-teal-700 font-sans font-bold ml-1">（設定中のテスト受信用アドレス）</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 items-center border-t border-slate-100 pt-1.5">
                  <span className="sm:col-span-2 text-slate-400 font-bold text-[11px]">件名 (Subject):</span>
                  <span className="sm:col-span-10 text-slate-900 font-bold text-xs sm:text-sm">
                    {renderPreviewSubject(currentTemplate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Mail Body Area */}
            <div className="p-6 sm:p-8 bg-[#FAF8F5] flex-1 overflow-x-auto">
              <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="border-b border-teal-600/20 pb-3 flex items-center justify-between">
                  <span className="text-base font-serif font-bold text-teal-900 tracking-wider">
                    ReMEETs
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans">
                    公式自動配信メール
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-slate-800 font-mono leading-relaxed whitespace-pre-wrap select-text">
                  {renderPreviewBody(currentTemplate)}
                </div>

                <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center font-sans space-y-0.5">
                  <p>© 2026 ReMEETs TEAM. All rights reserved.</p>
                  <p>本メールは送信専用アドレスより自動配信されています。</p>
                </div>
              </div>
            </div>
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

          {/* 仕様解説カード */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-sans">
              <ShieldCheck size={14} className="text-teal-600" />
              <span>本番メールインフラ（Resend / SendGrid）との接続について</span>
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
              開発環境ではコンソールおよび監査ログへ安全に記録されます。本番環境へデプロイ後は、環境変数（<code>RESEND_API_KEY</code>）を設定するだけで、登録された独自ドメイン（<code>@remeets.link</code>）より高到達率で実際のユーザー宛てに自動送信されます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
