import React from 'react';

export type ReunionEffectType = 
  | 'pure-rainbow-flow'      // 1. トップページと全く同一の純粋な虹色グラデーション（標準速度）
  | 'pure-rainbow-fast'      // 2. 虹色グラデーション（軽快・少し早め）
  | 'pure-rainbow-gentle';   // 3. 虹色グラデーション（ゆったり穏やか）

interface ReunionEffectTitleProps {
  effectType?: ReunionEffectType | string;
  className?: string;
  speed?: 'slow' | 'normal' | 'fast';
}

export const ReunionEffectTitle: React.FC<ReunionEffectTitleProps> = ({
  effectType = 'pure-rainbow-flow',
  className = '',
  speed = 'normal'
}) => {
  const text = "再会おめでとうございます！";

  // アニメーション速度設定（秒数）
  let duration = '6s';
  if (effectType === 'pure-rainbow-fast' || speed === 'fast') {
    duration = '3.5s';
  } else if (effectType === 'pure-rainbow-gentle' || speed === 'slow') {
    duration = '10s';
  }

  return (
    <>
      <style>{`
        @keyframes topRainbowFlow {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
        .reunion-rainbow-text {
          background-image: linear-gradient(
            90deg,
            #38BDF8 0%,
            #818CF8 14.28%,
            #C084FC 28.57%,
            #F472B6 42.85%,
            #FB923C 57.14%,
            #FACC15 71.42%,
            #2DD4BF 85.71%,
            #38BDF8 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: topRainbowFlow var(--rainbow-duration, 6s) linear infinite;
          display: inline-block;
        }
      `}</style>

      <span
        style={{ '--rainbow-duration': duration } as React.CSSProperties}
        className={`reunion-rainbow-text font-serif font-bold tracking-wider select-none ${className}`}
      >
        {text}
      </span>
    </>
  );
};
