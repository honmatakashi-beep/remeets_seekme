/**
 * ReMEETs Ambient Ocean Sound Engine (Web Audio API)
 * 0KB external assets, 100% procedurally synthesized gentle ocean waves.
 */

class OceanWaveSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private lfoInterval: any = null;

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      this.ctx = new AudioCtx();
    }
  }

  private createPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = ctx.sampleRate * 5; // 5 seconds buffer
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
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
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

      // Master Gain for smooth fade-in/fade-out
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.18, now + 1.5);
      this.masterGain.connect(this.ctx.destination);

      // Lowpass filter for wave modulation
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = "lowpass";
      this.filterNode.frequency.setValueAtTime(250, now);
      this.filterNode.Q.setValueAtTime(1.2, now);

      // Noise source
      const noiseBuffer = this.createPinkNoiseBuffer(this.ctx);
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      // Second layer of noise for deep water swell
      const swellGain = this.ctx.createGain();
      swellGain.gain.setValueAtTime(0.7, now);

      this.noiseNode.connect(this.filterNode);
      this.filterNode.connect(swellGain);
      swellGain.connect(this.masterGain);

      this.noiseNode.start(now);
      this.isPlaying = true;

      // Start procedural ocean wave rhythm modulation (every 5-7 seconds)
      let phase = 0;
      const animateWave = () => {
        if (!this.ctx || !this.isPlaying || !this.filterNode || !this.masterGain) return;
        const t = this.ctx.currentTime;
        const waveDuration = 5.5 + Math.sin(phase) * 1.2; // naturally varying wave period
        const highFreq = 650 + Math.sin(phase * 1.3) * 200; // surf foam sound
        const lowFreq = 160 + Math.cos(phase * 0.8) * 40;  // deep pull back

        // Frequency sweep (inward surf -> pullback)
        this.filterNode.frequency.cancelScheduledValues(t);
        this.filterNode.frequency.setValueAtTime(this.filterNode.frequency.value, t);
        this.filterNode.frequency.exponentialRampToValueAtTime(highFreq, t + waveDuration * 0.45);
        this.filterNode.frequency.exponentialRampToValueAtTime(lowFreq, t + waveDuration);

        // Volume sweep (crest -> retreat)
        this.masterGain.gain.cancelScheduledValues(t);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, t);
        this.masterGain.gain.linearRampToValueAtTime(0.22, t + waveDuration * 0.45);
        this.masterGain.gain.linearRampToValueAtTime(0.08, t + waveDuration);

        phase += 1.1;
      };

      animateWave();
      this.lfoInterval = setInterval(animateWave, 5500);

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
      const now = this.ctx.currentTime;
      if (this.masterGain) {
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      }

      if (this.lfoInterval) {
        clearInterval(this.lfoInterval);
        this.lfoInterval = null;
      }

      setTimeout(() => {
        if (this.noiseNode) {
          try { this.noiseNode.stop(); } catch {}
          this.noiseNode.disconnect();
          this.noiseNode = null;
        }
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
