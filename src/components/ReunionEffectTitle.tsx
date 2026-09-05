import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';

export type ReunionEffectType = 
  | 'rainbow-to-emerald'   // ★ 新規提案: 高速虹色グラデーション疾走 ➔ エメラルドグリーン定着（ユーザーご提案）
  | 'rainbow-sweep-sparkle'// ★ 新規提案: 高速虹色光線スイープ ➔ エメラルド定着 ＋ キラリン星
  | 'shine-sweep'          // 1. 光の軌跡・シャインシマー ＋ キラリン星（左から右へ光が移動）
  | 'aurora-wave'          // 2. オーロラレインボー＆光彩ウェーブ（継続ループ）
  | 'sparkle-burst'        // 3. ゴールドグリッター＆祝福の星屑パーティクル
  | 'stagger-char'         // 4. 一文字ずつの順次ポップイン ＋ 黄金フラッシュ
  | 'water-flare';         // 5. 水滴波紋 ＋ レンズフレア光線

interface ReunionEffectTitleProps {
  effectType?: ReunionEffectType;
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
  triggerKey?: string | number; // 変更時にアニメーションを再トリガーするためのキー
}

export const ReunionEffectTitle: React.FC<ReunionEffectTitleProps> = ({
  effectType = 'rainbow-to-emerald',
  speed = 'normal',
  className = '',
  triggerKey = 0
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const text = "再会おめでとうございます！";
  const chars = Array.from(text);

  useEffect(() => {
    setIsPlaying(false);
    const timer = setTimeout(() => setIsPlaying(true), 50);
    return () => clearTimeout(timer);
  }, [triggerKey, effectType]);

  const speedMultiplier = speed === 'slow' ? 1.5 : speed === 'fast' ? 0.7 : 1;

  return (
    <div className={`relative inline-block select-none text-center ${className}`}>
      
      {/* ============================================================ */}
      {/* ★ パターン A: 【高速虹色グラデーション疾走 ➔ エメラルドグリーン定着】 */}
      {/* （トップページの虹色パレットが高速回転・移動し、最後グリーンに落ち着く） */}
      {/* ============================================================ */}
      {effectType === 'rainbow-to-emerald' && (
        <div className="relative inline-block overflow-visible">
          {/* ベースのグリーン文字（最終着地点） */}
          <span className="block font-bold text-emerald-600 bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 drop-shadow-xs">
            {text}
          </span>

          {/* 遷移時に高速で虹色が巡り、徐々にフェードアウトして緑に定着するレイヤー */}
          {isPlaying && (
            <motion.span
              key={`rainbow-fast-${triggerKey}`}
              initial={{ 
                opacity: 1, 
                backgroundPosition: '0% 50%',
                filter: 'brightness(1.2) drop-shadow(0 0 14px rgba(56,189,248,0.7))' 
              }}
              animate={{
                backgroundPosition: ['0% 50%', '300% 50%'],
                opacity: [1, 1, 0.9, 0],
                filter: [
                  'brightness(1.3) drop-shadow(0 0 16px rgba(192,132,252,0.8))',
                  'brightness(1.1) drop-shadow(0 0 10px rgba(52,211,153,0.6))',
                  'brightness(1) drop-shadow(0 0 0px rgba(0,0,0,0))'
                ]
              }}
              transition={{
                duration: 1.8 * speedMultiplier,
                ease: [0.16, 1, 0.3, 1],
                times: [0, 0.6, 0.85, 1]
              }}
              className="absolute inset-0 z-20 pointer-events-none font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#38BDF8] via-[#818CF8] via-[#C084FC] via-[#F472B6] via-[#FB923C] via-[#FACC15] via-[#2DD4BF] to-[#059669] bg-[length:350%_auto]"
              style={{ WebkitBackgroundClip: 'text' }}
              aria-hidden="true"
            >
              {text}
            </motion.span>
          )}

          {/* グリーン定着の瞬間に広がる柔らかなエメラルド光彩 */}
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: [0, 0.7, 0],
                scale: [0.9, 1.08, 1.15]
              }}
              transition={{ 
                delay: 0.9 * speedMultiplier,
                duration: 0.8 * speedMultiplier,
                ease: "easeOut"
              }}
              className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-300/40 via-teal-300/50 to-emerald-400/40 blur-lg rounded-full pointer-events-none"
            />
          )}

          {/* 右肩でピカッと弾けるキラリン星 */}
          {isPlaying && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -45 }}
              animate={{ 
                scale: [0, 1.5, 1],
                opacity: [0, 1, 0.9],
                rotate: [0, 180, 225]
              }}
              transition={{ 
                delay: 1.1 * speedMultiplier,
                duration: 0.6 * speedMultiplier,
                ease: "easeOut"
              }}
              className="absolute -top-4 -right-6 text-amber-400 pointer-events-none drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]"
            >
              <Sparkles size={26} className="fill-amber-300 animate-pulse" />
            </motion.div>
          )}

          {/* 左下アクセントスター */}
          {isPlaying && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.3, 0.9],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                delay: 0.4 * speedMultiplier,
                duration: 0.6 * speedMultiplier,
                ease: "easeOut"
              }}
              className="absolute -bottom-2.5 -left-5 text-teal-400 pointer-events-none drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]"
            >
              <Star size={18} className="fill-teal-300" />
            </motion.div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* ★ パターン B: 【高速虹色光線スイープ ➔ エメラルド定着 ＋ キラリン星】 */}
      {/* ============================================================ */}
      {effectType === 'rainbow-sweep-sparkle' && (
        <div className="relative inline-block overflow-visible">
          <motion.span
            key={`rainbow-sweep-${triggerKey}`}
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 1 }}
            className="relative block font-bold text-emerald-600 bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-700"
          >
            <span className="relative z-10">{text}</span>

            {/* 左から右へ高速で走り抜ける虹色の光線ビーム帯 */}
            {isPlaying && (
              <motion.span
                initial={{ x: '-130%', opacity: 0 }}
                animate={{ 
                  x: ['-130%', '130%'],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{ 
                  duration: 1.1 * speedMultiplier,
                  ease: [0.2, 0.9, 0.4, 1]
                }}
                className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-[#38BDF8] via-[#F472B6] via-[#FACC15] to-[#2DD4BF] bg-clip-text text-transparent transform -skew-x-25 filter drop-shadow-[0_0_14px_rgba(255,255,255,0.95)]"
                style={{ WebkitBackgroundClip: 'text' }}
                aria-hidden="true"
              >
                {text}
              </motion.span>
            )}

            {/* 虹色の通過ビームブラー */}
            {isPlaying && (
              <motion.div
                initial={{ left: '-35%', opacity: 0 }}
                animate={{ 
                  left: ['-35%', '115%'],
                  opacity: [0, 0.8, 0.8, 0]
                }}
                transition={{ 
                  duration: 1.1 * speedMultiplier,
                  ease: [0.2, 0.9, 0.4, 1]
                }}
                className="absolute top-0 bottom-0 w-32 -skew-x-25 bg-gradient-to-r from-sky-400/30 via-pink-400/40 via-amber-300/50 to-emerald-400/30 pointer-events-none filter blur-xs"
              />
            )}
          </motion.span>

          {/* ビーム通過直後のキラリン星 */}
          {isPlaying && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -30 }}
              animate={{ 
                scale: [0, 1.4, 1],
                opacity: [0, 1, 0.85],
                rotate: [0, 180, 210]
              }}
              transition={{ 
                delay: 0.8 * speedMultiplier,
                duration: 0.55 * speedMultiplier,
                ease: "easeOut"
              }}
              className="absolute -top-4 -right-6 text-amber-400 pointer-events-none drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]"
            >
              <Sparkles size={25} className="fill-amber-300 animate-pulse" />
            </motion.div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* パターン 1: 【光の軌跡・シャインシマー ＋ キラリン星】 */}
      {/* ============================================================ */}
      {effectType === 'shine-sweep' && (
        <div className="relative inline-block">
          <motion.span
            key={`shine-sweep-${triggerKey}`}
            initial={{ opacity: 0.9, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 * speedMultiplier }}
            className="relative block font-bold text-emerald-600 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700"
          >
            <span className="relative z-10">{text}</span>

            {/* 左から右へ走り抜ける強烈な光のハイライト（シマー帯） */}
            {isPlaying && (
              <motion.span
                initial={{ x: '-120%', opacity: 0 }}
                animate={{ 
                  x: ['-120%', '130%'],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{ 
                  duration: 1.4 * speedMultiplier,
                  ease: [0.25, 1, 0.5, 1],
                  repeat: 0
                }}
                className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-transparent via-white/95 to-transparent bg-clip-text text-transparent transform -skew-x-25 filter drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]"
                style={{ WebkitBackgroundClip: 'text' }}
                aria-hidden="true"
              >
                {text}
              </motion.span>
            )}

            {/* 光の通過ビーム線 */}
            {isPlaying && (
              <motion.div
                initial={{ left: '-30%', opacity: 0 }}
                animate={{ 
                  left: ['-30%', '110%'],
                  opacity: [0, 0.9, 0.9, 0]
                }}
                transition={{ 
                  duration: 1.4 * speedMultiplier,
                  ease: [0.25, 1, 0.5, 1]
                }}
                className="absolute top-0 bottom-0 w-24 -skew-x-25 bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent pointer-events-none filter blur-xs"
              />
            )}
          </motion.span>

          {/* キラリン星 */}
          {isPlaying && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -45 }}
              animate={{ 
                scale: [0, 1.4, 1],
                opacity: [0, 1, 0.85],
                rotate: [0, 180, 225]
              }}
              transition={{ 
                delay: 0.9 * speedMultiplier,
                duration: 0.6 * speedMultiplier,
                ease: "easeOut"
              }}
              className="absolute -top-3.5 -right-5 sm:-right-7 text-amber-400 pointer-events-none drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]"
            >
              <Sparkles size={24} className="fill-amber-300 animate-pulse" />
            </motion.div>
          )}

          {/* 左側の小さなアクセントスター */}
          {isPlaying && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.2, 0.8],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                delay: 0.3 * speedMultiplier,
                duration: 0.5 * speedMultiplier,
                ease: "easeOut"
              }}
              className="absolute -bottom-2 -left-4 text-teal-400 pointer-events-none drop-shadow-[0_0_6px_rgba(45,212,191,0.8)]"
            >
              <Star size={16} className="fill-teal-300" />
            </motion.div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* パターン 2: 【オーロラレインボー＆光彩ウェーブ】 */}
      {/* ============================================================ */}
      {effectType === 'aurora-wave' && (
        <div className="relative inline-block">
          <motion.div
            key={`aurora-${triggerKey}`}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{
              duration: 3.5 * speedMultiplier,
              repeat: Infinity,
              ease: "linear"
            }}
            className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-400 via-cyan-500 via-amber-400 to-emerald-600 bg-[length:300%_auto] filter drop-shadow-[0_2px_10px_rgba(16,185,129,0.25)]"
          >
            {text}
          </motion.div>

          {/* 柔らかい光の輪郭オーラ */}
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: [0, 0.6, 0.2],
                scale: [0.95, 1.08, 1.02]
              }}
              transition={{ duration: 1.6 * speedMultiplier, ease: "easeOut" }}
              className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-300/30 via-teal-300/40 to-amber-200/30 blur-md rounded-full pointer-events-none"
            />
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* パターン 3: 【ゴールドグリッター＆祝福の星屑パーティクル】 */}
      {/* ============================================================ */}
      {effectType === 'sparkle-burst' && (
        <div className="relative inline-block">
          <motion.span
            key={`sparkle-${triggerKey}`}
            initial={{ scale: 0.9, filter: 'brightness(1.5)' }}
            animate={{ scale: 1, filter: 'brightness(1)' }}
            transition={{ duration: 0.5 * speedMultiplier, ease: "easeOut" }}
            className="block font-bold text-emerald-600 bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 via-emerald-500 to-teal-700 drop-shadow-xs"
          >
            {text}
          </motion.span>

          {/* 舞い散る星屑パーティクル */}
          {isPlaying && (
            <div className="absolute inset-0 pointer-events-none overflow-visible">
              {[
                { x: -20, y: -15, delay: 0.1, color: 'text-amber-400', size: 16 },
                { x: 40, y: -25, delay: 0.25, color: 'text-yellow-400', size: 20 },
                { x: 120, y: -18, delay: 0.4, color: 'text-emerald-400', size: 14 },
                { x: 200, y: -28, delay: 0.55, color: 'text-amber-400', size: 18 },
                { x: 280, y: -15, delay: 0.7, color: 'text-teal-400', size: 22 },
                { x: -10, y: 25, delay: 0.3, color: 'text-teal-400', size: 14 },
                { x: 90, y: 30, delay: 0.45, color: 'text-amber-300', size: 16 },
                { x: 230, y: 28, delay: 0.6, color: 'text-emerald-400', size: 15 },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1.2, 1, 0],
                    y: [0, -18 - (i % 3) * 6],
                    rotate: [0, 90, 180]
                  }}
                  transition={{ 
                    delay: p.delay * speedMultiplier,
                    duration: 0.9 * speedMultiplier,
                    ease: "easeOut"
                  }}
                  style={{ left: `${(i / 8) * 100}%`, top: '50%' }}
                  className={`absolute ${p.color} filter drop-shadow-[0_0_6px_currentColor]`}
                >
                  <Sparkles size={p.size} className="fill-current" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* パターン 4: 【一文字ずつの順次ポップイン ＋ 黄金フラッシュ】 */}
      {/* ============================================================ */}
      {effectType === 'stagger-char' && (
        <div className="relative inline-flex items-center justify-center flex-wrap">
          {chars.map((char, index) => (
            <motion.span
              key={`char-${triggerKey}-${index}`}
              initial={{ opacity: 0, y: 14, scale: 0.8, filter: 'blur(4px)' }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: [0.8, 1.15, 1],
                filter: 'blur(0px)'
              }}
              transition={{
                delay: index * 0.045 * speedMultiplier,
                duration: 0.35 * speedMultiplier,
                ease: "backOut"
              }}
              className="inline-block font-bold text-emerald-600 drop-shadow-xs"
            >
              {char}
            </motion.span>
          ))}

          {/* 最後に全体を一瞬照らす黄金フラッシュ */}
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: [0, 0.8, 0],
                scale: [0.9, 1.06, 1.12]
              }}
              transition={{ 
                delay: chars.length * 0.045 * speedMultiplier + 0.1,
                duration: 0.5 * speedMultiplier,
                ease: "easeOut"
              }}
              className="absolute inset-0 bg-gradient-to-r from-amber-300/30 via-emerald-200/40 to-amber-300/30 rounded-2xl pointer-events-none blur-sm -z-10"
            />
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* パターン 5: 【水滴波紋 ＋ レンズフレア光線】 */}
      {/* ============================================================ */}
      {effectType === 'water-flare' && (
        <div className="relative inline-block">
          <motion.span
            key={`water-${triggerKey}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ 
              opacity: 1, 
              scale: 1
            }}
            transition={{ duration: 0.6 * speedMultiplier, ease: "easeOut" }}
            className="block font-bold text-emerald-600 bg-clip-text text-transparent bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800"
          >
            {text}
          </motion.span>

          {/* 水滴が落ちて波紋が広がるエフェクト */}
          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
              <motion.div
                initial={{ scale: 0.2, opacity: 0.9, borderWidth: '3px' }}
                animate={{ 
                  scale: [0.2, 1.8, 2.4],
                  opacity: [0.9, 0.4, 0],
                  borderWidth: ['3px', '1.5px', '0px']
                }}
                transition={{ 
                  duration: 1.2 * speedMultiplier,
                  ease: "easeOut"
                }}
                className="w-full h-full rounded-full border border-teal-400/80 filter drop-shadow-[0_0_8px_rgba(45,212,191,0.6)]"
              />
            </div>
          )}

          {/* 光のスポットが左から右へスーッと移動するレンズフレア */}
          {isPlaying && (
            <motion.div
              initial={{ left: '-15%', opacity: 0 }}
              animate={{ 
                left: ['-15%', '115%'],
                opacity: [0, 1, 1, 0]
              }}
              transition={{ 
                duration: 1.2 * speedMultiplier,
                ease: "easeInOut"
              }}
              className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-radial from-white via-teal-300/70 to-transparent pointer-events-none filter blur-xs -z-10"
            />
          )}
        </div>
      )}
    </div>
  );
};
