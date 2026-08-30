export type StampPreset = 'obama' | 'monalisa' | 'pepe' | 'star';

export interface ObamaMosaicConfig {
  preset: StampPreset;
  density: number; // e.g. 20 to 100 (grid size)
  stampScale: number; // 0.5 to 2.5
  contrast: number; // 0.5 to 2.0
  invert: boolean;
  colorMode: 'monochrome' | 'source-color' | 'gold';
  backgroundColor: string;
}

export class ObamaMosaicEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private stampCanvasCache: Map<string, HTMLCanvasElement> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.initStampPresets();
  }

  private initStampPresets() {
    this.stampCanvasCache.set('obama', this.createObamaStamp());
    this.stampCanvasCache.set('monalisa', this.createMonaLisaStamp());
    this.stampCanvasCache.set('pepe', this.createPepeStamp());
    this.stampCanvasCache.set('star', this.createStarStamp());
  }

  // Draw crisp Obama Face Vector (High contrast white face outline with dark facial features)
  private createObamaStamp(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    if (!ctx) return c;

    // 1. High contrast White Face Outline & Hair Silhouette
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(32, 26, 20, Math.PI * 0.8, Math.PI * 2.2);
    ctx.quadraticCurveTo(54, 42, 42, 58);
    ctx.quadraticCurveTo(32, 62, 22, 58);
    ctx.quadraticCurveTo(10, 42, 12, 26);
    ctx.fill();

    // Hair Top
    ctx.fillRect(16, 8, 32, 14);

    // 2. Dark inner facial features (Eyes, Nose, Iconic Obama Smile)
    ctx.fillStyle = '#000000';
    // Left eye & eyebrow
    ctx.fillRect(20, 24, 8, 4);
    // Right eye & eyebrow
    ctx.fillRect(36, 24, 8, 4);
    // Nose bridge
    ctx.fillRect(30, 28, 4, 10);
    
    // Iconic Obama Smile curve
    ctx.beginPath();
    ctx.arc(32, 38, 10, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    return c;
  }

  private createMonaLisaStamp(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    if (!ctx) return c;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(32, 32, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(32, 34, 12, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(24, 30, 4, 3);
    ctx.fillRect(36, 30, 4, 3);
    ctx.beginPath();
    ctx.arc(32, 38, 6, 0, Math.PI);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    return c;
  }

  private createPepeStamp(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    if (!ctx) return c;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(32, 36, 22, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillRect(16, 12, 14, 16);
    ctx.fillRect(34, 12, 14, 16);

    ctx.fillStyle = '#000000';
    ctx.fillRect(18, 14, 10, 12);
    ctx.fillRect(36, 14, 10, 12);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(22, 18, 4, 6);
    ctx.fillRect(40, 18, 4, 6);

    return c;
  }

  private createStarStamp(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    if (!ctx) return c;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(
        32 + Math.cos((18 + i * 72) * (Math.PI / 180)) * 24,
        32 - Math.sin((18 + i * 72) * (Math.PI / 180)) * 24
      );
      ctx.lineTo(
        32 + Math.cos((54 + i * 72) * (Math.PI / 180)) * 10,
        32 - Math.sin((54 + i * 72) * (Math.PI / 180)) * 10
      );
    }
    ctx.closePath();
    ctx.fill();

    return c;
  }

  // Render source image as high contrast Obama Mosaic matrix
  public renderMosaic(sourceImage: HTMLImageElement, config: ObamaMosaicConfig) {
    if (!this.ctx) return;

    const width = this.canvas.width;
    const height = this.canvas.height;

    // 1. Draw source image onto offscreen canvas to sample pixel colors & luminance
    const offCanvas = document.createElement('canvas');
    offCanvas.width = width;
    offCanvas.height = height;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    offCtx.drawImage(sourceImage, 0, 0, width, height);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const pixels = imgData.data;

    // 2. Fill background color
    this.ctx.fillStyle = config.backgroundColor || '#0b0f19';
    this.ctx.fillRect(0, 0, width, height);

    // 3. Grid setup
    const gridCols = Math.max(15, Math.min(100, config.density));
    const cellW = width / gridCols;
    const cellH = height / gridCols;

    const stamp = this.stampCanvasCache.get(config.preset) || this.stampCanvasCache.get('obama')!;

    for (let gy = 0; gy < gridCols; gy++) {
      for (let gx = 0; gx < gridCols; gx++) {
        const cx = Math.floor((gx + 0.5) * cellW);
        const cy = Math.floor((gy + 0.5) * cellH);
        const pIdx = (cy * width + cx) * 4;

        const r = pixels[pIdx];
        const g = pixels[pIdx + 1];
        const b = pixels[pIdx + 2];
        const a = pixels[pIdx + 3] / 255;

        if (a < 0.1) continue;

        // Calculate normalized luminance (0.0 to 1.0)
        let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        // Apply contrast
        lum = Math.pow(lum, config.contrast);
        if (config.invert) lum = 1.0 - lum;

        // Darkness factor: darker pixels get larger, more prominent Obama stamps
        const darkness = 1.0 - lum;
        
        // Scale calculation
        const baseScale = (0.35 + darkness * 0.95) * config.stampScale;
        const drawSizeW = cellW * baseScale;
        const drawSizeH = cellH * baseScale;

        this.ctx.save();
        this.ctx.translate(gx * cellW + cellW / 2, gy * cellH + cellH / 2);

        if (config.colorMode === 'source-color') {
          this.ctx.globalAlpha = Math.max(0.3, darkness * a);
          // Tint stamp with source pixel RGB color
          const tintCanvas = document.createElement('canvas');
          tintCanvas.width = 64;
          tintCanvas.height = 64;
          const tCtx = tintCanvas.getContext('2d');
          if (tCtx) {
            tCtx.drawImage(stamp, 0, 0);
            tCtx.globalCompositeOperation = 'source-in';
            tCtx.fillStyle = `rgb(${r},${g},${b})`;
            tCtx.fillRect(0, 0, 64, 64);
            this.ctx.drawImage(tintCanvas, -drawSizeW / 2, -drawSizeH / 2, drawSizeW, drawSizeH);
          } else {
            this.ctx.drawImage(stamp, -drawSizeW / 2, -drawSizeH / 2, drawSizeW, drawSizeH);
          }
        } else if (config.colorMode === 'gold') {
          this.ctx.globalAlpha = Math.max(0.4, darkness * a);
          const tintCanvas = document.createElement('canvas');
          tintCanvas.width = 64;
          tintCanvas.height = 64;
          const tCtx = tintCanvas.getContext('2d');
          if (tCtx) {
            tCtx.drawImage(stamp, 0, 0);
            tCtx.globalCompositeOperation = 'source-in';
            tCtx.fillStyle = '#fbbf24';
            tCtx.fillRect(0, 0, 64, 64);
            this.ctx.drawImage(tintCanvas, -drawSizeW / 2, -drawSizeH / 2, drawSizeW, drawSizeH);
          }
        } else {
          // Monochrome high-contrast mode (White stamps on dark background)
          this.ctx.globalAlpha = Math.max(0.35, darkness * a);
          this.ctx.drawImage(stamp, -drawSizeW / 2, -drawSizeH / 2, drawSizeW, drawSizeH);
        }

        this.ctx.restore();
      }
    }
  }
}
