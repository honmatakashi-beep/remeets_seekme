import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Sparkles, Award, Coffee, HelpCircle, ArrowRight, ArrowLeft, CheckCircle2, Lock, Anchor, MessageCircle } from 'lucide-react';
import { SupportModal } from './SupportModal';
import supporterTwilightCool from '../assets/images/supporter_twilight_cool_1785860735348.jpg';

export const SupporterPage: React.FC = () => {
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800 pb-20">
      {/* 上部ナビゲーション: トップへ戻る */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-sans transition-colors group cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>トップへ戻る</span>
        </Link>
      </div>

      {/* ヒーローセクション（中央配置イラスト＆左右・上下ソフトグラデーション） */}
      <section className="relative overflow-hidden bg-white border-b border-slate-100 text-slate-800 py-10 md:py-14 px-4 sm:px-6">
        {/* 背景イラスト（センター配置＆左右上下フェードグラデーション） */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden select-none">
          <div className="relative w-full max-w-4xl h-full opacity-65">
            <img 
              src={supporterTwilightCool} 
              alt="涼やかな夕暮れの思い出の海" 
              className="w-full h-full object-cover object-center"
            />
            {/* 左右グラデーション */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white" />
            {/* 上下グラデーション */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent via-50% to-white" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide text-teal-800 shadow-2xs">
            <Coffee size={14} className="text-teal-600 shrink-0" />
            <span>ReMEETs OFFICIAL SUPPORTER PROGRAM</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-serif font-bold tracking-wide sm:tracking-widest leading-relaxed max-w-full mx-auto flex flex-col items-center gap-1 sm:gap-2 px-2 text-sky-850">
            <span className="block text-center">思い出の海を、</span>
            <span className="block text-center">みんなの温かい心で守る。</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
            ReMEETsは、もう一度会いたい大切な人を探すのを無料でお手伝いする、<br className="hidden md:inline" />
            個人運営のボトルメールプラットフォームです。
          </p>

          <div className="pt-2 flex flex-col items-center justify-center gap-3">
            <button
              onClick={() => setIsDonateModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-extrabold text-base rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Coffee size={18} className="text-white shrink-0" />
              <span>ReMEETsを応援（寄付）</span>
            </button>

            {/* 提案 ④: 1回きりの安心保証バッジ */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200 text-slate-700 text-[11px] font-medium shadow-2xs">
              <ShieldCheck size={14} className="text-teal-600 shrink-0" />
              <span>1口 500円〜の都度寄付（月額サブスクではありません・自動課金なし）</span>
            </div>
          </div>
        </div>
      </section>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 -mt-8 relative z-20 space-y-10">
        
        {/* 1. なぜ寄付をお願いしているのか（ストーリー） */}
        <section className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 space-y-6">
          <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Anchor size={24} />
            </div>
            <div>
              <span className="text-[10.5px] font-bold text-teal-700 uppercase tracking-widest block font-sans">OUR MISSION</span>
              <h2 className="text-xl md:text-2xl font-bold font-serif text-slate-900">
                なぜ、ボトルメールの投函や検索を無料で行っているのか
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-slate-700 leading-relaxed">
            <p className="text-xs md:text-sm text-slate-700">
              人生の中で、もう一度会いたい人、どうしても伝えたい感謝や昔の思い出があるとき、複雑な月額課金や広告まみれの画面は、人の温かい感情を冷めさせてしまいます。
            </p>
            <p className="text-xs md:text-sm text-slate-700">
              そのため、ReMEETsでは<strong>「手紙を流す・思い出を探す」といった基本機能をすべて無料</strong>でお手伝いしています。
            </p>
            <p className="text-xs md:text-sm text-slate-700">
              費用が発生するのは、お互いの思い出クイズが合致し<strong>「ボトルメールを開封（連絡先・手紙を開通）する瞬間」のみ</strong>です。なりすましや悪質行為を防ぐ公的本人確認（eKYC）の実費と、システム運用費用の一部として開通手数料（600円）をご負担いただく仕組みをとっています。
            </p>

            <div className="p-4 md:p-5 bg-sky-50/70 border-l-4 border-sky-600 rounded-r-2xl font-serif text-slate-800 space-y-2 my-4">
              <p className="font-bold text-xs md:text-sm">「安全な海を維持するためのセキュリティ費用とAI防衛費」</p>
              <p className="text-xs md:text-sm font-sans text-slate-600 leading-relaxed">
                実名や住所の漏洩、誹謗中傷、ストーカー行為等の不適切投稿を24時間監視・隔離する高度なAI安全防衛エンジンの運用費や、公的本人確認（eKYC）のシステム原価、高セキュリティサーバー維持費は、開封時のお手数料だけでは賄いきれないのが現状です。
              </p>
            </div>
            <p className="text-xs md:text-sm text-slate-700">
              「この温かい海を無くしたくない」「昔の友人との再会をつないでくれた感謝を伝えたい」と思ってくださる有志の皆様のサポーター寄付によって、ReMEETsは健全に守られ、運営を続けることができています。
            </p>
          </div>
        </section>

        {/* 2. 寄付金の使い道（透明性・提案 ⑤ 拡充版） */}
        <section className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 space-y-6">
          <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck size={24} />
            </div>
            <div>
              <span className="text-[10.5px] font-bold text-sky-700 uppercase tracking-widest block font-sans">TRANSPARENCY</span>
              <h2 className="text-xl md:text-2xl font-bold font-serif text-slate-900">
                ご寄付いただいた資金の使い道（透明性レポート）
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs">01</div>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">AI検閲・防衛</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base font-serif">AI安全防衛エンジンの運用費</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                誹謗中傷、個人情報（実名・詳細住所）の漏洩、ストーカー兆候を24時間体制で水際検知・安全隔離するAIモデレーションシステム（Gemini API）のAPI利用料金に充当されます。
              </p>
            </div>

            <div className="p-5 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">02</div>
                <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">暗号化保管</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base font-serif">暗号化DB・高可用性サーバー維持</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                あなたとお相手の大切な思い出の手紙やマッチングデータを将来にわたって安全に保管するための、暗号化クラウドデータベースおよび高速サーバー運用インフラ費に充当されます。
              </p>
            </div>

            <div className="p-5 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs">03</div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">厳格身元確認</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base font-serif">eKYC・本人確認インフラ補助</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                なりすましや悪質行為を徹底排除するための、公的身分証明書（運転免許証等）のAI・目視審査およびSMS認証コード送信における従量原価の補填に活用されます。
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
              <h2 className="text-xl md:text-2xl font-bold font-serif text-slate-900">
                公式サポーター様にお贈りする特典
              </h2>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-xs space-y-4">
            <div className="flex items-start gap-3">
              <Sparkles size={24} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-sm md:text-base font-serif">
                  ⭐ マイページ＆プロファイルに「公式サポーター」ゴールドバッジ付与
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ご寄付完了後、アカウントのマイページおよびコミュニティ画面にて「⭐ 公式サポーター認証済み」ゴールドバッジが自動的に点灯いたします。温かいお心遣いを可視化し、プラットフォーム全体で感謝を表します。
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center gap-2 text-xs text-amber-800 font-medium">
              <CheckCircle2 size={16} className="text-amber-600 shrink-0" />
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
              <span className="text-[10.5px] font-bold text-indigo-700 uppercase tracking-widest block font-sans">FAQ</span>
              <h2 className="text-xl md:text-2xl font-bold font-serif text-slate-900">
                寄付に関するよくあるご質問
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-xs md:text-sm font-serif flex items-center gap-2">
                <span className="text-teal-600 font-mono font-bold">Q.</span>
                月額サブスクリプションのように毎月自動引き落としされますか？
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-5">
                いいえ。ReMEETsのサポーター寄付はすべて<strong>「単発の一括決済」</strong>です。解約手続きなども一切不要で、応援したい時にいつでも何度でも都度寄付いただけます。
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-xs md:text-sm font-serif flex items-center gap-2">
                <span className="text-teal-600 font-mono font-bold">Q.</span>
                いくらから寄付できますか？支払い方法は？
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-5">
                1口 500円（コーヒー1杯分）から最大20口（10,000円）までプルダウンで自由にお選びいただけます。Stripeによる国際標準の各種クレジットカード決済に対応しています。
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-xs md:text-sm font-serif flex items-center gap-2">
                <span className="text-teal-600 font-mono font-bold">Q.</span>
                寄付しないとアプリの機能は制限されますか？
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-5">
                いいえ、一切制限されません。ボトルメールの作成・検索・照合機能はすべてのユーザー様に無料で開放されています。寄付は完全任意となっております。
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
            <p className="text-xs text-slate-500 font-sans">
              1口 500円〜の都度寄付（月額自動課金なし・Stripe暗号化決済）
            </p>
          </div>

          <button
            onClick={() => setIsDonateModalOpen(true)}
            className="px-8 py-3 bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-98 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Coffee size={16} className="text-white shrink-0" />
            <span>ReMEETsを応援（寄付）</span>
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
