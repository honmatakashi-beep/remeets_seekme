import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Sparkles, Award, Coffee, HelpCircle, ArrowRight, ArrowLeft, CheckCircle2, Lock, Anchor, MessageCircle } from 'lucide-react';
import { SupportModal } from './SupportModal';
import { BackToHomeButton } from './SharedComponents';

export const SupporterPage: React.FC = () => {
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800 pb-20">
      {/* 上部ナビゲーション: トップへ戻る */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <BackToHomeButton className="mb-0" />
      </div>

      {/* ヒーローセクション */}
      <section className="relative overflow-hidden text-slate-800 py-8 md:py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide text-teal-800 shadow-2xs">
            <Coffee size={14} className="text-teal-600 shrink-0" />
            <span>ReMEETs OFFICIAL SUPPORTER & DONATION</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-serif font-bold tracking-wide sm:tracking-widest leading-relaxed max-w-full mx-auto flex flex-col items-center gap-1 sm:gap-2 px-2 text-sky-850">
            <span className="block text-center">大切な人と再会できる場所を、</span>
            <span className="block text-center">みんなの温かい支援で未来へつなぐ。</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
            ReMEETsは、もう一度会いたい大切な人との再会をつなぐボトルメールプラットフォームです。<br className="hidden md:inline" />
            営利広告に頼らず、安心・安全な治安とAI安全防衛体制を維持し続けるため、温かい活動ご支援（寄付）をお願いしております。
          </p>

          <div className="pt-2 flex flex-col items-center justify-center gap-3">
            <button
              onClick={() => setIsDonateModalOpen(true)}
              className="w-full sm:w-auto px-9 py-3.5 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-800 hover:from-amber-600 hover:via-orange-700 hover:to-amber-900 text-white font-extrabold text-base rounded-2xl shadow-md shadow-amber-950/25 hover:shadow-lg hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-amber-400/40"
            >
              <Coffee size={18} className="text-amber-100 shrink-0 drop-shadow-xs" />
              <span className="drop-shadow-xs">活動を応援する（寄付 500円〜）</span>
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200 text-slate-700 text-[11px] font-medium shadow-2xs">
              <ShieldCheck size={14} className="text-teal-600 shrink-0" />
              <span>寄付は月額サブスクではありません（自動課金なし）</span>
            </div>
          </div>
        </div>
      </section>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 mt-2 relative z-20 space-y-10">
        
        {/* 1. なぜ寄付をお願いしているのか（ストーリー・理念の深化） */}
        <section className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 space-y-6">
          <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Anchor size={24} />
            </div>
            <div>
              <span className="text-[10.5px] font-bold text-teal-700 uppercase tracking-widest block font-sans">OUR MISSION & PHILOSOPHY</span>
              <h2 className="text-lg md:text-xl font-bold font-serif text-slate-900">
                なぜ、ボトルメールの投函や検索を無料で行っているのか
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-slate-600 leading-relaxed font-sans" style={{ fontSize: '11px', lineHeight: '1.8' }}>
            <p style={{ fontSize: '11px', lineHeight: '1.8' }}>
              人生の中で、もう一度会いたい人、どうしても伝えたい感謝や昔の思い出があるとき、複雑な月額課金や広告まみれの画面は、人の温かい感情を冷めさせてしまいます。
            </p>
            <p style={{ fontSize: '11px', lineHeight: '1.8' }}>
              そのため、ReMEETsでは<strong>「手紙を流す・思い出を探す」といった基本機能をすべて永久無料</strong>でお手伝いしています。また、画面いっぱいに広がる営利広告バナーを一切排除し、純粋で温かい「思い出の海」としての独立性と静けさを保っています。
            </p>
            <p style={{ fontSize: '11px', lineHeight: '1.8' }}>
              費用が発生するのは、お互いの思い出クイズが合致し<strong>「ボトルメールを開封（連絡先・手紙を開通）する瞬間」のみ</strong>です。なりすましや悪質行為を防ぐ公的本人確認（eKYC）の実費と、システム運用費用の一部として開通手数料（600円）をご負担いただく仕組みをとっています。
            </p>

            <div className="p-3 bg-sky-50/70 border-l-4 border-sky-600 rounded-r-xl font-serif text-slate-800 space-y-1 my-2.5">
              <p className="font-bold text-sky-950" style={{ fontSize: '11px' }}>「安全な海を維持するためのセキュリティ費用とAI防衛費」</p>
              <p className="font-sans text-slate-600 leading-relaxed" style={{ fontSize: '10.5px', lineHeight: '1.7' }}>
                実名や詳細住所の漏洩、誹謗中傷、ストーカー行為等の不適切投稿を24時間体制で水際検知・安全隔離する高度なAI安全防衛エンジンの運用費や、公的本人確認（eKYC）のシステム原価、高セキュリティ暗号化サーバー維持費は、開封時のお手数料だけでは賄いきれないのが現状です。
              </p>
            </div>
            <p style={{ fontSize: '11px', lineHeight: '1.8' }}>
              「この温かい海を無くしたくない」「昔の友人との再会をつないでくれた感謝を伝えたい」と思ってくださる有志の皆様のサポーター寄付によって、ReMEETsは広告に頼ることなく健全に守られ、運営を続けることができています。
            </p>
          </div>
        </section>

        {/* 2. 寄付金の使い道（透明性レポート ＆ 税務コンプライアンス） */}
        <section className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 space-y-6">
          <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck size={24} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-sky-700 uppercase tracking-widest block font-sans">TRANSPARENCY REPORT</span>
              <h2 className="text-lg md:text-xl font-bold font-serif text-slate-900">
                ご寄付いただいた資金の使い道（透明性レポート）
              </h2>
            </div>
          </div>

          {/* 比率バー表示 */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between font-bold text-slate-700" style={{ fontSize: '11px' }}>
              <span>資金配分比率（年間推計）</span>
              <span className="text-slate-500 font-normal" style={{ fontSize: '10px' }}>健全・透明な運営をお約束します</span>
            </div>
            <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
              <div style={{ width: '45%' }} className="bg-teal-600 h-full" title="AI検閲・防衛 (45%)" />
              <div style={{ width: '30%' }} className="bg-indigo-600 h-full" title="暗号化保管 (30%)" />
              <div style={{ width: '15%' }} className="bg-amber-500 h-full" title="厳格身元確認 (15%)" />
              <div style={{ width: '10%' }} className="bg-rose-500 h-full" title="治安監視・サポート (10%)" />
            </div>
            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-slate-600 font-medium pt-0.5" style={{ fontSize: '10.5px' }}>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />AI安全防衛 (45%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />暗号化DB・保管 (30%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />eKYC・SMS補助 (15%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />治安監視・サポート (10%)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-[11px]">45%</div>
                <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200" style={{ fontSize: '10px' }}>AI検閲・防衛</span>
              </div>
              <h3 className="font-bold text-slate-900 font-serif" style={{ fontSize: '12px' }}>① AI安全防衛エンジンの運用費</h3>
              <p className="text-slate-600 leading-relaxed font-sans" style={{ fontSize: '10.5px', lineHeight: '1.65' }}>
                誹謗中傷、個人情報（実名・詳細住所）の漏洩、ストーカー兆候を24時間体制で水際検知・安全隔離するAIモデレーションシステム（Gemini API）のAPI利用料金に充当されます。
              </p>
            </div>

            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px]">30%</div>
                <span className="font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200" style={{ fontSize: '10px' }}>暗号化保管</span>
              </div>
              <h3 className="font-bold text-slate-900 font-serif" style={{ fontSize: '12px' }}>② 暗号化DB・高可用性サーバー維持</h3>
              <p className="text-slate-600 leading-relaxed font-sans" style={{ fontSize: '10.5px', lineHeight: '1.65' }}>
                あなたとお相手の大切な思い出の手紙や照合データを10年後・20年後も安全に保管するための、暗号化クラウドデータベースおよび高速サーバー運用インフラ費に充当されます。
              </p>
            </div>

            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-[11px]">15%</div>
                <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200" style={{ fontSize: '10px' }}>厳格身元確認</span>
              </div>
              <h3 className="font-bold text-slate-900 font-serif" style={{ fontSize: '12px' }}>③ eKYC・本人確認インフラ補助</h3>
              <p className="text-slate-600 leading-relaxed font-sans" style={{ fontSize: '10.5px', lineHeight: '1.65' }}>
                なりすましや悪質行為を徹底排除するための、公的身分証明書（運転免許証等）の審査およびSMS認証コード送信における従量原価の補填に活用されます。
              </p>
            </div>

            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-[11px]">10%</div>
                <span className="font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200" style={{ fontSize: '10px' }}>治安・法規</span>
              </div>
              <h3 className="font-bold text-slate-900 font-serif" style={{ fontSize: '12px' }}>④ 治安監視・ユーザーサポート体制</h3>
              <p className="text-slate-600 leading-relaxed font-sans" style={{ fontSize: '10.5px', lineHeight: '1.65' }}>
                不適切な問い合わせや通報への迅速な対応、法令適合の維持、ユーザー様からのお困りごと対応を行うサポート監視体制の充実に充てられます。
              </p>
            </div>
          </div>

          {/* 税務・法務に関する重要なお知らせ（コンプライアンス注記） */}
          <div className="p-3 md:p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-slate-800">
            <HelpCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed" style={{ fontSize: '10.5px' }}>
              <p className="font-bold text-amber-950" style={{ fontSize: '10.5px' }}>【税務・法務に関する重要なお知らせ（寄付金控除について）】</p>
              <p className="text-slate-700 leading-relaxed" style={{ fontSize: '10.5px', lineHeight: '1.65' }}>
                本サポーター支援は、個人運営の民間Webサービスに対する任意の活動支援金（チップ・協賛金）であり、特定公益増進法人や認定NPO法人等への寄付ではないため、所得税等の「寄付金控除」の対象外となります。あらかじめご了承のうえ温かいご支援を賜りますようお願い申し上げます。
              </p>
            </div>
          </div>
        </section>

        {/* 3. 公式サポーター特典 */}
        <section className="bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-indigo-500/10 rounded-3xl p-6 md:p-10 shadow-xl border border-amber-200/80 space-y-6">
          <div className="flex items-center gap-3.5 border-b border-amber-200/80 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Award size={24} />
            </div>
            <div>
              <span className="text-[10.5px] font-bold text-amber-800 uppercase tracking-widest block font-sans">SUPPORTER REWARDS</span>
              <h2 className="text-lg md:text-xl font-bold font-serif text-slate-900">
                公式サポーター様にお贈りする特典
              </h2>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-xs space-y-4">
            <div className="flex items-start gap-3">
              <Sparkles size={24} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 font-serif" style={{ fontSize: '13px' }}>
                  ⭐ マイページ＆プロファイルに「公式サポーター」ゴールドバッジ付与
                </h3>
                <p className="text-slate-600 leading-relaxed font-sans" style={{ fontSize: '10.5px', lineHeight: '1.7' }}>
                  ご寄付完了後、アカウントのマイページおよびコミュニティ画面にて「⭐ 公式サポーター認証済み」ゴールドバッジが自動的に点灯いたします。温かいお心遣いを可視化し、プラットフォーム全体で感謝を表します。
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center gap-2 text-amber-800 font-medium" style={{ fontSize: '10.5px' }}>
              <CheckCircle2 size={15} className="text-amber-600 shrink-0" />
              <span>寄付金額にかかわらず（1口 500円〜）、サポーター特典が適用されます。</span>
            </div>
          </div>
        </section>

        {/* 4. よくあるご質問 (FAQ) */}
        <section className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 space-y-6">
          <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs">
              <HelpCircle size={24} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block font-sans">FAQ</span>
              <h2 className="text-lg md:text-xl font-bold font-serif text-slate-900">
                寄付に関するよくあるご質問
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <h3 className="font-bold text-slate-900 font-serif flex items-center gap-1.5" style={{ fontSize: '12px' }}>
                <span className="text-teal-600 font-mono font-bold">Q.</span>
                月額サブスクリプションのように毎月自動引き落としされますか？
              </h3>
              <p className="text-slate-600 leading-relaxed pl-4 font-sans" style={{ fontSize: '10.5px', lineHeight: '1.65' }}>
                いいえ。ReMEETsのサポーター寄付はすべて<strong>「単発の一括決済（都度払い）」</strong>です。月額課金や自動更新は一切ありません。応援したい時にいつでも何度でも都度寄付いただけます。
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <h3 className="font-bold text-slate-900 font-serif flex items-center gap-1.5" style={{ fontSize: '12px' }}>
                <span className="text-teal-600 font-mono font-bold">Q.</span>
                いくらから寄付できますか？支払い方法は？
              </h3>
              <p className="text-slate-600 leading-relaxed pl-4 font-sans" style={{ fontSize: '10.5px', lineHeight: '1.65' }}>
                1口 500円（コーヒー1杯分）から、3口(1,500円)、5口(2,500円)、10口(5,000円)、20口(10,000円)など、ワンタップまたは口数指定でお選びいただけます。Stripeによる国際最高セキュリティ規格（PCI-DSS Level 1）に準拠した各種クレジットカード決済に対応しています。
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <h3 className="font-bold text-slate-900 font-serif flex items-center gap-1.5" style={{ fontSize: '12px' }}>
                <span className="text-teal-600 font-mono font-bold">Q.</span>
                領収書は発行されますか？
              </h3>
              <p className="text-slate-600 leading-relaxed pl-4 font-sans" style={{ fontSize: '10.5px', lineHeight: '1.65' }}>
                はい。決済完了後、Stripe決済システムよりご入力いただいたメールアドレス宛に電子的領収書（受領通知）が即時自動発行されます。
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <h3 className="font-bold text-slate-900 font-serif flex items-center gap-1.5" style={{ fontSize: '12px' }}>
                <span className="text-teal-600 font-mono font-bold">Q.</span>
                本名やクレジットカード情報が外部に公開される心配はありませんか？
              </h3>
              <p className="text-slate-600 leading-relaxed pl-4 font-sans" style={{ fontSize: '10.5px', lineHeight: '1.65' }}>
                一切公開されません。公式サポーターバッジはお使いのニックネームに付与され、カード情報はStripeの暗号化通信によって安全に処理されます。当サービスのサーバー内にクレジットカード情報が保存されることはありません。
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <h3 className="font-bold text-slate-900 font-serif flex items-center gap-1.5" style={{ fontSize: '12px' }}>
                <span className="text-teal-600 font-mono font-bold">Q.</span>
                寄付金控除（税制上の優遇措置）の対象になりますか？
              </h3>
              <p className="text-slate-600 leading-relaxed pl-4 font-sans" style={{ fontSize: '10.5px', lineHeight: '1.65' }}>
                いいえ。本サービスは民間・個人運営のWebサービスであるため、税制上の寄付金控除の対象外となります。純粋な開発・運営の活動応援（チップ）として大切に活用させていただきます。
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <h3 className="font-bold text-slate-900 font-serif flex items-center gap-1.5" style={{ fontSize: '12px' }}>
                <span className="text-teal-600 font-mono font-bold">Q.</span>
                寄付しないとアプリの機能は制限されますか？
              </h3>
              <p className="text-slate-600 leading-relaxed pl-4 font-sans" style={{ fontSize: '10.5px', lineHeight: '1.65' }}>
                いいえ、一切制限されません。ボトルメールの作成・投函・検索・クイズ照合機能はすべてのユーザー様に無料で開放されています。寄付は完全任意となっております。
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <h3 className="font-bold text-slate-900 font-serif flex items-center gap-2" style={{ fontSize: '12px' }}>
                <span className="text-teal-600 font-mono font-bold">Q.</span>
                誤って決済してしまった場合の返金対応はどうなりますか？
              </h3>
              <p className="text-slate-600 leading-relaxed pl-4 font-sans" style={{ fontSize: '10.5px', lineHeight: '1.65' }}>
                支援寄付の性質上、原則として決済完了後の返金は承っておりませんが、誤操作による二重決済等のトラブルが発生した場合は、お問い合わせ窓口よりご連絡いただければ迅速に確認・対応（返金処理）いたします。
              </p>
            </div>
          </div>
        </section>

        {/* 5. 最下部CTA（上品で自然なセンタリングデザイン） */}
        <div className="pt-6 pb-4 text-center space-y-4">
          <div className="space-y-1.5">
            <h3 className="text-base md:text-lg font-bold font-serif text-slate-800">
              温かいご支援を心よりお待ちしております
            </h3>
            <p className="text-slate-500 font-sans" style={{ fontSize: '10.5px' }}>
              寄付は月額サブスクではありません（自動課金なし・Stripe暗号化決済）
            </p>
          </div>

          <button
            onClick={() => setIsDonateModalOpen(true)}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-800 hover:from-amber-600 hover:via-orange-700 hover:to-amber-900 text-white font-extrabold text-sm rounded-2xl shadow-sm shadow-amber-950/25 hover:shadow-md hover:scale-[1.02] active:scale-98 transition-all inline-flex items-center justify-center gap-2 cursor-pointer border border-amber-400/40"
          >
            <Coffee size={16} className="text-amber-100 shrink-0 drop-shadow-xs" />
            <span className="drop-shadow-xs">活動を応援する（寄付 500円〜）</span>
          </button>
        </div>

      </main>

      {/* 寄付決済モーダル */}
      <SupportModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
      />
    </div>
  );
};
