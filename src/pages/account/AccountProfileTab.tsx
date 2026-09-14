import React from "react";
import { 
  Shield, ShieldCheck, Sparkles, Zap
} from "lucide-react";

export const AccountProfileTab = (props: any) => {
  const {
    user,
    setShowMypageEkycModal,
    setMypageEkycStep,
  } = props;

  return (
    <div className="space-y-6 animate-fade-in text-black">
      {/* 本人確認（eKYC）ステータス・手続きカード */}
      <div id="ekyc-status-panel" className="transition-all duration-300">
        {Boolean(user?.is_ekyc_verified || localStorage.getItem('ekyc_verified') === 'true') ? (
          /* 認証完了済みカード（手続きボタンなし・スマートな証明書スタイル） */
          <div className="p-6 md:p-8 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white rounded-3xl border-2 border-emerald-300/90 shadow-sm space-y-4 relative overflow-hidden font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200/80 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-13 h-13 rounded-full seal-rainbow flex flex-col items-center justify-center text-white shadow-lg">
                    <ShieldCheck size={22} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
                    <span className="text-[7px] font-black tracking-tighter uppercase -mt-0.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">eKYC済</span>
                  </div>
                  <span className="mt-1 text-[8px] font-extrabold text-sky-950 bg-white/95 border border-sky-300 px-1.5 py-0.1 rounded-full shadow-2xs whitespace-nowrap">
                    公的確認
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-emerald-300">
                      Identity Verified
                    </span>
                    <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                      🛡️ 公的本人確認（eKYC）認証完了
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-slate-900 mt-0.5">
                    ご本人様確認が完了しています
                  </h3>
                </div>
              </div>
              <div className="bg-white/95 px-3.5 py-2 rounded-2xl border border-emerald-200 shadow-2xs flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block leading-none">総合照合信頼度</span>
                  <span className="text-sm font-mono font-extrabold text-emerald-700">99.6%</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-4 rounded-2xl border border-emerald-100">
              あなたのアカウントは公的身分証明書（運転免許証/マイナンバーカード等）による本人確認が正常に完了しています。
              思い出の照合が成立したお相手との間で、安全・確実に連絡先を開示し合える最高水準の信頼アカウント状態です。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-white p-3 rounded-xl border border-emerald-100/80 shadow-2xs">
                <span className="text-slate-400 text-[10px] font-bold block">認証ステータス</span>
                <span className="font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                  ✓ 承認済み（正常稼働中）
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100/80 shadow-2xs">
                <span className="text-slate-400 text-[10px] font-bold block">想い出照合＆連絡先開示</span>
                <span className="font-bold text-teal-800 flex items-center gap-1 mt-0.5">
                  ✓ 即時開示可能
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100/80 shadow-2xs">
                <span className="text-slate-400 text-[10px] font-bold block">セキュリティ保護</span>
                <span className="font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                  🔒 暗号化保護中
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* 未認証カード（事前本人確認の3大メリット案内） */
          <div className="p-6 md:p-8 bg-gradient-to-br from-sky-50/90 via-cyan-50/30 to-white rounded-3xl border-2 border-sky-300 shadow-sm space-y-5 relative overflow-hidden font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-200/80 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-13 h-13 rounded-full seal-rainbow flex flex-col items-center justify-center text-white shadow-lg">
                    <ShieldCheck size={22} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
                    <span className="text-[7px] font-black tracking-tighter uppercase -mt-0.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">eKYC済</span>
                  </div>
                  <span className="mt-1 text-[8px] font-extrabold text-sky-950 bg-white/95 border border-sky-300 px-1.5 py-0.1 rounded-full shadow-2xs whitespace-nowrap">
                    付与バッジ
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-sky-300">
                      Identity Verification
                    </span>
                    <span className="text-[11px] font-bold text-sky-900 flex items-center gap-1">
                      🛡️ 未認証（事前登録受付中）
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-slate-900 mt-0.5">
                    事前本人確認（eKYC）の3大メリット
                  </h3>
                </div>
              </div>
              <div className="bg-white/95 border border-sky-200 px-3.5 py-1.5 rounded-xl text-center shrink-0 shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold block">利用・事前確認</span>
                <span className="text-xs font-bold text-sky-800 font-sans">完全無料（メッセージ開封時 600円〜1,200円）</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3.5 rounded-2xl border border-sky-100">
              事前に公的身分証明書による本人確認を済ませておくことで、あなた宛てのメッセージが届いた際、<strong>審査待ち時間ゼロで即座にメッセージ本文と連絡先を開封</strong>できます。完了するとあなたのメッセージやプロフィールに上記の<strong>「動く虹色封蝋バッジ」</strong>が付与されます。
            </p>

            {/* 3大メリット・アイコン小箱グリッド */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
              <div className="bg-white p-4 rounded-2xl border border-sky-100/90 shadow-2xs space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                  <Zap size={16} />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">1. 届いたら即時開封</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  お相手からのメッセージが見つかった際、審査待ち時間なくその場ですぐメッセージ本文と連絡先を開示できます。
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-sky-100/90 shadow-2xs space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <ShieldCheck size={16} />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">2. なりすまし完全防止</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  あなたのお名前を他人が勝手に騙ってメッセージを受け取る不正を100%防止し、大切な想い出を守ります。
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-sky-100/90 shadow-2xs space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Sparkles size={16} />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">3. お相手への信頼証明</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  「正真正銘の本人」という公式証明が付くため、お相手も安心・安全に連絡先を届けることができます。
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setMypageEkycStep(1);
                  setShowMypageEkycModal(true);
                }}
                className="w-full sm:w-auto flex-1 h-12 px-6 bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 hover:from-sky-700 hover:via-teal-700 hover:to-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-indigo-950/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-sans active:scale-98 border border-sky-400/30"
              >
                <ShieldCheck size={16} className="text-white shrink-0 drop-shadow-xs" />
                <span className="drop-shadow-xs">✨ 本人確認を完了して安心バッジを取得する（スムーズな開封へ）</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountProfileTab;
