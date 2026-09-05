import React from 'react';

export type ReunionEffectType = 
  | 'pure-rainbow-flow'      // 1. トップページと全く同一の純粋な虹色グラデーション（標準速度）
  | 'pure-rainbow-fast'      // 2. 虹色グラデーション（軽快・少し早め）
  | 'pure-rainbow-gentle';   // 3. 虹色グラデーション（ゆったり穏やか）

interface ReunionEffectTitleProps {
  effectType?: ReunionEffectType | string;
  className?: string;
  speed?: 'slow' | 'normal' | 'fast';
  text?: string;
}

export const ReunionEffectTitle: React.FC<ReunionEffectTitleProps> = ({
  effectType = 'pure-rainbow-flow',
  className = '',
  speed = 'normal',
  text = '再会おめでとうございます！'
}) => {
  let duration = '4.5s';
  if (effectType === 'pure-rainbow-fast' || speed === 'fast') {
    duration = '2.5s';
  } else if (effectType === 'pure-rainbow-gentle' || speed === 'slow') {
    duration = '7.5s';
  }

  return (
    <>
      <style>{`
        @keyframes topRainbowFlowAnim {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
      `}</style>
      <span
        style={{
          background: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 7.14%, #c084fc 14.28%, #f472b6 21.42%, #fb923c 28.57%, #facc15 35.71%, #2dd4bf 42.85%, #38bdf8 50%, #818cf8 57.14%, #c084fc 64.28%, #f472b6 71.42%, #fb923c 78.57%, #facc15 85.71%, #2dd4bf 92.85%, #38bdf8 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
          animation: `topRainbowFlowAnim ${duration} linear infinite`,
          display: 'inline-block'
        }}
        className={`font-serif font-bold tracking-wider select-none ${className}`}
      >
        {text}
      </span>
    </>
  );
};
