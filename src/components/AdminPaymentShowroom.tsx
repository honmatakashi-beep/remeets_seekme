import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Lock,
  RefreshCw,
  Coins,
  Heart,
  Coffee,
  X,
  Eye,
  Check,
  RotateCcw,
  Zap,
  Info,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  CreditCardPaymentForm,
  CardBrand,
  detectCardBrand,
  VisaLogo,
  MastercardLogo,
  JcbLogo,
  AmexLogo,
  DinersLogo,
  DiscoverLogo
} from './CreditCardPaymentForm';

export type PaymentScenario = 
  | 'letter_reveal'        // 手紙開示・連絡先開示 (600円)
  | 'letter_with_ekyc'     // 手紙開示 + eKYC同時 (1,200円)
  | 'mypage_ekyc'          // マイページ単体eKYC (600円)
  | 'supporter_donation'   // サポーター支援・コーヒー寄付 (500円〜)
  | 'system_donation';     // 運営応援寄付 (1,000円〜)

interface TestCardPreset {
  brandName: string;
  brand: CardBrand;
  number: string;
  expiry: string;
  cvc: string;
  name: string;
  badgeBg: string;
}

const TEST_CARDS: TestCardPreset[] = [
  { brandName: 'VISA', brand: 'visa', number: '4111 1111 1111 1111', expiry: '12/29', cvc: '123', name: 'TAKASHI HONMA', badgeBg: 'border-blue-300 hover:border-blue-500 bg-blue-50/50' },
  { brandName: 'Mastercard', brand: 'mastercard', number: '5555 5555 5555 4444', expiry: '10/28', cvc: '888', name: 'KENJI SATO', badgeBg: 'border-red-300 hover:border-red-500 bg-red-50/50' },
  { brandName: 'JCB', brand: 'jcb', number: '3528 1234 5678 9012', expiry: '06/27', cvc: '567', name: 'YUKI TANAKA', badgeBg: 'border-emerald-300 hover:border-emerald-500 bg-emerald-50/50' },
  { brandName: 'AMEX', brand: 'amex', number: '3782 8224 6310 005', expiry: '04/29', cvc: '1234', name: 'TAKASHI HONMA', badgeBg: 'border-cyan-300 hover:border-cyan-500 bg-cyan-50/50' },
  { brandName: 'Diners', brand: 'diners', number: '3600 0000 0000 00', expiry: '11/28', cvc: '999', name: 'HANAKO YAMADA', badgeBg: 'border-indigo-300 hover:border-indigo-500 bg-indigo-50/50' },
  { brandName: 'Discover', brand: 'discover', number: '6011 0000 0000 0000', expiry: '08/30', cvc: '321', name: 'JOHN DOE', badgeBg: 'border-orange-300 hover:border-orange-500 bg-orange-50/50' },
];

export const AdminPaymentShowroom: React.FC = () => {
  const [currentScenario, setCurrentScenario] = useState<PaymentScenario>('letter_reveal');
  const [modalOpen, setModalOpen] = useState(false);
  
  // 決済フォーム状態
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvc, setCardCvc] = useState('123');
  const [cardName, setCardName] = useState('TAKASHI HONMA');
  const [donationQty, setDonationQty] = useState(1);
  const [customDonationAmount, setCustomDonationAmount] = useState(3000);

  // 決済実行シミュレーション状態
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successDetail, setSuccessDetail] = useState<string>('');

  const detectedBrand = detectCardBrand(cardNumber);

  // プリセット注入（クリックと同時に実機モーダルを自動ポップアップ！）
  const applyPresetAndOpenModal = (preset: TestCardPreset) => {
    setCardNumber(preset.number);
    setCardExpiry(preset.expiry);
    setCardCvc(preset.cvc);
    setCardName(preset.name);
    setIsSuccess(false);
    // 自動で実機モーダルを起動
    setModalOpen(true);
  };

  const clearForm = () => {
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    setCardName('');
    setIsSuccess(false);
  };

  // 決済シミュレーション実行
  const handleSimulatePayment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cardNumber.trim() || cardNumber.length < 14) {
      alert('有効なカード番号を入力してください。');
      return;
    }
    setIsProcessing(true);
    setIsSuccess(false);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      const scenarioTitles: Record<PaymentScenario, string> = {
        letter_reveal: '手紙開示・連絡先交換（600円）',
        letter_with_ekyc: '手紙開封 ＋ 公的本人確認eKYC（1,200円）',
        mypage_ekyc: 'マイページ公的eKYC本人確認（600円）',
        supporter_donation: 'サポーター支援金（¥' + (donationQty * 500).toLocaleString() + '）',
        system_donation: 'ReMEETs運営応援寄付（¥' + customDonationAmount.toLocaleString() + '）'
      };
      setSuccessDetail(scenarioTitles[currentScenario]);
    }, 1200);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 🚀 ヘッダー＆ワンクリック即時モーダル起動カードバー */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-indigo-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <Sparkles size={13} className="text-emerald-400 animate-pulse" />
              <span>公式カードブランドSVG搭載 / 決済ショールーム</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-serif tracking-wide text-white flex items-center gap-2">
              <span>💳 本物の決済画面プレビュー・シミュレーター</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-3xl">
              <strong>下のカードブランド（VISA / Master / JCB等）をクリックすると、その場で実際の決済ポップアップが自動で開きます。</strong>
              各国際ブランドの本物公式ロゴ、自動ハイライト判定、Stripe暗号化バナー、返金保証の動作を体験できます。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Eye size={16} />
              <span>モーダルを開いて確認</span>
            </button>
          </div>
        </div>

        {/* 🌟 本物カードブランド即時起動バー（クリックで即モーダル展開） */}
        <div className="mt-6 pt-5 border-t border-slate-700/60">
          <div className="text-xs font-bold text-emerald-300 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Zap size={15} className="text-amber-400 animate-bounce" />
              <span>カードを押すと、即座に実機モーダルが自動で開きます（1クリック起動）:</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">全6大ブランド対応</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {TEST_CARDS.map((card) => (
              <button
                key={card.brand}
                type="button"
                onClick={() => applyPresetAndOpenModal(card)}
                className="bg-white hover:bg-slate-50 text-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-300 shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 group"
                title={card.brandName + 'のテスト情報を注入して決済モーダルを即座に開く'}
              >
                <div className="h-9 sm:h-10 flex items-center justify-center">
                  {card.brand === 'visa' && <VisaLogo className="h-7 sm:h-8 w-auto" />}
                  {card.brand === 'mastercard' && <MastercardLogo className="h-7 sm:h-8 w-auto" />}
                  {card.brand === 'jcb' && <JcbLogo className="h-7 sm:h-8 w-auto" />}
                  {card.brand === 'amex' && <AmexLogo className="h-7 sm:h-8 w-auto" />}
                  {card.brand === 'diners' && <DinersLogo className="h-7 sm:h-8 w-auto" />}
                  {card.brand === 'discover' && <DiscoverLogo className="h-7 sm:h-8 w-auto" />}
                </div>
                <div className="text-xs font-bold text-indigo-700 flex items-center gap-1 group-hover:underline">
                  <span>{card.brandName}で開く</span>
                  <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* シナリオ選択タブ */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
          <button
            type="button"
            onClick={() => { setCurrentScenario('letter_reveal'); setIsSuccess(false); }}
            className={'p-3 rounded-xl text-left transition-all cursor-pointer ' + (
              currentScenario === 'letter_reveal'
                ? 'bg-emerald-50 border-2 border-emerald-500 shadow-2xs text-emerald-950'
                : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
            )}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="flex items-center gap-1">
                <Coins size={14} className="text-emerald-600" />
                ① 通常手紙開示
              </span>
              <span className="text-[11px] font-mono text-emerald-700 font-extrabold">600円</span>
            </div>
            <p className="text-[10px] text-slate-500 line-clamp-1">手紙全文 ＋ 連絡先開示</p>
          </button>

          <button
            type="button"
            onClick={() => { setCurrentScenario('letter_with_ekyc'); setIsSuccess(false); }}
            className={'p-3 rounded-xl text-left transition-all cursor-pointer ' + (
              currentScenario === 'letter_with_ekyc'
                ? 'bg-indigo-50 border-2 border-indigo-500 shadow-2xs text-indigo-950'
                : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
            )}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-indigo-600" />
                ② 開封＋eKYC同時
              </span>
              <span className="text-[11px] font-mono text-indigo-700 font-extrabold">1,200円</span>
            </div>
            <p className="text-[10px] text-slate-500 line-clamp-1">手紙開示 600円 ＋ eKYC 600円</p>
          </button>

          <button
            type="button"
            onClick={() => { setCurrentScenario('mypage_ekyc'); setIsSuccess(false); }}
            className={'p-3 rounded-xl text-left transition-all cursor-pointer ' + (
              currentScenario === 'mypage_ekyc'
                ? 'bg-teal-50 border-2 border-teal-500 shadow-2xs text-teal-950'
                : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
            )}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="flex items-center gap-1">
                <Lock size={14} className="text-teal-600" />
                ③ マイページeKYC
              </span>
              <span className="text-[11px] font-mono text-teal-700 font-extrabold">600円</span>
            </div>
            <p className="text-[10px] text-slate-500 line-clamp-1">公的証明書・単体審査</p>
          </button>

          <button
            type="button"
            onClick={() => { setCurrentScenario('supporter_donation'); setIsSuccess(false); }}
            className={'p-3 rounded-xl text-left transition-all cursor-pointer ' + (
              currentScenario === 'supporter_donation'
                ? 'bg-amber-50 border-2 border-amber-500 shadow-2xs text-amber-950'
                : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
            )}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="flex items-center gap-1">
                <Coffee size={14} className="text-amber-600" />
                ④ サポーター支援
              </span>
              <span className="text-[11px] font-mono text-amber-700 font-extrabold">500円〜</span>
            </div>
            <p className="text-[10px] text-slate-500 line-clamp-1">コーヒー1杯から支援</p>
          </button>

          <button
            type="button"
            onClick={() => { setCurrentScenario('system_donation'); setIsSuccess(false); }}
            className={'p-3 rounded-xl text-left transition-all cursor-pointer ' + (
              currentScenario === 'system_donation'
                ? 'bg-rose-50 border-2 border-rose-500 shadow-2xs text-rose-950'
                : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
            )}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="flex items-center gap-1">
                <Heart size={14} className="text-rose-600" />
                ⑤ 運営応援寄付
              </span>
              <span className="text-[11px] font-mono text-rose-700 font-extrabold">1,000円〜</span>
            </div>
            <p className="text-[10px] text-slate-500 line-clamp-1">サーバー・AI運用寄付</p>
          </button>
        </div>
      </div>

      {/* メインプレビューエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 左側: 決済UIプレビュー */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-150 pb-3">
            <div>
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest block font-sans">Live Component Preview</span>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                {currentScenario === 'letter_reveal' && '① 通常手紙開示・連絡先交換（600円）'}
                {currentScenario === 'letter_with_ekyc' && '② 手紙開示 ＋ 公的本人確認eKYC（1,200円）'}
                {currentScenario === 'mypage_ekyc' && '③ マイページ公的eKYC本人確認（600円）'}
                {currentScenario === 'supporter_donation' && '④ サポーター支援・コーヒー寄付モーダル'}
                {currentScenario === 'system_donation' && '⑤ ReMEETs運営応援・寄付モーダル'}
              </h3>
            </div>
            <span className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-bold">
              現在認識: <strong className="text-indigo-600 uppercase font-mono">{detectedBrand}</strong>
            </span>
          </div>

          {/* シナリオ別オプション設定（サポーター寄付や応援寄付用） */}
          {currentScenario === 'supporter_donation' && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
              <label className="font-bold text-amber-900 block">☕ 支援するコーヒーの杯数</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDonationQty(num)}
                    className={'px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ' + (
                      donationQty === num
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-100'
                    )}
                  >
                    ☕ × {num} (¥{(num * 500).toLocaleString()})
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentScenario === 'system_donation' && (
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2 text-xs">
              <label className="font-bold text-rose-900 block">💖 応援寄付金額の選択</label>
              <div className="flex items-center gap-2">
                {[1000, 3000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCustomDonationAmount(amt)}
                    className={'px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ' + (
                      customDonationAmount === amt
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white border border-rose-300 text-rose-900 hover:bg-rose-100'
                    )}
                  >
                    ¥{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 実際の共通決済コンポーネント */}
          <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50">
            <CreditCardPaymentForm
              cardNumber={cardNumber}
              cardExpiry={cardExpiry}
              cardCvc={cardCvc}
              cardName={cardName}
              onCardNumberChange={setCardNumber}
              onCardExpiryChange={setCardExpiry}
              onCardCvcChange={setCardCvc}
              onCardNameChange={setCardName}
              amountText={
                currentScenario === 'letter_reveal' ? '手紙開示・接続手数料: 600 円（税込・買い切り）' :
                currentScenario === 'letter_with_ekyc' ? '手紙開封 600円 ＋ eKYC 600円：合計 1,200 円（税込）' :
                currentScenario === 'mypage_ekyc' ? 'eKYC本人確認審査費用: 600 円（税込）' :
                currentScenario === 'supporter_donation' ? 'ご支援額: ¥' + (donationQty * 500).toLocaleString() + '（税込）' :
                'ご支援・寄付額: ¥' + customDonationAmount.toLocaleString() + '（税込）'
              }
              showDemoButton={true}
              onDemoFill={() => {
                setCardNumber('4111 1111 1111 1111');
                setCardExpiry('12/29');
                setCardCvc('123');
                setCardName('TAKASHI HONMA');
              }}
              refundGuaranteeText={
                currentScenario === 'supporter_donation' || currentScenario === 'system_donation'
                  ? '決済はStripeの国際最高セキュリティ規格 (PCI-DSS Level 1) で安全に処理されます。'
                  : '手紙開封または本人確認（eKYC）審査が不承認となった場合は、Stripe仮売上システムにより全額即時自動返金されます。'
              }
            />

            {/* 決済シミュレーションボタン */}
            <div className="pt-4 mt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleSimulatePayment()}
                disabled={isProcessing}
                className={'w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 ' + (
                  currentScenario === 'letter_reveal'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800'
                    : currentScenario === 'letter_with_ekyc'
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800'
                    : currentScenario === 'mypage_ekyc'
                    ? 'bg-gradient-to-r from-teal-700 to-indigo-800 hover:from-teal-800 hover:to-indigo-900'
                    : currentScenario === 'supporter_donation'
                    ? 'bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700'
                    : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700'
                )}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Stripe決済・オーソリ処理中...</span>
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>
                      {currentScenario === 'letter_reveal' && '600円 で手紙と連絡先を開く（テスト決済）'}
                      {currentScenario === 'letter_with_ekyc' && '1,200円 で公的本人確認＆手紙開示（テスト決済）'}
                      {currentScenario === 'mypage_ekyc' && '600円 でeKYC本人確認審査を実行（テスト決済）'}
                      {currentScenario === 'supporter_donation' && '¥' + (donationQty * 500).toLocaleString() + ' でサポーター支援を実行'}
                      {currentScenario === 'system_donation' && '¥' + customDonationAmount.toLocaleString() + ' でReMEETsを応援寄付'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 決済成功シミュレーション結果 */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl space-y-2 text-xs font-sans text-emerald-950"
              >
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span>🎉 決済シミュレーション成功（Stripe Auth OK）</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  <strong>決済内容:</strong> {successDetail}<br />
                  <strong>カード番号:</strong> {cardNumber} ({detectedBrand.toUpperCase()})<br />
                  <strong>トランザクションID:</strong> <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded text-emerald-900">ch_sim_{Date.now()}</code><br />
                  <strong>安全保証:</strong> 不承認時はStripe Webhookにより自動即時返金が発火します。
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 右側: 仕様・セキュリティ構造・監査ガイド */}
        <div className="lg:col-span-5 space-y-5">
          {/* 安全設計・安心仕様カード */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs font-sans">
            <h4 className="font-bold text-slate-900 font-serif flex items-center gap-1.5 text-sm">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>決済セキュリティ 4重防御体制</span>
            </h4>
            
            <div className="space-y-3 text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  1. 🛡️ PCI-DSS Level 1 国際認定
                </span>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Stripe社の最高水準セキュリティインフラに準拠。カード番号の生データはサーバーを一切経由せず安全にトークン化されます。
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  2. 🔒 256-bit SSL 高度暗号化
                </span>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  通信経路上の盗聴・改ざんを100%防止。ユーザーが入力した瞬間にクライアントサイドで暗号化されます。
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  3. 🔄 100% 全額即時自動返金システム
                </span>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  eKYC身分証審査の不鮮明・不承認時や通信エラー時は、仮売上（オーソリ）の即時キャンセルにより、ユーザーに不当な課金は一切発生しません。
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  4. 🎯 6大カードブランド公式SVG＆即時認識
                </span>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  VISA、Mastercard、JCB、AMEX、Diners、Discoverの各公式ベクターロゴマークを搭載し、入力番号からリアルタイム判定します。
                </p>
              </div>
            </div>
          </div>

          {/* 料金体系サマリー */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm space-y-3 text-xs font-sans">
            <h4 className="font-bold font-serif text-sm text-emerald-300 flex items-center gap-1.5">
              <Coins size={15} />
              <span>確定料金体系（月額・登録料 0円）</span>
            </h4>
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span>登録・検索・ボトル投函</span>
                <span className="font-bold text-emerald-400">0 円（完全無料）</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span>通常手紙開封・連絡先開示</span>
                <span className="font-bold text-white font-mono">600 円（買い切り）</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span>公的本人確認（eKYC）審査</span>
                <span className="font-bold text-white font-mono">600 円（1回）</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span>手紙開封＋eKYC同時決済</span>
                <span className="font-bold text-amber-300 font-mono">1,200 円（税込）</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📱 実機ポップアップモーダル（カードクリックで即座にここが開く） */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 my-auto max-h-[90vh] overflow-y-auto text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-xs">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest block font-sans">Modal Viewport Simulator</span>
                    <h3 className="text-base font-bold text-slate-900 font-serif">
                      実機決済モーダル（本番同様UI）
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <CreditCardPaymentForm
                cardNumber={cardNumber}
                cardExpiry={cardExpiry}
                cardCvc={cardCvc}
                cardName={cardName}
                onCardNumberChange={setCardNumber}
                onCardExpiryChange={setCardExpiry}
                onCardCvcChange={setCardCvc}
                onCardNameChange={setCardName}
                amountText={
                  currentScenario === 'letter_reveal' ? '手紙開示・接続手数料: 600 円（税込・買い切り）' :
                  currentScenario === 'letter_with_ekyc' ? '手紙開封 600円 ＋ eKYC 600円：合計 1,200 円（税込）' :
                  currentScenario === 'mypage_ekyc' ? 'eKYC本人確認審査費用: 600 円（税込）' :
                  currentScenario === 'supporter_donation' ? 'ご支援額: ¥' + (donationQty * 500).toLocaleString() + '（税込）' :
                  'ご支援・寄付額: ¥' + customDonationAmount.toLocaleString() + '（税込）'
                }
                showDemoButton={true}
                onDemoFill={() => {
                  setCardNumber('4111 1111 1111 1111');
                  setCardExpiry('12/29');
                  setCardCvc('123');
                  setCardName('TAKASHI HONMA');
                }}
                refundGuaranteeText={
                  currentScenario === 'supporter_donation' || currentScenario === 'system_donation'
                    ? '決済はStripeの国際最高セキュリティ規格 (PCI-DSS Level 1) で安全に処理されます。'
                    : '手紙開封または本人確認（eKYC）審査が不承認となった場合は、Stripe仮売上システムにより全額即時自動返金されます。'
                }
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  閉じる
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSimulatePayment();
                    setTimeout(() => setModalOpen(false), 1300);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Lock size={14} />
                  <span>テスト決済を実行</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
