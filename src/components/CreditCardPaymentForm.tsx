import React, { useMemo } from 'react';
import { Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export type CardBrand = 'visa' | 'mastercard' | 'jcb' | 'amex' | 'diners' | 'discover' | 'unknown';

export interface CreditCardPaymentFormProps {
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName?: string;
  onCardNumberChange: (value: string) => void;
  onCardExpiryChange: (value: string) => void;
  onCardCvcChange: (value: string) => void;
  onCardNameChange?: (value: string) => void;
  amountText?: string;
  isSubmitting?: boolean;
  showDemoButton?: boolean;
  onDemoFill?: () => void;
  refundGuaranteeText?: string;
}

// カード番号からブランドを自動判定
export const detectCardBrand = (number: string): CardBrand => {
  const clean = number.replace(/\s+/g, '');
  if (/^4/.test(clean)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'mastercard';
  if (/^35(2[89]|[3-8][0-9])/.test(clean) || /^35/.test(clean)) return 'jcb';
  if (/^3[47]/.test(clean)) return 'amex';
  if (/^3(0[0-5]|[68])/.test(clean)) return 'diners';
  if (/^6(011|5)/.test(clean)) return 'discover';
  return 'unknown';
};

export const CreditCardPaymentForm: React.FC<CreditCardPaymentFormProps> = ({
  cardNumber,
  cardExpiry,
  cardCvc,
  cardName,
  onCardNumberChange,
  onCardExpiryChange,
  onCardCvcChange,
  onCardNameChange,
  amountText,
  isSubmitting = false,
  showDemoButton = false,
  onDemoFill,
  refundGuaranteeText = "本人確認が不承認となった場合は、Stripe仮売上により全額100%即時自動返金されます。"
}) => {
  const detectedBrand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d]/g, '');
    if (val.length > 16) val = val.substring(0, 16);
    // 4桁ごとにスペース挿入
    const formatted = val.replace(/(.{4})/g, '$1 ').trim();
    onCardNumberChange(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d]/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length > 2) {
      val = `${val.substring(0, 2)}/${val.substring(2)}`;
    }
    onCardExpiryChange(val);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d]/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    onCardCvcChange(val);
  };

  return (
    <div className="space-y-3.5 text-left font-sans">
      {/* 💳 金額表示 ＆ デモボタン */}
      <div className="flex items-center justify-between gap-2 pb-0.5">
        {amountText ? (
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-slate-500 font-sans">お支払い金額:</span>
            <span className="text-base md:text-lg font-bold text-slate-900 font-serif">{amountText}</span>
          </div>
        ) : (
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Lock size={13} className="text-emerald-600" />
            <span>クレジットカード決済</span>
          </span>
        )}

        {showDemoButton && onDemoFill && (
          <button
            type="button"
            onClick={onDemoFill}
            className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer font-sans"
          >
            テスト用カード自動入力
          </button>
        )}
      </div>

      {/* 🏷️ 対応カードブランドロゴ一覧 */}
      <div className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-600 font-sans shrink-0">
          ご利用可能なカード会社
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* VISA */}
          <div className={`px-2 py-0.5 rounded border text-[10px] font-extrabold tracking-wider transition-all ${
            detectedBrand === 'visa'
              ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-400 font-sans'
              : 'bg-white text-blue-800 border-slate-200 opacity-90 font-sans'
          }`}>
            VISA
          </div>

          {/* Mastercard */}
          <div className={`px-2 py-0.5 rounded border text-[10px] font-extrabold tracking-wider transition-all ${
            detectedBrand === 'mastercard'
              ? 'bg-red-600 text-white border-red-700 shadow-xs ring-2 ring-red-400 font-sans'
              : 'bg-white text-red-600 border-slate-200 opacity-90 font-sans'
          }`}>
            Mastercard
          </div>

          {/* JCB */}
          <div className={`px-2 py-0.5 rounded border text-[10px] font-extrabold tracking-wider transition-all ${
            detectedBrand === 'jcb'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-400 font-sans'
              : 'bg-white text-emerald-700 border-slate-200 opacity-90 font-sans'
          }`}>
            JCB
          </div>

          {/* AMEX */}
          <div className={`px-2 py-0.5 rounded border text-[10px] font-extrabold tracking-wider transition-all ${
            detectedBrand === 'amex'
              ? 'bg-sky-600 text-white border-sky-700 shadow-xs ring-2 ring-sky-400 font-sans'
              : 'bg-white text-sky-700 border-slate-200 opacity-90 font-sans'
          }`}>
            AMEX
          </div>

          {/* Diners */}
          <div className={`px-2 py-0.5 rounded border text-[10px] font-extrabold tracking-wider transition-all ${
            detectedBrand === 'diners'
              ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-400 font-sans'
              : 'bg-white text-indigo-700 border-slate-200 opacity-90 font-sans'
          }`}>
            Diners
          </div>
        </div>
      </div>

      {/* 📝 入力フォーム本体 */}
      <div className="space-y-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* カード番号 */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between font-sans">
            <span>カード番号</span>
            {detectedBrand !== 'unknown' && (
              <span className="text-[10px] text-teal-700 font-bold uppercase font-sans">
                {detectedBrand} 認識中
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              maxLength={19}
              disabled={isSubmitting}
              value={cardNumber}
              onChange={handleNumberChange}
              placeholder="4242 •••• •••• 4242"
              className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs md:text-sm tracking-widest focus:bg-white focus:border-teal-600 focus:outline-none transition-all shadow-inner placeholder:text-slate-400"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Lock size={15} />
            </div>
          </div>
        </div>

        {/* 有効期限 ＆ セキュリティコード */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 font-sans">有効期限 (月/年)</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              disabled={isSubmitting}
              value={cardExpiry}
              onChange={handleExpiryChange}
              placeholder="MM/YY (例: 12/29)"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs md:text-sm text-center focus:bg-white focus:border-teal-600 focus:outline-none transition-all shadow-inner placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 font-sans">CVC (セキュリティコード)</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              disabled={isSubmitting}
              value={cardCvc}
              onChange={handleCvcChange}
              placeholder="裏面の3桁番号"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs md:text-sm text-center focus:bg-white focus:border-teal-600 focus:outline-none transition-all shadow-inner placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* カード名義人（指定された場合） */}
        {onCardNameChange !== undefined && (
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 font-sans">カード名義人 (半角ローマ字)</label>
            <input
              type="text"
              disabled={isSubmitting}
              value={cardName || ''}
              onChange={(e) => onCardNameChange(e.target.value.toUpperCase())}
              placeholder="TARO YAMADA"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono uppercase text-xs md:text-sm focus:bg-white focus:border-teal-600 focus:outline-none transition-all shadow-inner placeholder:text-slate-400"
            />
          </div>
        )}
      </div>

      {/* 🔒 Stripe & PCI-DSS 公式セキュリティ保証バナー */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 space-y-1.5">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
          <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[11px] font-sans">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Powered by Stripe</span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-sans">
            PCI-DSS Level 1 国際認定
          </span>
        </div>

        <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
          🔒 カード情報は256-bit SSL暗号化によりStripe社の厳格な決済基盤へ直接送信されます。<strong>当サービスのサーバーにはクレジットカード情報は一切通過・保存されません。</strong>
        </p>

        {refundGuaranteeText && (
          <div className="pt-0.5 flex items-start gap-1.5 text-[10.5px] text-teal-800 font-medium font-sans">
            <CheckCircle2 size={13} className="text-teal-600 shrink-0 mt-0.5" />
            <span>{refundGuaranteeText}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditCardPaymentForm;
