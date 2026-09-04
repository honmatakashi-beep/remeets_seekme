import React, { useMemo } from 'react';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

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

/* =========================================================================
   🏛️ 公式カードブランド 本物ベクターSVGアイコン
========================================================================= */

// 1. VISA 公式ロゴ
export const VisaLogo: React.FC<{ className?: string }> = ({ className = "h-6 sm:h-7" }) => (
  <svg viewBox="0 0 48 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#FFFFFF"/>
    <path d="M19.45 20.88L21.84 9.12H25.66L23.27 20.88H19.45Z" fill="#1434CB"/>
    <path d="M33.4 9.38C32.63 9.09 31.42 8.77 29.93 8.77C26.24 8.77 23.63 10.73 23.6 13.55C23.57 15.63 25.43 16.79 26.85 17.48C28.3 18.19 28.79 18.64 28.79 19.28C28.79 20.25 27.63 20.7 26.54 20.7C24.99 20.7 24.12 20.47 23.01 19.97L22.45 19.71L21.86 23.18C22.8 23.61 24.53 23.98 26.33 24C30.27 24 32.83 22.05 32.87 19.04C32.89 17.38 31.88 16.11 29.68 15.06C28.35 14.39 27.54 13.97 27.55 13.26C27.55 12.63 28.24 11.96 29.7 11.96C30.93 11.94 31.87 12.21 32.55 12.51L32.9 12.67L33.4 9.38Z" fill="#1434CB"/>
    <path d="M38.5 9.12H35.54C34.62 9.12 33.93 9.38 33.53 10.35L28.64 22H32.66L33.46 19.79H38.37L38.83 22H42.38L38.5 9.12ZM34.56 16.78C34.88 15.91 36.1 12.62 36.1 12.62C36.08 12.65 36.43 11.71 36.63 11.16L36.89 12.43C36.89 12.43 37.64 16.05 37.82 16.78H34.56Z" fill="#1434CB"/>
    <path d="M15.42 9.12L11.68 18.79L11.28 16.73C10.59 14.38 8.42 11.83 5.95 10.53L9.36 22.87H13.41L19.46 9.12H15.42Z" fill="#1434CB"/>
    <path d="M8.61 9.12H2.67L2.62 9.39C7.26 10.58 10.74 13.53 12.01 16.73L10.72 10.23C10.5 9.36 9.87 9.14 8.61 9.12Z" fill="#F7B600"/>
  </svg>
);

// 2. Mastercard 公式ロゴ
export const MastercardLogo: React.FC<{ className?: string }> = ({ className = "h-6 sm:h-7" }) => (
  <svg viewBox="0 0 48 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#FFFFFF"/>
    <circle cx="19" cy="16" r="10" fill="#EB001B"/>
    <circle cx="29" cy="16" r="10" fill="#F79E1B"/>
    <path d="M24 8.54C26.17 10.42 27.56 13.08 27.56 16.08C27.56 19.08 26.17 21.74 24 23.62C21.83 21.74 20.44 19.08 20.44 16.08C20.44 13.08 21.83 10.42 24 8.54Z" fill="#FF5F00"/>
  </svg>
);

// 3. JCB 公式3色エンブレムロゴ
export const JcbLogo: React.FC<{ className?: string }> = ({ className = "h-6 sm:h-7" }) => (
  <svg viewBox="0 0 48 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#FFFFFF"/>
    {/* Blue Bar */}
    <rect x="7" y="6" width="11" height="20" rx="3" fill="#003580"/>
    {/* Red Bar */}
    <rect x="18.5" y="6" width="11" height="20" rx="3" fill="#E60012"/>
    {/* Green Bar */}
    <rect x="30" y="6" width="11" height="20" rx="3" fill="#008836"/>
    {/* White text JCB */}
    <text x="12.5" y="19" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="10" fill="#FFFFFF" textAnchor="middle">J</text>
    <text x="24" y="19" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="10" fill="#FFFFFF" textAnchor="middle">C</text>
    <text x="35.5" y="19" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="10" fill="#FFFFFF" textAnchor="middle">B</text>
  </svg>
);

// 4. American Express 公式ロゴ
export const AmexLogo: React.FC<{ className?: string }> = ({ className = "h-6 sm:h-7" }) => (
  <svg viewBox="0 0 48 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#006FCF"/>
    <text x="24" y="14" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="6.5" fill="#FFFFFF" textAnchor="middle" letterSpacing="0.8">AMERICAN</text>
    <text x="24" y="22" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="6.5" fill="#FFFFFF" textAnchor="middle" letterSpacing="0.8">EXPRESS</text>
  </svg>
);

// 5. Diners Club 公式ロゴ
export const DinersLogo: React.FC<{ className?: string }> = ({ className = "h-6 sm:h-7" }) => (
  <svg viewBox="0 0 48 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#FFFFFF"/>
    <circle cx="24" cy="16" r="11" fill="#004A97"/>
    <path d="M24 7C19.03 7 15 11.03 15 16C15 20.97 19.03 25 24 25C28.97 25 33 20.97 33 16C33 11.03 28.97 7 24 7ZM22.2 22.8C18.45 22.18 15.6 18.95 15.6 15.08C15.6 11.21 18.45 7.98 22.2 7.36V22.8ZM25.8 22.8V7.36C29.55 7.98 32.4 11.21 32.4 15.08C32.4 18.95 29.55 22.18 25.8 22.8Z" fill="#FFFFFF"/>
  </svg>
);

// 6. Discover 公式ロゴ
export const DiscoverLogo: React.FC<{ className?: string }> = ({ className = "h-6 sm:h-7" }) => (
  <svg viewBox="0 0 48 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#FFFFFF"/>
    <text x="14" y="19" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="8" fill="#1C1C1C" textAnchor="middle">DISC</text>
    <circle cx="24" cy="16" r="5" fill="#F36F21"/>
    <text x="34" y="19" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="8" fill="#1C1C1C" textAnchor="middle">VER</text>
  </svg>
);

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
    <div className="space-y-4 text-left font-sans">
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
            className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer font-sans shadow-2xs hover:scale-102 active:scale-98"
          >
            ⚡ テスト情報自動入力
          </button>
        )}
      </div>

      {/* 🏷️ 対応カードブランド公式本物SVGロゴ一覧（高級カードプレートデザイン） */}
      <div className="p-3 bg-slate-50/95 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-700 font-sans flex items-center gap-1">
            <span>ご利用可能なカードブランド</span>
            <span className="text-[10px] font-normal text-slate-400">（国際6大ブランド対応）</span>
          </span>
          {detectedBrand !== 'unknown' && (
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full animate-pulse">
              ● {detectedBrand.toUpperCase()} 自動認識中
            </span>
          )}
        </div>

        <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
          {/* VISA */}
          <div
            className={`h-11 sm:h-12 rounded-xl border flex items-center justify-center p-1 transition-all duration-300 shadow-2xs bg-white ${
              detectedBrand === 'visa'
                ? 'border-blue-600 ring-2 ring-blue-500/40 scale-105 shadow-md -translate-y-0.5'
                : detectedBrand !== 'unknown'
                ? 'opacity-40 border-slate-200 grayscale'
                : 'border-slate-200 opacity-95 hover:border-slate-300'
            }`}
            title="VISAカード対応"
          >
            <VisaLogo className="h-6 sm:h-7 w-auto" />
          </div>

          {/* Mastercard */}
          <div
            className={`h-11 sm:h-12 rounded-xl border flex items-center justify-center p-1 transition-all duration-300 shadow-2xs bg-white ${
              detectedBrand === 'mastercard'
                ? 'border-red-600 ring-2 ring-red-500/40 scale-105 shadow-md -translate-y-0.5'
                : detectedBrand !== 'unknown'
                ? 'opacity-40 border-slate-200 grayscale'
                : 'border-slate-200 opacity-95 hover:border-slate-300'
            }`}
            title="Mastercard対応"
          >
            <MastercardLogo className="h-6 sm:h-7 w-auto" />
          </div>

          {/* JCB */}
          <div
            className={`h-11 sm:h-12 rounded-xl border flex items-center justify-center p-1 transition-all duration-300 shadow-2xs bg-white ${
              detectedBrand === 'jcb'
                ? 'border-emerald-600 ring-2 ring-emerald-500/40 scale-105 shadow-md -translate-y-0.5'
                : detectedBrand !== 'unknown'
                ? 'opacity-40 border-slate-200 grayscale'
                : 'border-slate-200 opacity-95 hover:border-slate-300'
            }`}
            title="JCBカード対応（日本国内発行カード全般）"
          >
            <JcbLogo className="h-6 sm:h-7 w-auto" />
          </div>

          {/* AMEX */}
          <div
            className={`h-11 sm:h-12 rounded-xl border flex items-center justify-center p-1 transition-all duration-300 shadow-2xs bg-white ${
              detectedBrand === 'amex'
                ? 'border-cyan-600 ring-2 ring-cyan-500/40 scale-105 shadow-md -translate-y-0.5'
                : detectedBrand !== 'unknown'
                ? 'opacity-40 border-slate-200 grayscale'
                : 'border-slate-200 opacity-95 hover:border-slate-300'
            }`}
            title="American Express対応"
          >
            <AmexLogo className="h-6 sm:h-7 w-auto" />
          </div>

          {/* Diners */}
          <div
            className={`h-11 sm:h-12 rounded-xl border flex items-center justify-center p-1 transition-all duration-300 shadow-2xs bg-white ${
              detectedBrand === 'diners'
                ? 'border-indigo-600 ring-2 ring-indigo-500/40 scale-105 shadow-md -translate-y-0.5'
                : detectedBrand !== 'unknown'
                ? 'opacity-40 border-slate-200 grayscale'
                : 'border-slate-200 opacity-95 hover:border-slate-300'
            }`}
            title="Diners Club対応"
          >
            <DinersLogo className="h-6 sm:h-7 w-auto" />
          </div>

          {/* Discover */}
          <div
            className={`h-11 sm:h-12 rounded-xl border flex items-center justify-center p-1 transition-all duration-300 shadow-2xs bg-white ${
              detectedBrand === 'discover'
                ? 'border-orange-600 ring-2 ring-orange-500/40 scale-105 shadow-md -translate-y-0.5'
                : detectedBrand !== 'unknown'
                ? 'opacity-40 border-slate-200 grayscale'
                : 'border-slate-200 opacity-95 hover:border-slate-300'
            }`}
            title="Discoverカード対応"
          >
            <DiscoverLogo className="h-6 sm:h-7 w-auto" />
          </div>
        </div>
      </div>

      {/* 📝 入力フォーム本体 */}
      <div className="space-y-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        {/* カード番号 */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between font-sans">
            <span>カード番号</span>
            {detectedBrand !== 'unknown' && (
              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 font-mono">
                <CheckCircle2 size={12} className="text-emerald-600" />
                {detectedBrand.toUpperCase()} 認証
              </span>
            )}
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              maxLength={19}
              value={cardNumber}
              onChange={handleNumberChange}
              placeholder="4242 •••• •••• 4242"
              className="w-full h-11 px-3.5 pr-16 bg-slate-50/70 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all tracking-wider"
            />
            {/* 入力枠右端のブランドインジケーター */}
            <div className="absolute right-3 flex items-center pointer-events-none">
              {detectedBrand === 'visa' && <VisaLogo className="h-6 w-auto shadow-sm" />}
              {detectedBrand === 'mastercard' && <MastercardLogo className="h-6 w-auto shadow-sm" />}
              {detectedBrand === 'jcb' && <JcbLogo className="h-6 w-auto shadow-sm" />}
              {detectedBrand === 'amex' && <AmexLogo className="h-6 w-auto shadow-sm" />}
              {detectedBrand === 'diners' && <DinersLogo className="h-6 w-auto shadow-sm" />}
              {detectedBrand === 'discover' && <DiscoverLogo className="h-6 w-auto shadow-sm" />}
              {detectedBrand === 'unknown' && <Lock size={14} className="text-slate-400" />}
            </div>
          </div>
        </div>

        {/* 有効期限 & CVC */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 block font-sans">有効期限 (MM/YY)</label>
            <input
              type="text"
              maxLength={5}
              value={cardExpiry}
              onChange={handleExpiryChange}
              placeholder="MM/YY (例: 12/29)"
              className="w-full h-11 px-3.5 bg-slate-50/70 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-center tracking-wider"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between font-sans">
              <span>CVC (セキュリティコード)</span>
              <span className="text-[9px] text-slate-400 font-normal">裏面3桁または4桁</span>
            </label>
            <input
              type="password"
              maxLength={4}
              value={cardCvc}
              onChange={handleCvcChange}
              placeholder="123"
              className="w-full h-11 px-3.5 bg-slate-50/70 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-center tracking-widest"
            />
          </div>
        </div>

        {/* カード名義人 (オプション) */}
        {onCardNameChange && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 block font-sans">
              カード名義人 <span className="text-[10px] text-slate-400 font-normal">(半角ローマ字)</span>
            </label>
            <input
              type="text"
              value={cardName || ''}
              onChange={(e) => onCardNameChange(e.target.value.toUpperCase())}
              placeholder="TARO YAMADA"
              className="w-full h-11 px-3.5 bg-slate-50/70 border border-slate-300 rounded-xl text-xs sm:text-sm font-sans uppercase text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>
        )}
      </div>

      {/* 🛡️ Stripe & PCI-DSS 公式セキュリティ保証バナー */}
      <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl space-y-2 font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 font-serif">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>Stripe暗号化決済 ＆ 国際最高セキュリティ (PCI-DSS Level 1)</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md border border-emerald-300 shrink-0">
            🔒 256-bit SSL
          </span>
        </div>
        <p className="text-[11px] text-emerald-900/80 leading-relaxed pl-5">
          入力されたクレジットカード情報は<strong>世界最高水準の暗号化通信で直接Stripe社へ送信</strong>され、当アプリのサーバーにはカード番号などの生データは一切保管されません。
        </p>
      </div>

      {/* 🔄 100% 全額即時自動返金保証バナー */}
      {refundGuaranteeText && (
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs font-sans text-amber-950 leading-relaxed">
          <CheckCircle2 size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-900 block mb-0.5">100% 全額即時自動返金保証</span>
            <span className="text-[11px] text-amber-800/90">{refundGuaranteeText}</span>
          </div>
        </div>
      )}
    </div>
  );
};
