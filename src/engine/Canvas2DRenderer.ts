import type { EngineConfig, WorkerResultPayload } from './types';
import { getEasing } from './Easing';

export class Canvas2DRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: WorkerResultPayload['particles'] | null = null;
  private particleCount = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: false });
  }

  public setParticles(data: WorkerResultPayload['particles']) {
    this.particles = data;
    this.particleCount = data.sx.length;
  }

  public render(rawProgress: number, config: EngineConfig) {
    if (!this.ctx || !this.particles || this.particleCount === 0) return;

    const { width, height } = this.canvas;
    const easedProgress = getEasing(rawProgress, config.easing);
    const t = easedProgress;
    const oneMinusT = 1.0 - t;

    // Apply Blur filter if active
    if (config.blur > 0) {
      this.ctx.filter = `blur(${config.blur}px)`;
    } else {
      this.ctx.filter = 'none';
    }

    // Trail overlay effect
    if (config.trail > 0) {
      this.ctx.fillStyle = `rgba(18, 18, 18, ${1.0 - config.trail})`;
      this.ctx.fillRect(0, 0, width, height);
    } else {
      this.ctx.clearRect(0, 0, width, height);
      this.ctx.fillStyle = '#121212';
      this.ctx.fillRect(0, 0, width, height);
    }

    const { sx, sy, tx, ty, sc, tc, seeds, cpx, cpy, trajectorySteps, stepCount } = this.particles;
    const pSize = config.particleSize * (window.devicePixelRatio || 1);
    const randomness = config.motionRandomness;

    const isGenetic = config.algorithm === 'genetic-swap' && trajectorySteps && stepCount;
    const stepFloat = isGenetic ? t * (stepCount - 1) : 0;
    const stepA = Math.floor(stepFloat);
    const stepB = Math.min((stepCount || 1) - 1, stepA + 1);
    const stepFactor = stepFloat - stepA;

    // Batch draw particles
    for (let i = 0; i < this.particleCount; i++) {
      let normX = 0;
      let normY = 0;

      if (isGenetic && trajectorySteps) {
        const offsetA = (stepA * this.particleCount + i) * 2;
        const offsetB = (stepB * this.particleCount + i) * 2;
        const xA = trajectorySteps[offsetA];
        const yA = trajectorySteps[offsetA + 1];
        const xB = trajectorySteps[offsetB];
        const yB = trajectorySteps[offsetB + 1];
        normX = xA + (xB - xA) * stepFactor;
        normY = yA + (yB - yA) * stepFactor;
      } else {
        const basePosx = oneMinusT * oneMinusT * sx[i] + 2 * oneMinusT * t * cpx[i] + t * t * tx[i];
        const basePosy = oneMinusT * oneMinusT * sy[i] + 2 * oneMinusT * t * cpy[i] + t * t * ty[i];

        const noiseX = Math.sin(t * 12.57 + seeds[i] * 6.28) * randomness * 0.05 * Math.sin(t * Math.PI);
        const noiseY = Math.cos(t * 12.57 + seeds[i] * 6.28) * randomness * 0.05 * Math.sin(t * Math.PI);

        normX = basePosx + noiseX;
        normY = basePosy + noiseY;
      }

      const px = normX * width;
      const py = normY * height;

      const r = Math.round(sc[i * 4] * (1 - t) + tc[i * 4] * t);
      const g = Math.round(sc[i * 4 + 1] * (1 - t) + tc[i * 4 + 1] * t);
      const b = Math.round(sc[i * 4 + 2] * (1 - t) + tc[i * 4 + 2] * t);
      const a = (sc[i * 4 + 3] * (1 - t) + tc[i * 4 + 3] * t) / 255;

      this.ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
      this.ctx.fillRect(px - pSize / 2, py - pSize / 2, pSize, pSize);
    }

    this.ctx.filter = 'none';
  }
}
