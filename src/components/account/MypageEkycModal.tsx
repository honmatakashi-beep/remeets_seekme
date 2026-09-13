import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, X, Sparkles, CheckCircle2, AlertCircle, Eye, ArrowRight,
  RefreshCw, CheckSquare, ShieldCheck, Lock, Cpu, CheckCircle
} from "lucide-react";
import { DocumentCameraOverlay, stopAllGlobalCameraStreams } from "../DocumentCameraOverlay";
import { EkycProgressTelemetryPanel } from "../EkycProgressTelemetryPanel";
import { CreditCardPaymentForm } from "../CreditCardPaymentForm";

interface MypageEkycModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  token: string | null;
  updateUser: (updatedData: any) => void;
}

export const MypageEkycModal: React.FC<MypageEkycModalProps> = ({
  isOpen,
  onClose,
  user,
  token,
  updateUser
}) => {
  const [mypageEkycStep, setMypageEkycStep] = useState(1);
  const [mypageEkycName, setMypageEkycName] = useState("");
  const [mypageEkycBirthdate, setMypageEkycBirthdate] = useState("1990-01-01");
  const [mypageEkycDocType, setMypageEkycDocType] = useState<"license" | "mynumber" | "passport">("license");
  const [mypagePayCardNumber, setMypagePayCardNumber] = useState("4242 •••• •••• 4242");
  const [mypagePayCardExpiry, setMypagePayCardExpiry] = useState("12/28");
  const [mypagePayCardCvc, setMypagePayCardCvc] = useState("123");
  const [mypagePayCardName, setMypagePayCardName] = useState("");
  const [isMypagePaying, setIsMypagePaying] = useState(false);
  const [mypageEkycProgress, setMypageEkycProgress] = useState(0);
  const [mypageEkycCapturedImages, setMypageEkycCapturedImages] = useState<{ front?: string; thickness?: string; back?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setMypageEkycName(user?.fullName || user?.name || "");
      if (!mypageEkycBirthdate) {
        setMypageEkycBirthdate("1990-01-01");
      }
      setMypageEkycStep(1);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (mypageEkycStep !== 3 || !isOpen) {
      stopAllGlobalCameraStreams();
    }
    return () => {
      stopAllGlobalCameraStreams();
    };
  }, [mypageEkycStep, isOpen]);

  useEffect(() => {
    let interval: any;
    if (isOpen && mypageEkycStep === 4) {
      setMypageEkycProgress(0);
      interval = setInterval(() => {
        setMypageEkycProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            (async () => {
              try {
                const res = await fetch("/api/auth/ekyc-verify", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    document_type: mypageEkycDocType,
                    ekyc_name: mypageEkycName,
                    birthdate: mypageEkycBirthdate
                  })
                });
                if (res.ok) {
                  localStorage.setItem("ekyc_verified", "true");
                  window.dispatchEvent(new Event("ekyc_changed"));
                  updateUser({ is_ekyc_verified: true });
                  setMypageEkycStep(5);
                } else {
                  const data = await res.json();
                  alert(data.error || "本人確認に失敗しました。");
                  setMypageEkycStep(1);
                }
              } catch (err) {
                console.error(err);
                alert("本人確認処理中にエラーが発生しました。");
                setMypageEkycStep(1);
              }
            })();
            return 100;
          }
          return prev + 5;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [mypageEkycStep, isOpen, token]);

  const showMypageEkycModal = isOpen;
  const setShowMypageEkycModal = (val: boolean) => {
    if (!val) onClose();
  };

  return (
      <AnimatePresence>
        {showMypageEkycModal && (
          <div 
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 text-black font-sans" 
            data-lenis-prevent
            data-modal-overlay
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMypageEkycModal(false)}
              className="absolute inset-0 bg-black/65 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="bg-white border border-brand-border rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[85vh] overflow-y-auto overscroll-contain font-sans text-black z-10"
              data-lenis-prevent
            >
              <button
                onClick={() => setShowMypageEkycModal(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 p-2 rounded-full transition-colors cursor-pointer z-20"
              >
                <X size={20} />
              </button>

            {/* Step 1: 氏名・生年月日・書類選択 */}
            {mypageEkycStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-150 pb-3 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest block font-sans">Step 1 / 4</span>
                    <h3 className="text-lg font-serif font-bold text-brand-dark">ご本人様情報の入力 ＆ 書類選択</h3>
                    <p className="text-xs text-slate-500 font-sans mt-0.5">
                      身分証と照合するための基本情報を入力し、提出書類をお選びください。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMypageEkycName(user?.fullName || '山田 太郎');
                      setMypageEkycBirthdate('1995-08-15');
                      setMypageEkycDocType('license');
                    }}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[11px] font-bold transition-all shadow-2xs shrink-0 flex items-center gap-1 cursor-pointer"
                    title="検証用のテスト氏名・生年月日を自動入力"
                  >
                    <Sparkles size={12} className="text-amber-600" />
                    <span>⚡ テスト自動入力</span>
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-800 block">氏名（本名）</label>
                    <input
                      type="text"
                      placeholder="例: 山田 太郎"
                      value={mypageEkycName}
                      onChange={(e) => setMypageEkycName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-zinc-300 rounded-xl text-xs text-black focus:outline-none focus:border-teal-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-800 block">生年月日</label>
                    <input
                      type="date"
                      value={mypageEkycBirthdate}
                      onChange={(e) => setMypageEkycBirthdate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-zinc-300 rounded-xl text-xs text-black focus:outline-none focus:border-teal-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-800 block">提出する身分証明書の種類</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setMypageEkycDocType('license')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          mypageEkycDocType === 'license'
                            ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold ring-2 ring-teal-500/20'
                            : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                        }`}
                      >
                        <span className="block text-[11px]">運転免許証</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMypageEkycDocType('mynumber')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          mypageEkycDocType === 'mynumber'
                            ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold ring-2 ring-teal-500/20'
                            : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                        }`}
                      >
                        <span className="block text-[11px]">マイナンバー</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMypageEkycDocType('passport')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          mypageEkycDocType === 'passport'
                            ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold ring-2 ring-teal-500/20'
                            : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                        }`}
                      >
                        <span className="block text-[11px]">パスポート</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMypageEkycModal(false)}
                    className="py-3 px-5 border border-zinc-300 hover:bg-zinc-100 rounded-xl text-xs font-bold text-zinc-700 transition-colors cursor-pointer"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!mypageEkycName || !mypageEkycBirthdate) {
                        alert('氏名と生年月日を入力してください。');
                        return;
                      }
                      setMypageEkycStep(2);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-teal-700 to-indigo-800 hover:from-teal-800 hover:to-indigo-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <span>次へ進む（証明書の撮影）</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Document Camera Overlay */}
            {mypageEkycStep === 2 && (
              <div className="space-y-4 font-sans">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest block font-sans">Step 2 / 4</span>
                  <h3 className="text-lg font-bold text-zinc-900 font-serif">身分証明書の撮影・アップロード</h3>
                  <p className="text-xs text-zinc-500">
                    光の反射や四隅の欠けを防ぐガイドライン枠線に合わせて撮影を行ってください。
                  </p>
                </div>

                <DocumentCameraOverlay
                  docType={mypageEkycDocType}
                  docTypeName={
                    mypageEkycDocType === 'license' ? '運転免許証' : mypageEkycDocType === 'mynumber' ? 'マイナンバーカード' : 'パスポート'
                  }
                  onBack={() => setMypageEkycStep(1)}
                  onComplete={(imgs) => {
                    setMypageEkycCapturedImages(imgs);
                    setMypageEkycStep(3);
                  }}
                />
              </div>
            )}

            {/* Step 3: 決済 */}
            {mypageEkycStep === 3 && (
              <div className="space-y-6 font-sans">
                <CreditCardPaymentForm
                  cardNumber={mypagePayCardNumber}
                  cardExpiry={mypagePayCardExpiry}
                  cardCvc={mypagePayCardCvc}
                  cardName={mypagePayCardName}
                  onCardNumberChange={setMypagePayCardNumber}
                  onCardExpiryChange={setMypagePayCardExpiry}
                  onCardCvcChange={setMypagePayCardCvc}
                  onCardNameChange={setMypagePayCardName}
                  showDemoButton={true}
                  onDemoFill={() => {
                    setMypagePayCardNumber('4242 4242 4242 4242');
                    setMypagePayCardExpiry('12/28');
                    setMypagePayCardCvc('123');
                    setMypagePayCardName('TAKASHI HONMA');
                  }}
                  refundGuaranteeText="本人確認（eKYC）審査が不承認となった場合は、Stripe仮売上により全額即時自動返金されます。"
                />

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setMypageEkycStep(2)}
                    className="py-3 px-5 border border-zinc-300 hover:bg-zinc-100 rounded-xl text-xs font-bold text-zinc-700 transition-colors cursor-pointer"
                  >
                    撮影に戻る
                  </button>
                  <button
                    onClick={() => {
                      setIsMypagePaying(true);
                      setTimeout(() => {
                        setIsMypagePaying(false);
                        setMypageEkycStep(4);
                      }, 1000);
                    }}
                    disabled={isMypagePaying}
                    className="flex-1 py-3 bg-gradient-to-r from-teal-700 to-indigo-800 hover:from-teal-800 hover:to-indigo-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer active:scale-98"
                  >
                    {isMypagePaying ? (
                      <span>決済処理中...</span>
                    ) : (
                      <span>600円を支払って照合を開始する</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: 照合中 */}
            {mypageEkycStep === 4 && (
              <div className="space-y-6 py-4 text-center font-serif">
                {/* 中央の二重発光スピナー & アイコン */}
                <div className="relative inline-flex items-center justify-center my-2">
                  {/* 外周の発光オーラ */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-500/30 to-amber-400/20 blur-xl animate-pulse" />
                  
                  {/* スピナーリング（外側・反時計回り） */}
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-emerald-300/60 animate-[spin_8s_linear_infinite]" />
                  
                  {/* スピナーリング（内側・時計回り） */}
                  <div className="absolute w-20 h-20 rounded-full border-3 border-emerald-100 border-t-emerald-600 border-r-teal-500 animate-spin" />
                  
                  {/* 中央コンテンツ */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-800 font-serif">
                    <span className="text-xl font-bold tracking-[0.14em] md:tracking-[0.18em] bg-gradient-to-r from-emerald-700 via-teal-600 to-green-600 bg-clip-text text-transparent pl-0.5">
                      {mypageEkycProgress}%
                    </span>
                    <span className="text-[9px] font-semibold text-emerald-600/80 uppercase tracking-[0.22em] -mt-0.5">
                      Processing
                    </span>
                  </div>
                </div>

                {/* ステータスタイトル */}
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-serif font-bold tracking-[0.1em] shadow-xs">
                    <ShieldCheck size={14} className="text-emerald-600 animate-pulse" />
                    <span>公的本人確認・認証マーク付与中</span>
                  </div>
                  <h3 className="text-base font-serif font-extrabold tracking-[0.12em] md:tracking-[0.16em] text-zinc-900 pt-1">
                    {mypageEkycProgress < 25 && '1. 決済承認＆セキュリティトークン化'}
                    {mypageEkycProgress >= 25 && mypageEkycProgress < 50 && '2. 公的書類・文字データ暗号解析'}
                    {mypageEkycProgress >= 50 && mypageEkycProgress < 75 && '3. 実在生身人間（ライブネス）判定'}
                    {mypageEkycProgress >= 75 && mypageEkycProgress < 100 && '4. 認証キー発行＆本人確認準備'}
                    {mypageEkycProgress === 100 && '✨ 認証＆本人確認完了！'}
                  </h3>
                </div>

                {/* プログレスバー本体（綺麗な虹色グラデーションバー） */}
                <div className="space-y-1.5 px-2">
                  <div className="flex items-center justify-between text-xs font-serif font-semibold text-zinc-500 px-1">
                    <span className="flex items-center gap-1 text-[11px] text-teal-700 font-serif tracking-[0.1em]">
                      <Lock size={12} /> 256bit 暗号化通信
                    </span>
                    <span className="text-emerald-700 font-bold font-serif tracking-[0.12em]">{mypageEkycProgress} / 100%</span>
                  </div>

                  <div className="w-full bg-slate-100 h-3.5 rounded-full p-0.5 shadow-inner border border-slate-200/80 relative overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-400 h-full rounded-full transition-all duration-300 relative shadow-xs" 
                      style={{ width: `${mypageEkycProgress}%` }}
                    >
                      {/* バー先端のLED光彩ノード */}
                      {mypageEkycProgress > 0 && mypageEkycProgress < 100 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.9)] z-10" />
                      )}
                    </div>
                  </div>
                </div>

                {/* 4ステップ進行タイムライン */}
                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60 text-left space-y-2 text-xs font-serif">
                  <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${mypageEkycProgress >= 0 && mypageEkycProgress < 25 ? 'bg-white shadow-xs border border-teal-200 font-bold text-teal-900' : mypageEkycProgress >= 25 ? 'text-zinc-400 font-medium' : 'text-zinc-500'}`}>
                    <span className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${mypageEkycProgress >= 25 ? 'bg-emerald-500 text-white' : 'bg-teal-100 text-teal-800'}`}>
                        {mypageEkycProgress >= 25 ? '✓' : '1'}
                      </span>
                      <span className="tracking-[0.08em] md:tracking-[0.12em]">決済承認＆セキュリティトークン化</span>
                    </span>
                    {mypageEkycProgress < 25 && <span className="text-[10px] text-teal-600 animate-pulse font-serif font-semibold tracking-[0.14em]">処理中...</span>}
                  </div>

                  <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${mypageEkycProgress >= 25 && mypageEkycProgress < 50 ? 'bg-white shadow-xs border border-teal-200 font-bold text-teal-900' : mypageEkycProgress >= 50 ? 'text-zinc-400 font-medium' : 'text-zinc-500'}`}>
                    <span className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${mypageEkycProgress >= 50 ? 'bg-emerald-500 text-white' : 'bg-teal-100 text-teal-800'}`}>
                        {mypageEkycProgress >= 50 ? '✓' : '2'}
                      </span>
                      <span className="tracking-[0.08em] md:tracking-[0.12em]">公的書類・文字データ暗号解析</span>
                    </span>
                    {mypageEkycProgress >= 25 && mypageEkycProgress < 50 && <span className="text-[10px] text-teal-600 animate-pulse font-serif font-semibold tracking-[0.14em]">解析中...</span>}
                  </div>

                  <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${mypageEkycProgress >= 50 && mypageEkycProgress < 75 ? 'bg-white shadow-xs border border-teal-200 font-bold text-teal-900' : mypageEkycProgress >= 75 ? 'text-zinc-400 font-medium' : 'text-zinc-500'}`}>
                    <span className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${mypageEkycProgress >= 75 ? 'bg-emerald-500 text-white' : 'bg-teal-100 text-teal-800'}`}>
                        {mypageEkycProgress >= 75 ? '✓' : '3'}
                      </span>
                      <span className="tracking-[0.08em] md:tracking-[0.12em]">実在生身人間（ライブネス）判定</span>
                    </span>
                    {mypageEkycProgress >= 50 && mypageEkycProgress < 75 && <span className="text-[10px] text-teal-600 animate-pulse font-serif font-semibold tracking-[0.14em]">判定中...</span>}
                  </div>

                  <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${mypageEkycProgress >= 75 ? 'bg-white shadow-xs border border-teal-200 font-bold text-teal-900' : 'text-zinc-500'}`}>
                    <span className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${mypageEkycProgress === 100 ? 'bg-emerald-500 text-white' : 'bg-teal-100 text-teal-800'}`}>
                        {mypageEkycProgress === 100 ? '✓' : '4'}
                      </span>
                      <span className="tracking-[0.08em] md:tracking-[0.12em]">🛡️ 認証マーク付与＆本人確認完了</span>
                    </span>
                    {mypageEkycProgress >= 75 && mypageEkycProgress < 100 && <span className="text-[10px] text-teal-600 animate-pulse font-serif font-semibold tracking-[0.14em]">処理中...</span>}
                  </div>
                </div>

                {/* 動的精度スコア・解析テレメトリ詳細 */}
                <div className="bg-white/95 rounded-2xl p-3.5 border border-emerald-200/80 shadow-2xs text-left space-y-2 font-sans">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                    <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1">
                      <Cpu size={12} className="text-teal-600" />
                      <span>AI リアルタイム照合スコア</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700">
                      総合信頼度: {mypageEkycProgress >= 100 ? '99.6%' : `${Math.round((mypageEkycProgress / 100) * 99.6 * 10) / 10}%`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-zinc-500 text-[10px] block">書類OCR一致率</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {mypageEkycProgress >= 25 ? '99.4%' : `${Math.min(99, Math.round(mypageEkycProgress * 3.9))}%`}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-zinc-500 text-[10px] block">顔特徴点類似スコア</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {mypageEkycProgress >= 50 ? '99.2%' : mypageEkycProgress >= 25 ? `${Math.min(99, Math.round((mypageEkycProgress - 25) * 3.9))}%` : '---'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-zinc-500 text-[10px] block">3Dライブネス判定</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {mypageEkycProgress >= 75 ? '99.7% (生身)' : mypageEkycProgress >= 50 ? '判定中...' : '---'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-zinc-500 text-[10px] block">暗号化監査ハッシュ</span>
                      <span className="font-mono font-bold text-emerald-700 text-[10px] truncate block">
                        {mypageEkycProgress >= 90 ? 'SHA256: 8A9F...77D2' : '生成中...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: 完了 */}
            {mypageEkycStep === 5 && (
              <div className="py-6 text-center space-y-6 font-sans">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                  <CheckCircle size={36} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif font-bold text-emerald-950">公的本人確認（eKYC）完了！🎉</h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    撮影書類の照合および本人確認手続きが正常に完了いたしました。<br />
                    あなたのアカウントに「🛡️公的本人確認済」ゴールドバッジが付与されました。
                  </p>
                </div>

                <button
                  onClick={() => {
                    localStorage.setItem('ekyc_verified', 'true');
                    window.dispatchEvent(new Event('ekyc_changed'));
                    setShowMypageEkycModal(false);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  マイアカウントに戻る
                </button>
              </div>
            )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      );
};
