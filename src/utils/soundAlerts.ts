// 🔔 ReMEETs リアルタイム運営アラート・サウンド＆ブラウザ通知エンジン
// Web Audio API による高品位シンセサイザー合成音 ＆ HTML5 Web Notification API

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx || audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    console.warn("Web Audio API is not supported or failed to initialize:", e);
    return null;
  }
}

/**
 * 🚨 緊急通報・ストーキング脅迫検知用アラーム音 (CRITICAL)
 * 救急・警報スタイルの 880Hz / 659Hz 二重パルス警告音
 */
export function playEmergencyAlarm(volume: number = 0.7): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.connect(ctx.destination);

    // 2サイクルの二重パルス
    const pulses = [
      { f1: 880, f2: 659, start: 0.0, end: 0.25 },
      { f1: 880, f2: 659, start: 0.3, end: 0.55 },
      { f1: 987, f2: 784, start: 0.6, end: 0.90 },
    ];

    pulses.forEach(({ f1, f2, start, end }) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const pulseGain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(f1, now + start);
      osc2.frequency.setValueAtTime(f2, now + start);

      pulseGain.gain.setValueAtTime(0, now + start);
      pulseGain.gain.linearRampToValueAtTime(volume * 0.4, now + start + 0.03);
      pulseGain.gain.exponentialRampToValueAtTime(0.001, now + end);

      osc1.connect(pulseGain);
      osc2.connect(pulseGain);
      pulseGain.connect(gainNode);

      osc1.start(now + start);
      osc2.start(now + start);
      osc1.stop(now + end);
      osc2.stop(now + end);
    });

    gainNode.gain.setValueAtTime(1, now);
    gainNode.gain.setValueAtTime(1, now + 1.0);
  } catch (err) {
    console.error("Failed to play emergency alarm sound:", err);
  }
}

/**
 * ⚠️ 大量連続投稿スパム・AI検閲検知用警告音 (HIGH)
 * 鋭いトリプルパルス警告ビープ音 (800Hz -> 900Hz -> 1000Hz)
 */
export function playSpamWarningSound(volume: number = 0.7): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const freqs = [850, 950, 1100];

    freqs.forEach((freq, idx) => {
      const start = idx * 0.12;
      const end = start + 0.09;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + start);

      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(volume * 0.5, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + end);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + end);
    });
  } catch (err) {
    console.error("Failed to play spam warning sound:", err);
  }
}

/**
 * 🔔 通常通知・接続確認用クリスタルチャイム音 (INFO)
 * 澄んだ和音アルペジオ (C5 -> E5 -> G5 -> C6)
 */
export function playChimeSound(volume: number = 0.6): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, idx) => {
      const start = idx * 0.07;
      const end = start + 0.45;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(volume * 0.35, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + end);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + end);
    });
  } catch (err) {
    console.error("Failed to play chime sound:", err);
  }
}

/**
 * HTML5 Web Notification API によるデスクトップ通知の許可要求
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn("This browser does not support desktop notifications.");
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error("Failed to request notification permission:", err);
    return 'denied';
  }
}

/**
 * デスクトップ通知の送信
 */
export function triggerDesktopNotification({
  title,
  body,
  tag,
  icon = '/src/assets/images/remeet_icon_1779645087720.png',
  requireInteraction = true,
  onClick
}: {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  requireInteraction?: boolean;
  onClick?: () => void;
}): Notification | null {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon,
      badge: icon,
      tag: tag || `remeets-alert-${Date.now()}`,
      requireInteraction
    });

    if (onClick) {
      notification.onclick = () => {
        window.focus();
        onClick();
        notification.close();
      };
    }

    return notification;
  } catch (err) {
    console.error("Failed to trigger desktop notification:", err);
    return null;
  }
}
