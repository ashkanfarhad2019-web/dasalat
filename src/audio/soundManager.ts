/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Ultra-lightweight, battery-efficient sound manager.
 * NO continuous background music, NO ambient drone loops, NO audio thread CPU consumption.
 * Only triggers an instantaneous micro-click (0.03s) on user tap.
 */
class ProceduralSoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {}

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  /**
   * Crisp, instantaneous, battery-saving micro-click sound (0.035s).
   * Shuts off immediately so mobile CPU & audio thread go completely idle.
   */
  public playClick() {
    if (this.muted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, t);
      osc.frequency.exponentialRampToValueAtTime(250, t + 0.03);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);
    } catch {
      // Ignore audio errors on unsupported browsers
    }
  }

  // Map all secondary actions to simple lightweight click sound
  public playGavelStrike() {
    this.playClick();
  }

  public playQuillSignature() {
    this.playClick();
  }

  public playCoins() {
    this.playClick();
  }

  public playCrisisWarning() {
    this.playClick();
  }

  public playIntrigueSound() {
    this.playClick();
  }

  public playFanfare() {
    this.playClick();
  }

  // NO background music or ambient drone loop to prevent mobile phone overheating!
  public startAmbient() {
    // Intentionally empty: Zero background audio threads to keep phone cold and save battery.
  }
}

export const soundManager = new ProceduralSoundManager();
