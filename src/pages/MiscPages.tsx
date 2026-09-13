import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Compass, ArrowLeft, Search, Send } from "lucide-react";
import { BackToHomeButton } from "../components/SharedComponents";
import searchEmptySea from "../assets/images/search_empty_sea_1785869230086.jpg";

// Re-exports for 100% backward compatibility
export { SuccessStoriesPage } from "./SuccessStoriesPage";
export {
  POLICE_PRESENTATION_SCENARIOS,
  DEFAULT_AUTH_MEMO,
  AdminDeploymentGuideBlock,
  AdminDeploymentGuidePage
} from "../components/AdminDeploymentGuideBlock";

export const ManualContent = () => (
  <div className="space-y-8 text-slate-800 font-sans">
    <section className="space-y-3">
      <h3 className="text-base md:text-lg font-bold font-serif text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-2">
        <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-sans shrink-0">01</span>
        手紙を書く（ボトルメールの投函）
      </h3>
      <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
        トップページの「ボトルメールを流す」ボタンから、探している相手へのメッセージを作成できます。あなたの想いが相手に届くよう、以下の項目を丁寧に入力しましょう。
      </p>
      <div className="bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-200/80 space-y-2">
        <p className="text-xs font-bold text-slate-900">入力項目の詳細：</p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700 leading-relaxed">
          <li><strong>相手の名前：</strong> 姓と名を分けて正確に入力してください。旧姓や、当時呼んでいた名前など、相手が検索しそうな名前を入力するのがコツです。</li>
          <li><strong>出身地・ゆかりの地：</strong> 相手の出身地や、二人が出会った場所などを入力します。公開されるのは「都道府県」までとなりますが、市区町村まで入力することで検索精度が向上します。</li>
          <li><strong>交流のあった年代：</strong> 相手と過ごした時代（例：1990年代）を選択します。</li>
          <li><strong>あなたの表示名：</strong> 当時のあだ名や、二人の間だけで通じる呼び名を使用してください。</li>
          <li><strong>思い出クイズ：</strong> 本人確認のための重要なステップです。<strong>思い出クイズ（2問）</strong>を設定してください。第三者が推測しにくい二人の記憶に基づく具体的なエピソードを質問にすることを強く推奨します。</li>
          <li><strong>開示用連絡先（LINE等）：</strong> クイズに正解し、手続きを行ったお相手だけに安全に公開される連絡先（LINE ID、メールアドレスなど）を設定します。手紙の本文欄には直接書き込まず、こちらの専用欄にご入力ください。</li>
          <li><strong>メッセージ：</strong> 相手が思い出クイズに正解した後に表示される手紙本文です。</li>
          <li><strong>AIによる検閲：</strong> 投稿内容はAIによって自動的に解析され、不適切な表現や個人情報の過度な露出がある場合は投稿が制限されることがあります。</li>
        </ul>
      </div>
    </section>

    <section className="space-y-3">
      <h3 className="text-base md:text-lg font-bold font-serif text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-2">
        <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-sans shrink-0">02</span>
        奇跡を拾う（自分宛ての手紙を探す ＆ 新着入荷通知アラート）
      </h3>
      <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
        「自分宛ての手紙を探す」ページでは、ご自身宛てのメッセージが届いていないかを、自身の名前やゆかりの地のキーワードで簡単に見つけることができます。検索エンジンを頼りにしたエゴサーチ等を通じてこのページに偶然たどり着いた方や、心当たりのある方は、ぜひご自身宛てに流されたボトルメールを探してみてください。
      </p>
      <div className="bg-teal-50/60 p-4 md:p-5 rounded-2xl border border-teal-200/80 space-y-3">
        <div>
          <p className="text-xs font-bold text-teal-900">自分宛ての手紙を見つけるヒント：</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-teal-800 leading-relaxed mt-1">
            <li>ご自身の姓、名、あるいは旧姓などの漢字やひらがなで検索をお試しください。</li>
            <li>お相手と出会った地域や、思い出のゆかりの地などで絞り込むと、届いたボトルが非常に見つかりやすくなります。</li>
            <li>年代や関係性（部活動、同級生、元同僚など）を指定することで、効率よく自分宛ての手紙を絞り込めます。</li>
          </ul>
        </div>

        <div className="border-t border-teal-200/80 pt-3">
          <p className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-teal-600 text-white text-[10px] rounded-md font-bold">便利機能</span>
            🔔 自分宛ての手紙が投稿されたらメールで受け取る（新着入荷通知アラート）
          </p>
          <p className="text-xs text-teal-900/90 leading-relaxed mt-1 font-sans">
            検索画面であなたのお名前やゆかりの地を設定し、「この条件でメール通知を受け取る」を保存しておくと、今後あなたを探しているお相手が新しくボトルメールを投函した際に、システムから自動でメール通知が届きます。<br />
            保存した通知条件は、ログイン後の<strong>「マイページ」→「通知・アラート」タブ</strong>からいつでも確認・削除・管理が可能です。
          </p>
        </div>
      </div>
    </section>

    <section className="space-y-3">
      <h3 className="text-base md:text-lg font-bold font-serif text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-2">
        <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-sans shrink-0">03</span>
        再会への一歩（本人確認と連絡先の受け取り）
      </h3>
      <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
        自分宛てと思われる手紙を見つけたら、詳細を確認します。メッセージ本文と連絡先を開示するには、差出人が設定した「思い出クイズ」に答える必要があります。
      </p>
      <div className="bg-amber-50/60 p-4 md:p-5 rounded-2xl border border-amber-200/80 space-y-2">
        <p className="text-xs font-bold text-amber-900">再会のプロセス：</p>
        <ol className="list-decimal pl-5 space-y-1.5 text-xs text-amber-800 leading-relaxed">
          <li><strong>クイズに回答：</strong> 思い出クイズに正解すると、ロックが解除されます。</li>
          <li><strong>手紙の開封と受け取り手続き：</strong> 差出人からの手紙本文を確認し、手続き（600円 / 公的本人確認付き1,200円）を行います。</li>
          <li><strong>連絡先（LINE等）の開示：</strong> 差出人が設定した連絡先（LINE ID、メールアドレス等）が表示されます。</li>
          <li><strong>直接連絡・再会成功：</strong> 開示された連絡先へ直接メッセージをお送りいただくことで再会が果たせます。</li>
        </ol>
      </div>
    </section>

    <section className="space-y-3">
      <h3 className="text-base md:text-lg font-bold font-serif text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-2">
        <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-sans shrink-0">04</span>
        開示情報の確認と管理
      </h3>
      <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
        開示手続きが完了したお手紙やSNS連絡先は、マイアカウントの「開封済みのお手紙」からいつでも再確認できます。
      </p>
    </section>

    <section className="space-y-3">
      <h3 className="text-base md:text-lg font-bold font-serif text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-2">
        <span className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-sans shrink-0">05</span>
        相手からの回答・正解通知とメール設定
      </h3>
      <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
        あなたが流したボトルがお相手に見つけられ、質問回答やクイズ正解などのアクションが起こると、以下の2つの方法で自分宛てに通知されます。
      </p>
      <div className="p-4 md:p-5 bg-rose-50/70 border border-rose-200/80 rounded-2xl space-y-3">
        <div className="space-y-2">
          <p className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            ① サイト内通知（画面右上のベルアイコン 🔔）
          </p>
          <p className="text-xs text-rose-900/80 leading-relaxed pl-3.5">
            サイトにログイン時、画面右上の 🔔（ベルマーク）に赤いバッジが点灯し、回答・正解されたボトルの状況がリアルタイムで届きます。
          </p>
        </div>

        <div className="space-y-2 border-t border-rose-200/60 pt-2.5">
          <p className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            ② 登録メールアドレスへの即時メール通知
          </p>
          <p className="text-xs text-rose-900/80 leading-relaxed pl-3.5">
            お相手がクイズに答えた時や全問正解して手紙を開封した際、ご登録のメールアドレス宛に自動的にお知らせメールが送信されます。メール内のリンクからすぐに結果画面を確認できます。
          </p>
        </div>

        <div className="space-y-2 border-t border-rose-200/60 pt-2.5">
          <p className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            ③ メール通知のON/OFF切り替え
          </p>
          <p className="text-xs text-rose-900/80 leading-relaxed pl-3.5">
            「マイアカウント」→「プロフィール設定」から、メール通知の受信（ON/OFF）をいつでも変更できます。
          </p>
        </div>
      </div>
    </section>

    {/* Dedicated Pricing & Safety Links */}
    <div className="p-5 bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-amber-50/90 border-2 border-amber-200/90 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-xs text-slate-700">
        <strong className="text-amber-950 font-bold block text-sm mb-0.5">💰 ご利用料金の詳細について</strong>
        基本機能は完全無料（0円）。手紙開封・SNS開示のみ600円（買い切り）です。
      </div>
      <Link
        to="/pricing"
        className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-xs"
      >
        利用料金表を見る →
      </Link>
    </div>
  </div>
);

// Compatibility alias for GuidePage
export const LocalInlineGuidePage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12">
    <ManualContent />
  </div>
);

export const ManualPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 text-black font-sans">
    <BackToHomeButton />
    <div className="glass-card p-8 md:p-12 space-y-8 bg-white rounded-3xl border border-brand-border shadow-sm">
      <div className="flex items-center gap-4 mb-8 border-b border-brand-border pb-6">
        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 shadow-sm">
          <BookOpen size={26} />
        </div>
        <div>
          <span className="text-[10px] md:text-xs font-bold text-brand-primary uppercase tracking-[0.3em] block mb-0.5 font-sans">
            User Guide & Instructions
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark tracking-widest leading-tight">
            詳細ご利用マニュアル
          </h1>
          <p className="text-xs md:text-sm text-brand-dark/60 font-sans leading-relaxed mt-1">
            ReMEETsの基本仕様、手紙（ボトルメール）の投函、手紙の検索、および質問回答・連絡先開示手続きの詳細説明です。
          </p>
        </div>
      </div>
      <ManualContent />
    </div>
  </div>
);

export const NotFoundPage = () => (
  <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 py-12 font-sans animate-fade-in text-slate-800">
    <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-lg text-center space-y-6 relative overflow-hidden">
      {/* 背景の静かな海イラスト（透過ブレンド） */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden select-none">
        <div className="relative w-full h-full opacity-40">
          <img 
            src={searchEmptySea} 
            alt="静かな朝もやの海" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-white/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white" />
        </div>
      </div>

      <div className="relative z-10 space-y-5">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100/90 border border-slate-200 text-slate-600 flex items-center justify-center shadow-sm backdrop-blur-xs">
          <Compass size={32} className="text-teal-700" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold text-teal-800 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80 inline-block font-sans">
            404 Page Not Found
          </span>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-wide">
            お探しの手紙は見つかりませんでした
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-sm mx-auto">
            アクセスされた波間（URL）にはボトルメールが存在しないか、すでに回収・移動された可能性があります。
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center text-xs font-bold font-sans">
          <Link
            to="/"
            className="px-5 py-3 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <ArrowLeft size={14} />
            <span>ホームへ戻る</span>
          </Link>

          <Link
            to="/search"
            className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Search size={14} />
            <span>手紙を探す</span>
          </Link>

          <Link
            to="/create"
            className="px-5 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send size={14} />
            <span>手紙を流す</span>
          </Link>
        </div>
      </div>
    </div>
  </div>
);


