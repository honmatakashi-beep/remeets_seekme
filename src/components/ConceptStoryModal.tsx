import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import vintageLetterPaper from '../assets/images/vintage_bottle_letter_paper_1788601708823.jpg';

interface ConceptStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConceptStoryModal: React.FC<ConceptStoryModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3.5 sm:p-6" data-lenis-prevent>
          {/* 暗転オーバーレイ */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 cursor-pointer backdrop-blur-[2px]"
          />

          {/* 四辺が傷んだヴィンテージ古紙テクスチャの手紙（用紙サイズ max-w-2xl） */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="relative w-full max-w-2xl text-[#221302] select-text z-10 max-h-[92vh] flex flex-col overflow-hidden shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)] filter drop-shadow-2xl font-letter-mincho"
            style={{
              backgroundImage: `url(${vintageLetterPaper})`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              fontFamily: '"Shippori Mincho", "Noto Serif JP", "Yu Mincho", "YuMincho", "Hiragino Mincho ProN", serif'
            }}
            data-lenis-prevent
          >
            {/* 閉じるボタン（アンティーク調・最前面） */}
            <button 
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-6 text-[#61471C]/75 hover:text-[#1F1001] transition-colors p-2 focus:outline-none cursor-pointer rounded-full hover:bg-black/10 z-30"
              aria-label="閉じる"
            >
              <X size={22} />
            </button>

            {/* スクロール領域（古紙の四辺の傷み・焦げ跡から十分なマージンを確保） */}
            <div 
              className="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar scrollbar-thin scrollbar-thumb-[#7A5B26]/30 scrollbar-track-transparent px-8 sm:px-14 md:px-18 pt-10 sm:pt-14 md:pt-16 pb-8 sm:pb-12 font-letter-mincho"
              data-lenis-prevent
            >
              {/* 手紙本文のコンテナ（紙の端からしっかり離れたセーフゾーン max-w-[500px]） */}
              <div className="w-full max-w-[500px] mx-auto flex flex-col font-letter-mincho">
                {/* アンティークな手紙ヘッダー ＆ ボタニカル飾り罫線 */}
                <div className="text-center mb-3 sm:mb-4 shrink-0 select-none font-letter-mincho">
                  {/* ボタニカル上部飾り（つる草・オリーブの葉・花装飾） */}
                  <div className="flex items-center justify-center gap-2 text-[#6B4E1F]/70 mb-1 px-3">
                    <svg viewBox="0 0 200 16" className="w-36 sm:w-48 h-3.5 sm:h-4 text-[#6B4E1F]/75" fill="currentColor">
                      {/* 左側のボタニカルのつる＆葉 */}
                      <path d="M10 8 Q45 2, 80 8 Q85 9, 90 8" fill="none" stroke="currentColor" strokeWidth="0.8" />
                      <path d="M25 6.5 C22 3, 16 4, 18 7 C21 8, 24 7.5, 25 6.5 Z" />
                      <path d="M38 9 C35 12, 29 11, 31 8 C34 7, 37 7.5, 38 9 Z" />
                      <path d="M52 6.5 C49 3, 43 4, 45 7 C48 8, 51 7.5, 52 6.5 Z" />
                      <path d="M68 9 C65 12, 59 11, 61 8 C64 7, 67 7.5, 68 9 Z" />
                      <circle cx="82" cy="7.5" r="1.5" />
                      
                      {/* 中央のクラシカル百合・花オーナメント */}
                      <path d="M100 2 C97 6, 96 9, 100 14 C104 9, 103 6, 100 2 Z" />
                      <path d="M96 6 C92 7, 91 10, 95 11 C97 9, 98 8, 96 6 Z" />
                      <path d="M104 6 C108 7, 109 10, 105 11 C103 9, 102 8, 104 6 Z" />
                      <circle cx="100" cy="14.5" r="1" />

                      {/* 右側のボタニカルのつる＆葉 */}
                      <path d="M190 8 Q155 2, 120 8 Q115 9, 110 8" fill="none" stroke="currentColor" strokeWidth="0.8" />
                      <path d="M175 6.5 C178 3, 184 4, 182 7 C179 8, 176 7.5, 175 6.5 Z" />
                      <path d="M162 9 C165 12, 171 11, 169 8 C166 7, 163 7.5, 162 9 Z" />
                      <path d="M148 6.5 C151 3, 157 4, 155 7 C152 8, 149 7.5, 148 6.5 Z" />
                      <path d="M132 9 C135 12, 141 11, 139 8 C136 7, 133 7.5, 132 9 Z" />
                      <circle cx="118" cy="7.5" r="1.5" />
                    </svg>
                  </div>

                  <h2 className="text-base sm:text-lg md:text-xl font-black text-center tracking-[0.14em] sm:tracking-[0.22em] text-[#221302] py-0.5 font-letter-mincho">
                    ボトルメールが届ける、再会の奇跡
                  </h2>

                  {/* ボタニカル下部飾り（繊細なツタとアンティークオーナメント） */}
                  <div className="flex items-center justify-center gap-2 text-[#6B4E1F]/65 mt-0.5 px-3">
                    <svg viewBox="0 0 160 12" className="w-28 sm:w-36 h-2.5 sm:h-3 text-[#6B4E1F]/65" fill="currentColor">
                      <line x1="10" y1="6" x2="65" y2="6" stroke="currentColor" strokeWidth="0.75" />
                      <path d="M45 4.5 C42 2.5, 38 3, 40 5.5 C42 6, 44 5.5, 45 4.5 Z" />
                      <path d="M58 7.5 C55 9.5, 51 9, 53 6.5 C55 6, 57 6.5, 58 7.5 Z" />
                      
                      {/* 中央のアンティークダイヤ・ドット */}
                      <circle cx="72" cy="6" r="1.2" />
                      <polygon points="80,2 84,6 80,10 76,6" />
                      <circle cx="88" cy="6" r="1.2" />
                      
                      <line x1="95" y1="6" x2="150" y2="6" stroke="currentColor" strokeWidth="0.75" />
                      <path d="M115 4.5 C118 2.5, 122 3, 120 5.5 C118 6, 116 5.5, 115 4.5 Z" />
                      <path d="M102 7.5 C105 9.5, 109 9, 107 6.5 C105 6, 103 6.5, 102 7.5 Z" />
                    </svg>
                  </div>
                </div>

                {/* 明朝体便箋の本文（フォント太さ・視認性強化） */}
                <div className="space-y-2.5 sm:space-y-3 text-[15px] sm:text-[16px] md:text-[17px] font-semibold tracking-[0.04em] sm:tracking-[0.06em] text-[#221302] leading-[1.75] font-letter-mincho">
                  <p className="border-b border-dashed border-[#7A5B26]/35 pb-1.5 font-black text-[#1A0E01] text-base sm:text-lg font-letter-mincho">
                    拝啓、いつかこの手紙を見つけるあなたへ。
                  </p>
                  
                  <p className="border-b border-dashed border-[#7A5B26]/25 pb-1.5 indent-4 sm:indent-6 font-semibold font-letter-mincho">
                    インターネットという広い海に、ボトルを託すこと。
                  </p>

                  <p className="border-b border-dashed border-[#7A5B26]/25 pb-1.5 indent-4 sm:indent-6 font-semibold font-letter-mincho">
                    あなたがここで流す「再会のボトルメール」は、インターネットという果てしない大海原を漂流し始めます。
                  </p>

                  <p className="border-b border-dashed border-[#7A5B26]/25 pb-1.5 indent-4 sm:indent-6 font-semibold font-letter-mincho">
                    ある日、あの人がふとした瞬間に、かつての思い出を懐かしみ、自分の名前やゆかりの場所を検索エンジンでふと検索したとしたら——。
                  </p>

                  <p className="border-b border-dashed border-[#7A5B26]/25 pb-1.5 indent-4 sm:indent-6 font-semibold font-letter-mincho">
                    検索結果の静かな波間に、あなたの流したボトルメールが、奇跡の光となってぷかりと浮かび上がります。
                  </p>

                  <p className="border-b border-dashed border-[#7A5B26]/25 pb-1.5 font-black text-center text-[#1A0E01] py-0.5 text-[15.5px] sm:text-[17px] font-letter-mincho">
                    「まさか、私を探している人がいる……？」
                  </p>

                  <p className="border-b border-dashed border-[#7A5B26]/25 pb-1.5 indent-4 sm:indent-6 font-semibold font-letter-mincho">
                    導かれるようにこの波打ち際にたどり着いたあの人は、あなたからのメッセージと、設定された「思い出クイズ」を目にします。
                  </p>

                  <p className="border-b border-dashed border-[#7A5B26]/25 pb-1.5 indent-4 sm:indent-6 font-semibold font-letter-mincho">
                    それは、世界であなたとあの人だけしか答えを知らない、かけがえのない記憶の鍵。
                  </p>

                  <p className="border-b border-dashed border-[#7A5B26]/25 pb-1.5 indent-4 sm:indent-6 font-semibold font-letter-mincho">
                    正解の鍵を回した瞬間、止まっていた二人の時間が再び動き出します。
                  </p>

                  <p className="border-b border-dashed border-[#7A5B26]/25 pb-1.5 indent-4 sm:indent-6 font-semibold font-letter-mincho">
                    あなたが今日流す一通のボトルは、風に乗り、波に揺られ、いつか必ず大切なあの人の元へと流れ着きます。
                  </p>

                  <p className="border-b border-dashed border-[#7A5B26]/25 pb-1.5 font-black text-center text-[#1A0E01] py-0.5 text-base sm:text-lg font-letter-mincho">
                    想いが届く、いつかのその日まで。
                  </p>

                  <div className="flex items-center justify-between pt-2.5 pb-1 text-xs sm:text-sm text-[#573E16] font-letter-mincho">
                    <div className="flex items-center gap-2 opacity-90">
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#7A5B26]/70 flex items-center justify-center text-[9px] sm:text-[10px] tracking-wider text-[#7A5B26] font-black font-letter-mincho rotate-[-10deg] shadow-2xs">
                        封蝋
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold font-letter-mincho tracking-widest">SEA DRIFT MAIL</span>
                    </div>
                    <p className="font-black text-[#1A0E01] text-sm sm:text-base font-letter-mincho">
                      ReMEETs TEAM より
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
