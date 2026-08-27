import type { MetricsState } from './types';

export class AnimationController {
  private isPlaying = false;
  private isLooping = false;
  private durationSec = 3.0; // Seconds
  private progress = 0; // 0 to 1
  private lastTime = 0;

  private rafId: number | null = null;
  private onRenderFrame: (progress: number) => void;
  private onMetricsUpdate: (metrics: Partial<MetricsState>) => void;

  // FPS calculation
  private frameCount = 0;
  private lastFpsUpdate = 0;
  private currentFps = 60;

  constructor(
    onRenderFrame: (progress: number) => void,
    onMetricsUpdate: (metrics: Partial<MetricsState>) => void
  ) {
    this.onRenderFrame = onRenderFrame;
    this.onMetricsUpdate = onMetricsUpdate;
  }

  public setDuration(durationSec: number) {
    this.durationSec = Math.max(0.5, durationSec);
  }

  public setLooping(loop: boolean) {
    this.isLooping = loop;
  }

  public getProgress(): number {
    return this.progress;
  }

  public setProgress(p: number) {
    this.progress = Math.max(0, Math.min(1, p));
    this.onRenderFrame(this.progress);
    this.emitMetrics();
  }

  public play() {
    if (this.isPlaying) return;
    if (this.progress >= 1.0) {
      this.progress = 0.0;
    }
    this.isPlaying = true;
    this.lastTime = performance.now();
    this.lastFpsUpdate = performance.now();
    this.frameCount = 0;
    this.loop();
  }

  public pause() {
    this.isPlaying = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.emitMetrics();
  }

  public restart() {
    this.pause();
    this.progress = 0.0;
    this.onRenderFrame(this.progress);
    this.play();
  }

  public reset() {
    this.pause();
    this.progress = 0.0;
    this.onRenderFrame(this.progress);
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private loop = () => {
    if (!this.isPlaying) return;

    const now = performance.now();
    const deltaTimeSec = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Advance progress
    this.progress += deltaTimeSec / this.durationSec;

    if (this.progress >= 1.0) {
      if (this.isLooping) {
        this.progress = 0.0;
      } else {
        this.progress = 1.0;
        this.isPlaying = false;
      }
    }

    // Render current frame
    this.onRenderFrame(this.progress);

    // Calculate FPS
    this.frameCount++;
    if (now - this.lastFpsUpdate >= 500) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
      this.emitMetrics();
    }

    if (this.isPlaying) {
      this.rafId = requestAnimationFrame(this.loop);
    } else {
      this.emitMetrics();
    }
  };

  private emitMetrics() {
    const totalFrames = Math.round(this.durationSec * 60);
    const currentFrame = Math.round(this.progress * totalFrames);
    this.onMetricsUpdate({
      fps: this.currentFps,
      currentFrame,
      totalFrames,
      progress: this.progress,
      isProcessing: this.isPlaying
    });
  }

  public destroy() {
    this.pause();
  }
}
