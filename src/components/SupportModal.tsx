import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Coffee, ShieldCheck, CheckCircle2, Sparkles, CreditCard, Lock, X, BookOpen } from 'lucide-react';
import { CreditCardPaymentForm } from './CreditCardPaymentForm';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [customMessage, setCustomMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Payment card simulation inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  useEffect(() => {
    const lenis = (window as any).lenis;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (lenis) {
        lenis.stop();
        document.documentElement.classList.add('lenis-stopped');
      }
    } else {
      document.body.style.overflow = '';
      if (lenis) {
        lenis.start();
        document.documentElement.classList.remove('lenis-stopped');
      }
    }
    return () => {
      document.body.style.overflow = '';
      if (lenis) {
        lenis.start();
        document.documentElement.classList.remove('lenis-stopped');
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const unitPrice = 500;
  const totalPrice = quantity * unitPrice;

  const presetOptions = [
    { qty: 1, label: '☕ 1口', price: '¥500', desc: 'コーヒー1杯' },
    { qty: 3, label: '🌊 3口', price: '¥1,500', desc: '海サポーター' },
    { qty: 5, label: '🌟 5口', price: '¥2,500', desc: '人気！守り人' },
    { qty: 10, label: '💖 10口', price: '¥5,000', desc: '特別支援' },
    { qty: 20, label: '👑 20口', price: '¥10,000', desc: '最高峰スポンサー' }
  ];

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      try {
        localStorage.setItem('remeets_is_supporter', 'true');
      } catch (e) {
        // ignore
      }
      if (onSuccess) onSuccess();
    }, 1500);
  };

  const handleReset = () => {
    setIsCompleted(false);
    setCustomMessage('');
    onClose();
  };

  return (
    <div
      data-lenis-prevent
      onClick={onClose}
      className="fixed inset-0 z-[200] overflow-y-auto overscroll-contain p-3 sm:p-4 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans"
    >
      <div
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 my-auto max-h-[90vh] sm:max-h-[85vh] overflow-y-auto overscroll-contain"
      >
        {/* Header decoration with amber, orange, and deep warm gradient */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-amber-800 p-5 md:p-6 text-white text-center relative border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-white/80 hover:text-white bg-white/15 hover:bg-white/25 rounded-full transition-all cursor-pointer shadow-xs z-10"
            aria-label="閉じる"
          >
            <X size={18} />
          </button>
          
          <div className="w-10 h-10 md:w-12 md:h-12 mx-auto bg-white/20 border border-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center mb-2 md:mb-3 shadow-inner">
            <Coffee size={22} className="text-amber-100 shrink-0" />
          </div>
          
          <span className="text-[9.5px] md:text-[10px] font-extrabold uppercase tracking-widest bg-white/20 text-white border border-white/30 px-3 py-0.5 md:py-1 rounded-full shadow-2xs">
            ReMEETs SUPPORT & DONATION
          </span>
          <h2 className="text-xl md:text-2xl font-black font-serif mt-2 tracking-wide text-white drop-shadow-md">
            運営応援（サポーター寄付）
          </h2>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 md:p-8 space-y-5">
          {!isCompleted ? (
            <form onSubmit={handleDonate} className="space-y-5">
              {/* Emotional Copy Box */}
              <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl space-y-2 text-slate-800">
                <p className="text-xs md:text-sm font-medium leading-relaxed text-slate-800">
                  「ReMEETsは、大切な思い出を持つすべての方が無料で手紙を流せるよう、個人運営とAI安全監査費を寄付で賄っています。この海が消えてしまわないよう、1杯のコーヒー代で応援していただけませんか？」
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-800/80 font-bold pt-1">
                  <Coffee size={14} className="text-amber-600 shrink-0" />
                  <span>温かいご支援は、サーバー維持費とAI安全モデレーション運用に大切に活用されます。</span>
                </div>
              </div>

              {/* Quick Preset Buttons (提案 4) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>応援口数を選択（ワンタップ）</span>
                  <span className="text-xs text-rose-600 font-extrabold font-serif">
                    合計: ¥{totalPrice.toLocaleString()} (税込)
                  </span>
                </label>

                <div className="grid grid-cols-5 gap-1.5">
                  {presetOptions.map((opt) => (
                    <button
                      key={opt.qty}
                      type="button"
                      onClick={() => setQuantity(opt.qty)}
                      className={`p-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        quantity === opt.qty
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm scale-[1.02]'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-xs font-bold leading-tight">{opt.label}</span>
                      <span className={`text-[10px] font-mono leading-none ${quantity === opt.qty ? 'text-teal-100' : 'text-slate-500'}`}>
                        {opt.price}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Pulldown for custom quantity */}
                <div className="pt-1.5">
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold text-xs focus:border-teal-600 focus:bg-white outline-none transition-all cursor-pointer font-sans"
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num}口 ({(num * unitPrice).toLocaleString()}円) {num === 1 ? '☕ コーヒー1杯分' : num === 3 ? '🌊 海サポーター' : num === 5 ? '🌟 サポーター人気口数' : num === 10 ? '💖 特別サポーター' : num === 20 ? '👑 最高峰スポンサー' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Cheer Message Field (提案 4) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>応援メッセージ（任意）</span>
                  <span className="text-[10.5px] text-slate-400 font-normal">{customMessage.length}/100文字</span>
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="例: 昔の同級生と再会できました！応援しています。"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:bg-white outline-none transition-all"
                />
              </div>

              {/* Payment Card Form Simulation */}
              <div className="pt-2 border-t border-slate-100">
                <CreditCardPaymentForm
                  cardNumber={cardNumber}
                  cardExpiry={cardExpiry}
                  cardCvc={cardCvc}
                  onCardNumberChange={setCardNumber}
                  onCardExpiryChange={setCardExpiry}
                  onCardCvcChange={setCardCvc}
                  amountText={`ご支援額: ¥${(quantity * 500).toLocaleString()}（税込）`}
                  showDemoButton={true}
                  onDemoFill={() => {
                    setCardNumber('4242 4242 4242 4242');
                    setCardExpiry('12/28');
                    setCardCvc('123');
                  }}
                  refundGuaranteeText="決済はStripeの国際最高セキュリティ規格 (PCI-DSS Level 1) で安全に処理されます。"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-800 hover:from-amber-600 hover:via-orange-700 hover:to-amber-900 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-amber-950/25 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-amber-400/40 active:scale-98"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Coffee size={18} className="text-amber-100 shrink-0 drop-shadow-xs" />
                      <span className="drop-shadow-xs">{totalPrice.toLocaleString()}円で ReMEETsを応援（寄付）</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-2 font-sans leading-tight">
                  ※ 月額の自動引き落としではありません。1回限りの都度決済です（寄付金控除対象外）。
                </p>
                <div className="text-center pt-2">
                  <Link
                    to="/supporter"
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-xs text-teal-700 font-bold hover:underline"
                  >
                    <BookOpen size={13} />
                    <span>寄付の詳しい趣旨・使途・FAQを見る</span>
                  </Link>
                </div>
              </div>
            </form>
          ) : (
            /* Completed Thank You Screen */
            <div className="text-center py-4 space-y-5 animate-fade-in font-sans">
              <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-300 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  💖 温かいご支援をありがとうございます
                </span>
                <h3 className="text-xl font-serif font-bold text-slate-900">
                  {totalPrice.toLocaleString()}円のご寄付を受領いたしました
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  皆様のおかげで、ReMEETsの海とAI安全監視機能が本日も守られます。<br />
                  大切な思い出がどこかで優しく繋がるよう、引き続き誠心誠意運営してまいります。
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>ご寄付受付番号</span>
                  <span className="font-mono text-indigo-600">SUP-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
                <div className="flex justify-between">
                  <span>応援口数</span>
                  <span>{quantity} 口 ({totalPrice.toLocaleString()}円)</span>
                </div>
                {customMessage && (
                  <div className="pt-1 border-t border-slate-200">
                    <span className="block font-bold text-slate-700 mb-0.5">温かいメッセージ:</span>
                    <p className="text-slate-600 italic bg-white p-2 rounded-lg border border-slate-100">
                      「{customMessage}」
                    </p>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span>ステータス</span>
                  <span className="text-emerald-600 font-bold">決済完了</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                閉じる
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
