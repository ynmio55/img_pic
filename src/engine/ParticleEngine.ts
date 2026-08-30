import type { EngineConfig, MetricsState, ProcessingProgress, WorkerResultPayload } from './types';
import { WebGLRenderer } from './WebGLRenderer';
import { Canvas2DRenderer } from './Canvas2DRenderer';
import { AnimationController } from './AnimationController';
import type { ProcessedImageData } from '../utils/image';

export class ParticleEngine {
  private webglRenderer: WebGLRenderer | null = null;
  private canvas2dRenderer: Canvas2DRenderer | null = null;
  private animController: AnimationController;
  private worker: Worker | null = null;

  private config: EngineConfig;
  private currentParticles: WorkerResultPayload['particles'] | null = null;

  private onProgressCallback: (status: ProcessingProgress) => void;
  private onMetricsCallback: (metrics: Partial<MetricsState>) => void;

  private activeRenderMode: 'webgl' | 'canvas2d' = 'webgl';

  constructor(
    canvas: HTMLCanvasElement,
    initialConfig: EngineConfig,
    onProgress: (status: ProcessingProgress) => void,
    onMetrics: (metrics: Partial<MetricsState>) => void
  ) {
    this.config = { ...initialConfig };
    this.onProgressCallback = onProgress;
    this.onMetricsCallback = onMetrics;

    // Initialize Renderers
    this.webglRenderer = new WebGLRenderer(canvas);
    if (this.webglRenderer.isSupported() && this.config.renderMode !== 'canvas2d') {
      this.activeRenderMode = 'webgl';
    } else {
      this.activeRenderMode = 'canvas2d';
      this.canvas2dRenderer = new Canvas2DRenderer(canvas);
    }

    this.onMetricsCallback({ renderMode: this.activeRenderMode });

    // Initialize Animation Controller
    this.animController = new AnimationController(
      (progress) => this.renderFrame(progress),
      (metrics) => this.onMetricsCallback(metrics)
    );
    this.animController.setDuration(this.config.duration);

    // Initialize Worker
    this.initWorker();
  }

  private initWorker() {
    try {
      this.worker = new Worker(
        new URL('../workers/imageProcessor.worker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = (e: MessageEvent<WorkerResultPayload>) => {
        const { particles, computeTimeMs, particleCount } = e.data;
        this.currentParticles = particles;

        if (this.activeRenderMode === 'webgl' && this.webglRenderer) {
          this.webglRenderer.uploadParticles(particles);
        } else if (this.canvas2dRenderer) {
          this.canvas2dRenderer.setParticles(particles);
        }

        this.onProgressCallback({
          stage: 'ready',
          progress: 100,
          message: `Generated ${particleCount.toLocaleString()} particles`,
          particleCount,
          computeTimeMs
        });

        this.onMetricsCallback({
          particleCount,
          processingTimeMs: computeTimeMs
        });

        // Trigger first frame draw and play
        this.animController.restart();
      };

      this.worker.onerror = (err) => {
        console.error('Worker compute error:', err);
        this.onProgressCallback({
          stage: 'error',
          progress: 0,
          message: 'Error computing particle transformation in worker.',
          particleCount: 0,
          computeTimeMs: 0
        });
      };
    } catch (e) {
      console.warn('Worker initialization failed:', e);
    }
  }

  public updateConfig(newConfig: Partial<EngineConfig>) {
    const prevCount = this.config.particleCount;
    const prevAlgo = this.config.algorithm;
    const prevRes = this.config.resolution;
    const prevSeed = this.config.seed;

    this.config = { ...this.config, ...newConfig };
    this.animController.setDuration(this.config.duration);

    // Re-render current frame immediately for Category A (render-only) tweaks
    if (this.currentParticles) {
      this.renderFrame(this.animController.getProgress());
    }

    // Category B: Requires recomputation if count, algorithm, resolution, or seed changed
    if (
      (newConfig.particleCount !== undefined && newConfig.particleCount !== prevCount) ||
      (newConfig.algorithm !== undefined && newConfig.algorithm !== prevAlgo) ||
      (newConfig.resolution !== undefined && newConfig.resolution !== prevRes) ||
      (newConfig.seed !== undefined && newConfig.seed !== prevSeed)
    ) {
      return true; // signal caller to re-process images
    }
    return false;
  }

  public processImages(sourceData: ProcessedImageData, targetData: ProcessedImageData) {
    if (!this.worker) {
      this.initWorker();
    }

    this.onProgressCallback({
      stage: 'matching',
      progress: 40,
      message: `Matching ${this.config.particleCount.toLocaleString()} particles using ${this.config.algorithm}...`,
      particleCount: this.config.particleCount,
      computeTimeMs: 0
    });

    this.worker?.postMessage({
      sourcePixels: sourceData.pixels,
      targetPixels: targetData.pixels,
      width: sourceData.width,
      height: sourceData.height,
      config: this.config
    });
  }

  private renderFrame(progress: number) {
    if (this.activeRenderMode === 'webgl' && this.webglRenderer) {
      this.webglRenderer.render(progress, this.config);
    } else if (this.canvas2dRenderer) {
      this.canvas2dRenderer.render(progress, this.config);
    }
  }

  public play() {
    this.animController.play();
  }

  public pause() {
    this.animController.pause();
  }

  public restart() {
    this.animController.restart();
  }

  public reset() {
    this.animController.reset();
    this.currentParticles = null;
  }

  public seek(progress: number) {
    this.animController.setProgress(progress);
  }

  public setLooping(loop: boolean) {
    this.animController.setLooping(loop);
  }

  public getProgress(): number {
    return this.animController.getProgress();
  }

  public getIsPlaying(): boolean {
    return this.animController.getIsPlaying();
  }

  public destroy() {
    this.animController.destroy();
    this.worker?.terminate();
    this.worker = null;
  }
}
