/**
 * ReMEETs Gentle Ambient Ocean Wave Engine (Web Audio API)
 * 0KB external assets, 100% procedurally synthesized authentic soothing ocean waves.
 * 
 * Multi-layer acoustic model:
 * 1. Deep Oceanic Swell (Brown Noise, 50Hz - 180Hz) - low-end warmth & depth
 * 2. Surf Crest & Foam Rush (Bandpass Pink Noise, 700Hz - 2800Hz) - gentle splash
 * 3. Shoreline Recede / Sand Backwash (Stereo-panned Pink Noise) - gentle sandy pullback
 * 4. Asymmetric Tidal Rhythm - natural 7-9s swell & gradual retreat curve
 */

class OceanWaveSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private activeNodes: { stop?: () => void; disconnect: () => void }[] = [];
  private tideTimer: any = null;

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      this.ctx = new AudioCtx();
    }
  }

  // Create high quality stereo Pink Noise (balanced natural sound)
  private createPinkNoiseBuffer(ctx: AudioContext, durationSec = 6): AudioBuffer {
    const bufferSize = ctx.sampleRate * durationSec;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const output = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
        b6 = white * 0.115926;
      }
    }
    return buffer;
  }

  // Create deep Brown Noise (rich deep ocean rumble without harsh wind frequencies)
  private createBrownNoiseBuffer(ctx: AudioContext, durationSec = 6): AudioBuffer {
    const bufferSize = ctx.sampleRate * durationSec;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const output = buffer.getChannelData(channel);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 0.45; // gentle warm scaling
      }
    }
    return buffer;
  }

  public async start(): Promise<boolean> {
    try {
      this.init();
      if (!this.ctx) return false;

      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }

      if (this.isPlaying) return true;

      const now = this.ctx.currentTime;
      this.activeNodes = [];

      // ── Master Gain with gentle fade-in ──
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.16, now + 2.0); // comfortable gentle volume
      this.masterGain.connect(this.ctx.destination);

      // ── 1. Deep Ocean Body Swell (温かみのある深い海のうねり・安心感) ──
      const brownBuffer = this.createBrownNoiseBuffer(this.ctx);
      const deepSource = this.ctx.createBufferSource();
      deepSource.buffer = brownBuffer;
      deepSource.loop = true;

      const deepFilter = this.ctx.createBiquadFilter();
      deepFilter.type = "lowpass";
      deepFilter.frequency.setValueAtTime(130, now);
      deepFilter.Q.setValueAtTime(0.7, now);

      const deepGain = this.ctx.createGain();
      deepGain.gain.setValueAtTime(0.35, now);

      deepSource.connect(deepFilter);
      deepFilter.connect(deepGain);
      deepGain.connect(this.masterGain);
      deepSource.start(now);
      this.activeNodes.push(deepSource, deepFilter, deepGain);

      // ── 2. Mid Shore Surf & Wash (打ち寄せる白波・波頭のザザーッという心地よい音) ──
      const pinkBuffer = this.createPinkNoiseBuffer(this.ctx);
      const surfSource = this.ctx.createBufferSource();
      surfSource.buffer = pinkBuffer;
      surfSource.loop = true;

      const surfFilter = this.ctx.createBiquadFilter();
      surfFilter.type = "lowpass";
      surfFilter.frequency.setValueAtTime(280, now);
      surfFilter.Q.setValueAtTime(0.9, now);

      const surfGain = this.ctx.createGain();
      surfGain.gain.setValueAtTime(0.18, now);

      surfSource.connect(surfFilter);
      surfFilter.connect(surfGain);
      surfGain.connect(this.masterGain);
      surfSource.start(now);
      this.activeNodes.push(surfSource, surfFilter, surfGain);

      // ── 3. High Sparkling Seafoam / Sand Spray (砂浜のサラサラ・泡立ち成分) ──
      const foamSource = this.ctx.createBufferSource();
      foamSource.buffer = pinkBuffer;
      foamSource.loop = true;

      const foamFilter = this.ctx.createBiquadFilter();
      foamFilter.type = "bandpass";
      foamFilter.frequency.setValueAtTime(1400, now);
      foamFilter.Q.setValueAtTime(0.85, now); // soft bell curve

      const foamGain = this.ctx.createGain();
      foamGain.gain.setValueAtTime(0.005, now); // starts quiet, blooms on wave crest

      foamSource.connect(foamFilter);
      foamFilter.connect(foamGain);
      foamGain.connect(this.masterGain);
      foamSource.start(now);
      this.activeNodes.push(foamSource, foamFilter, foamGain);

      this.isPlaying = true;

      // ── Wave Tidal Rhythm Engine (6〜8秒周期の自然な満ち引き) ──
      let cycle = 0;
      const runWaveCycle = () => {
        if (!this.ctx || !this.isPlaying || !this.masterGain) return;
        const t = this.ctx.currentTime;
        
        // Random organic variation for each wave
        const wavePeriod = 6.5 + Math.sin(cycle * 0.75) * 1.3; // 5.2s - 7.8s
        const pushDuration = wavePeriod * 0.38; // Inward surf rush (38% of cycle)
        
        const surfPeakFreq = 520 + Math.sin(cycle * 1.1) * 120; // 400Hz - 640Hz
        const surfLowFreq = 160 + Math.cos(cycle * 0.9) * 25;   // 135Hz - 185Hz
        
        const foamPeakGain = 0.10 + Math.sin(cycle * 1.4) * 0.04;

        // 1. Surf Filter Modulation (Inward rush -> Pullback)
        surfFilter.frequency.cancelScheduledValues(t);
        surfFilter.frequency.setValueAtTime(surfFilter.frequency.value, t);
        surfFilter.frequency.exponentialRampToValueAtTime(surfPeakFreq, t + pushDuration);
        surfFilter.frequency.exponentialRampToValueAtTime(surfLowFreq, t + wavePeriod);

        // 2. Deep Swell Gain Modulation (Deep water body expands)
        deepGain.gain.cancelScheduledValues(t);
        deepGain.gain.setValueAtTime(deepGain.gain.value, t);
        deepGain.gain.linearRampToValueAtTime(0.55, t + pushDuration * 0.8);
        deepGain.gain.linearRampToValueAtTime(0.20, t + wavePeriod);

        // 3. Seafoam & Sand Spray (Blooms at wave crest, gently sizzles away)
        foamGain.gain.cancelScheduledValues(t);
        foamGain.gain.setValueAtTime(foamGain.gain.value, t);
        foamGain.gain.exponentialRampToValueAtTime(foamPeakGain, t + pushDuration);
        foamGain.gain.exponentialRampToValueAtTime(0.001, t + wavePeriod);

        // 4. Surf Gain (Main wave volume swell)
        surfGain.gain.cancelScheduledValues(t);
        surfGain.gain.setValueAtTime(surfGain.gain.value, t);
        surfGain.gain.linearRampToValueAtTime(0.36, t + pushDuration);
        surfGain.gain.linearRampToValueAtTime(0.09, t + wavePeriod);

        cycle += 1;
        this.tideTimer = setTimeout(runWaveCycle, wavePeriod * 1000);
      };

      runWaveCycle();
      window.dispatchEvent(new CustomEvent("ambient_ocean_changed", { detail: { isPlaying: true } }));
      return true;
    } catch (e) {
      console.warn("Failed to start ocean ambient sound:", e);
      return false;
    }
  }

  public stop() {
    if (!this.ctx || !this.isPlaying) return;

    try {
      if (this.tideTimer) {
        clearTimeout(this.tideTimer);
        this.tideTimer = null;
      }

      const now = this.ctx.currentTime;
      if (this.masterGain) {
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      }

      setTimeout(() => {
        this.activeNodes.forEach(node => {
          try {
            if (typeof (node as any).stop === 'function') {
              (node as any).stop();
            }
            node.disconnect();
          } catch {}
        });
        this.activeNodes = [];
        this.isPlaying = false;
        window.dispatchEvent(new CustomEvent("ambient_ocean_changed", { detail: { isPlaying: false } }));
      }, 1300);
    } catch (e) {
      console.warn("Failed to stop ocean ambient sound:", e);
      this.isPlaying = false;
      window.dispatchEvent(new CustomEvent("ambient_ocean_changed", { detail: { isPlaying: false } }));
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const oceanSound = new OceanWaveSoundEngine();
