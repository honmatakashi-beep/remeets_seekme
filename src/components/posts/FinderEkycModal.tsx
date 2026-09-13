import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, ShieldCheck, X, Sparkles, CheckCircle2, AlertCircle, Eye, ArrowRight,
  RefreshCw, CheckSquare, Shield, Lock
} from "lucide-react";
import { DocumentCameraOverlay, stopAllGlobalCameraStreams } from "../../components/DocumentCameraOverlay";
import { EkycProgressTelemetryPanel } from "../../components/EkycProgressTelemetryPanel";
import { CreditCardPaymentForm } from "../../components/CreditCardPaymentForm";

interface FinderEkycModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  user: any;
  token: string | null;
  revealedContact: any;
  otherUserFullNameToUse: string;
  searcherFullName: string;
  searcherName: string;
  onEkycSuccess: () => void;
}

export const FinderEkycModal: React.FC<FinderEkycModalProps> = ({
  isOpen,
  onClose,
  post,
  user,
  token,
  revealedContact,
  otherUserFullNameToUse,
  searcherFullName,
  searcherName,
  onEkycSuccess
}) => {
  const [finderEkycStep, setFinderEkycStep] = useState(1);
  const [finderEkycName, setFinderEkycName] = useState("");
  const [finderEkycBirthdate, setFinderEkycBirthdate] = useState("1995-08-15");
  const [finderEkycDocType, setFinderEkycDocType] = useState<"license" | "mynumber" | "passport">("license");
  const [finderPayCardNumber, setFinderPayCardNumber] = useState("4242 •••• •••• 4242");
  const [finderPayCardExpiry, setFinderPayCardExpiry] = useState("12/28");
  const [finderPayCardCvc, setFinderPayCardCvc] = useState("123");
  const [finderPayCardName, setFinderPayCardName] = useState("");
  const [isFinderPaying, setIsFinderPaying] = useState(false);
  const [finderEkycProgress, setFinderEkycProgress] = useState(0);
  const [finderEkycCapturedImages, setFinderEkycCapturedImages] = useState<{ front?: string; thickness?: string; back?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setFinderEkycName(user?.fullName || user?.name || "");
      if (!finderEkycBirthdate) {
        setFinderEkycBirthdate("1995-08-15");
      }
      setFinderEkycStep(1);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (finderEkycStep !== 3 || !isOpen) {
      stopAllGlobalCameraStreams();
    }
    return () => {
      stopAllGlobalCameraStreams();
    };
  }, [finderEkycStep, isOpen]);

  useEffect(() => {
    let interval: any;
    if (isOpen && finderEkycStep === 4) {
      setFinderEkycProgress(0);
      interval = setInterval(() => {
        setFinderEkycProgress((prev) => {
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
                    document_type: finderEkycDocType,
                    ekyc_name: finderEkycName,
                    birthdate: finderEkycBirthdate,
                    postId: post?.id,
                    captured_images: finderEkycCapturedImages
                  })
                });
                if (res.ok) {
                  localStorage.setItem("ekyc_verified", "true");
                  window.dispatchEvent(new Event("ekyc_changed"));
                  setFinderEkycStep(5);
                  onEkycSuccess();
                } else {
                  const data = await res.json();
                  alert(data.error || "本人確認に失敗しました。");
                  setFinderEkycStep(1);
                }
              } catch (err) {
                console.error(err);
                alert("本人確認処理中にエラーが発生しました。");
                setFinderEkycStep(1);
              }
            })();
            return 100;
          }
          return prev + 5;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [finderEkycStep, isOpen, token, post?.id, finderEkycDocType, finderEkycName, finderEkycBirthdate, finderEkycCapturedImages]);

  const showFinderEkycModal = isOpen;
  const setShowFinderEkycModal = (val: boolean) => {
    if (!val) onClose();
  };

  return (
    <AnimatePresence>
        {showFinderEkycModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 text-black font-sans" data-lenis-prevent>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFinderEkycModal(false)}
              className="absolute inset-0 bg-black/65 cursor-pointer"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`relative w-full bg-white shadow-2xl p-6 md:p-8 text-zinc-900 z-10 rounded-2xl max-h-[92vh] flex flex-col overflow-y-auto overscroll-contain transition-all ${
                finderEkycStep === 3 ? 'max-w-2xl' : 'max-w-lg'
              }`}
              data-lenis-prevent
            >
              <button 
                type="button"
                onClick={() => setShowFinderEkycModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-brand-dark transition-colors p-1.5 focus:outline-none cursor-pointer rounded-full hover:bg-zinc-100 z-20"
                aria-label="閉じる"
              >
                <X size={18} />
              </button>

              {/* ✨ 時を超えて届いた想い出のメッセージ（開封冒頭ヘッダー） */}
              <div className="text-center space-y-2.5 pb-4 border-b border-indigo-100/90 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 via-purple-100 to-amber-100 text-indigo-700 rounded-full shadow-md flex items-center justify-center mx-auto ring-4 ring-indigo-50">
                  <Heart size={28} className="animate-pulse text-rose-600 fill-rose-500/20" />
                </div>
                <div className="space-y-1">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold tracking-wider font-serif">
                    ✨ 時を超えて届いた想い出のメッセージ
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold font-serif text-slate-900 pt-0.5">
                    【{revealedContact?.searcherFullName || otherUserFullNameToUse || searcherFullName || post?.searcher_full_name || post?.owner_full_name || post?.searcher_name || searcherName || 'お相手'}】さんからの手紙を開封する
                  </h3>
                </div>
                <p className="text-xs text-slate-600 font-sans leading-relaxed max-w-md mx-auto">
                  あなたを探し続けていた【{revealedContact?.searcherFullName || otherUserFullNameToUse || searcherFullName || post?.searcher_full_name || post?.owner_full_name || post?.searcher_name || searcherName || 'お相手'}】さんが残した「手紙の全文」と、今すぐ直接つながる「ご連絡先（LINE・メールアドレス等）」が開示されます。止まっていた大切な時間の続きを、ここから始めましょう。
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-800 text-[11px] font-bold rounded-full border border-indigo-200">
                  <ShieldCheck size={14} className="text-indigo-600" />
                  <span>公的証明バッジ取得 ＆ 手紙開封コース（600円 税込）</span>
                </div>
              </div>

              {/* Step 1: 身分証明書の選択と基本情報の入力 */}
              {finderEkycStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-indigo-150 pb-3 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block font-sans">Step 1 / 4</span>
                      <h3 className="text-lg font-bold text-black font-serif">1. 身分証明書の選択と基本情報の入力</h3>
                      <p className="text-xs text-black/60 font-sans leading-relaxed mt-0.5">
                        ご提示いただく身分証明書を選択し、本名と生年月日をご記入ください。
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFinderEkycName(user?.fullName || "本間 貴司");
                        setFinderEkycBirthdate("1995-05-15");
                        setFinderEkycDocType("license");
                      }}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition-all shadow-2xs shrink-0 flex items-center gap-1 cursor-pointer"
                      title="検証用のテスト氏名・生年月日を自動入力"
                    >
                      <Sparkles size={12} className="text-indigo-600" />
                      <span>⚡ テスト自動入力</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-500 block mb-1.5 uppercase tracking-wider font-sans">1. 証明書の種類</label>
                      <div className="grid grid-cols-3 gap-2">
                        {([
                          { id: 'license', label: '運転免許証' },
                          { id: 'mynumber', label: 'マイナンバー' },
                          { id: 'passport', label: 'パスポート' }
                        ] as const).map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => setFinderEkycDocType(doc.id)}
                            className={`py-3 px-2 border rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                              finderEkycDocType === doc.id
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500/20'
                                : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                            }`}
                          >
                            {doc.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-500 block mb-1 uppercase tracking-wider font-sans">2. お名前（漢字）</label>
                        <input
                          type="text"
                          value={finderEkycName}
                          onChange={(e) => setFinderEkycName(e.target.value)}
                          placeholder="山田 太郎"
                          className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 font-sans"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-500 block mb-1 uppercase tracking-wider font-sans">3. 生年月日</label>
                        <input
                          type="date"
                          value={finderEkycBirthdate}
                          onChange={(e) => setFinderEkycBirthdate(e.target.value)}
                          className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowFinderEkycModal(false)}
                      className="py-3 px-5 border border-zinc-200 hover:bg-zinc-100 rounded-xl text-xs font-bold text-zinc-700 transition-colors cursor-pointer"
                    >
                      キャンセル
                    </button>
                    <button
                      disabled={!finderEkycName || !finderEkycBirthdate}
                      onClick={() => setFinderEkycStep(2)}
                      className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-98"
                    >
                      <span>証明書の撮影画面へ進む（ガイド枠あり）</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Document Camera Capture with Guidelines Overlay */}
              {finderEkycStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block font-sans">Step 2 / 4</span>
                    <h3 className="text-lg font-bold text-black font-serif">2. 身分証明書の撮影・アップロード</h3>
                    <p className="text-xs text-zinc-500 font-sans">
                      反射や四隅の欠けを防ぐガイドライン枠線に合わせて撮影を行ってください。
                    </p>
                  </div>

                  <DocumentCameraOverlay
                    docType={finderEkycDocType}
                    docTypeName={
                      finderEkycDocType === 'license' ? '運転免許証' : finderEkycDocType === 'mynumber' ? 'マイナンバーカード' : 'パスポート'
                    }
                    onBack={() => setFinderEkycStep(1)}
                    onComplete={(imgs) => {
                      setFinderEkycCapturedImages(imgs);
                      setFinderEkycStep(3);
                    }}
                  />
                </div>
              )}

              {/* Step 3: Payment (Credit Card Billing) */}
              {finderEkycStep === 3 && (
                <div className="space-y-5 py-2 text-left">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-3 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block font-sans">Step 3 / 4</span>
                      <h3 className="text-lg font-serif font-bold text-zinc-900">
                        3. 安全照合・手紙開封手数料のお支払い
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFinderPayCardNumber("4242 4242 4242 4242");
                        setFinderPayCardExpiry("12/28");
                        setFinderPayCardCvc("123");
                        setFinderPayCardName("TAKASHI HONMA");
                      }}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition-all shadow-2xs shrink-0 flex items-center gap-1 cursor-pointer"
                      title="検証用のStripeテストカード情報を自動入力"
                    >
                      <Sparkles size={12} className="text-indigo-600" />
                      <span>⚡ テストカード自動入力</span>
                    </button>
                  </div>

                  {/* 🤝 安心・安全な連絡先相互開示の仕組みカード（案3） */}
                  <div className="p-3.5 bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-white rounded-2xl border border-indigo-200/90 shadow-2xs space-y-2 text-xs font-sans">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-950 font-serif">
                      <ShieldCheck size={15} className="text-indigo-600" />
                      <span>🤝 安心・安全な連絡先相互開示のお約束</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-600 pl-1 leading-relaxed">
                      <li className="flex items-start gap-1.5">
                        <span className="text-indigo-600 font-bold">✓</span>
                        <span>差出人の<strong>「手紙の全文」</strong>と<strong>「直通連絡先（LINE・メール等）」</strong>が即座に開示されます。</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-indigo-600 font-bold">✓</span>
                        <span>あなたのアカウント情報も公的認証マーク付きでお相手と安全に照合・共有されます。</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-indigo-600 font-bold">✓</span>
                        <span>256-bit暗号化と公的eKYCにより、第三者によるなりすまし・個人情報の漏洩を100%防御します。</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-600 font-bold">手紙開封 ＆ 公的本人確認（eKYC）費用</span>
                      <span className="text-zinc-900 font-mono font-bold">600 円</span>
                    </div>
                    <div className="border-t border-dashed border-zinc-200 pt-2 flex justify-between items-center">
                      <span className="text-xs text-indigo-950 font-extrabold">
                        一括お引き落とし合計額（買い切り）
                      </span>
                      <span className="text-base text-indigo-900 font-sans font-bold">600 円 <span className="text-[10px] font-normal text-indigo-700">(税込)</span></span>
                    </div>
                  </div>

                  {/* Document capture summary badge */}
                  {finderEkycCapturedImages.front && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span>身分証撮影完了（全3枚・カメラ自動切断・暗号化保護）</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFinderEkycStep(2)}
                        className="text-[11px] text-indigo-600 hover:underline font-bold shrink-0 ml-2 cursor-pointer"
                      >
                        再撮影
                      </button>
                    </div>
                  )}

                  <CreditCardPaymentForm
                    cardNumber={finderPayCardNumber}
                    cardExpiry={finderPayCardExpiry}
                    cardCvc={finderPayCardCvc}
                    cardName={finderPayCardName}
                    onCardNumberChange={setFinderPayCardNumber}
                    onCardExpiryChange={setFinderPayCardExpiry}
                    onCardCvcChange={setFinderPayCardCvc}
                    onCardNameChange={setFinderPayCardName}
                    showDemoButton={true}
                    onDemoFill={() => {
                      setFinderPayCardNumber("4242 4242 4242 4242");
                      setFinderPayCardExpiry("12/28");
                      setFinderPayCardCvc("123");
                      setFinderPayCardName("TAKASHI HONMA");
                    }}
                    refundGuaranteeText="本人確認（eKYC）審査が不承認となった場合は、Stripe仮売上システムにより全額即時自動返金されます。"
                  />

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setFinderEkycStep(2)}
                      className="px-4 py-3 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      撮影に戻る
                    </button>
                    <button
                      disabled={!finderPayCardNumber || !finderPayCardExpiry || !finderPayCardCvc || !finderPayCardName}
                      onClick={() => setFinderEkycStep(4)}
                      className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:cursor-not-allowed active:scale-98"
                    >
                      600円をお支払いして公的証明・手紙開示を完了
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: 照合中 */}
              {finderEkycStep === 4 && (
                <div className="space-y-6 py-4 text-center font-serif">
                  {/* 中央の二重発光スピナー & アイコン */}
                  <div className="relative inline-flex items-center justify-center my-2">
                    {/* 外周の発光オーラ */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-500/30 to-amber-400/20 blur-xl animate-pulse" />
                    
                    {/* スピナーリング（外側・反時計回り） */}
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-indigo-300/60 animate-[spin_8s_linear_infinite]" />
                    
                    {/* スピナーリング（内側・時計回り） */}
                    <div className="absolute w-20 h-20 rounded-full border-3 border-indigo-100 border-t-indigo-600 border-r-teal-500 animate-spin" />
                    
                    {/* 中央コンテンツ */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-900 font-serif">
                      <span className="text-xl font-bold tracking-[0.14em] md:tracking-[0.18em] bg-gradient-to-r from-indigo-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent pl-0.5">
                        {finderEkycProgress}%
                      </span>
                      <span className="text-[9px] font-semibold text-indigo-600/80 uppercase tracking-[0.22em] -mt-0.5">
                        Processing
                      </span>
                    </div>
                  </div>

                  {/* ステータスタイトル */}
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-serif font-bold tracking-[0.1em] shadow-xs">
                      <ShieldCheck size={14} className="text-emerald-600 animate-pulse" />
                      <span>公的本人確認・撮影照合＆決済処理中</span>
                    </div>
                    <h3 className="text-base font-serif font-extrabold tracking-[0.12em] md:tracking-[0.16em] text-zinc-900 pt-1">
                      {finderEkycProgress < 25 && '1. 撮影書類の四隅＆光反射AI分析'}
                      {finderEkycProgress >= 25 && finderEkycProgress < 50 && '2. 記載文字暗号化＆身元データ照合'}
                      {finderEkycProgress >= 50 && finderEkycProgress < 75 && '3. Stripe安全決済＆オーソリ完了'}
                      {finderEkycProgress >= 75 && finderEkycProgress < 100 && '4. お相手連絡先・手紙本文の開示キー発行'}
                      {finderEkycProgress === 100 && '✨ 照合＆開示準備が完了しました！'}
                    </h3>
                  </div>

                  {/* プログレスバー本体（綺麗な虹色グラデーションバー） */}
                  <div className="space-y-1.5 px-2">
                    <div className="flex items-center justify-between text-xs font-serif font-semibold text-zinc-500 px-1">
                      <span className="flex items-center gap-1 text-[11px] text-indigo-700 font-serif tracking-[0.1em]">
                        <Lock size={12} /> 256bit 暗号化安全通信
                      </span>
                      <span className="text-emerald-700 font-bold font-serif tracking-[0.12em]">{finderEkycProgress} / 100%</span>
                    </div>

                    <div className="w-full bg-slate-100 h-3.5 rounded-full p-0.5 shadow-inner border border-slate-200/80 relative overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-400 h-full rounded-full transition-all duration-300 relative shadow-xs" 
                        style={{ width: `${finderEkycProgress}%` }}
                      >
                        {/* バー先端のLED光彩ノード */}
                        {finderEkycProgress > 0 && finderEkycProgress < 100 && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.9)] z-10" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4ステップ進行タイムライン */}
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60 text-left space-y-2 text-xs font-serif">
                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${finderEkycProgress >= 0 && finderEkycProgress < 25 ? 'bg-white shadow-xs border border-indigo-200 font-bold text-indigo-900' : finderEkycProgress >= 25 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${finderEkycProgress >= 25 ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                          {finderEkycProgress >= 25 ? '✓' : '1'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">撮影写真の厚み・顔画像解析</span>
                      </span>
                      {finderEkycProgress < 25 && <span className="text-[10px] text-indigo-600 animate-pulse font-serif font-semibold tracking-[0.14em]">分析中...</span>}
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${finderEkycProgress >= 25 && finderEkycProgress < 50 ? 'bg-white shadow-xs border border-indigo-200 font-bold text-indigo-900' : finderEkycProgress >= 50 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${finderEkycProgress >= 50 ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                          {finderEkycProgress >= 50 ? '✓' : '2'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">身元氏名＆生年月日の暗号照合</span>
                      </span>
                      {finderEkycProgress >= 25 && finderEkycProgress < 50 && <span className="text-[10px] text-indigo-600 animate-pulse font-serif font-semibold tracking-[0.14em]">照合中...</span>}
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${finderEkycProgress >= 50 && finderEkycProgress < 75 ? 'bg-white shadow-xs border border-indigo-200 font-bold text-indigo-900' : finderEkycProgress >= 75 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${finderEkycProgress >= 75 ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                          {finderEkycProgress >= 75 ? '✓' : '3'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">Stripe 1,200円決済処理（審査＋開封）</span>
                      </span>
                      {finderEkycProgress >= 50 && finderEkycProgress < 75 && <span className="text-[10px] text-indigo-600 animate-pulse font-serif font-semibold tracking-[0.14em]">決済中...</span>}
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${finderEkycProgress >= 75 ? 'bg-white shadow-xs border border-indigo-200 font-bold text-indigo-900' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${finderEkycProgress === 100 ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                          {finderEkycProgress === 100 ? '✓' : '4'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">手紙本文＆連絡先開示手続き</span>
                      </span>
                      {finderEkycProgress >= 75 && finderEkycProgress < 100 && <span className="text-[10px] text-indigo-600 animate-pulse font-serif font-semibold tracking-[0.14em]">発行中...</span>}
                    </div>
                  </div>
                </div>
              )}

              {finderEkycStep === 5 && (
                <div className="space-y-6">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto animate-bounce">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold font-serif text-black">本人確認および決済完了！🎉</h3>
                    <p className="text-xs text-black/60 font-sans leading-relaxed">
                      撮影書類の照合とお手続きがすべて正常に完了しました！これより手紙本文の全内容および、お相手の連絡先（LINE ID・メールアドレス等）が安全に開示されます。
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowFinderEkycModal(false);
                      // 本人確認が完了したら、手紙・連絡先表示位置までスクロール誘導
                      setTimeout(() => {
                        onEkycSuccess();
                      }, 300);
                    }}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow transition-all cursor-pointer"
                  >
                    手紙本文と連絡先を確認する
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
  );
};
