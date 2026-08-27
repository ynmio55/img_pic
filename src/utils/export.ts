import gifshot from 'gifshot';
import type { EngineConfig } from '../engine/types';

export interface ExportOptions {
  fps: number; // e.g. 15, 24, 30
  quality: number; // 1 to 10
  width: number;
  height: number;
}

/**
 * Captures transformation frame sequence and encodes to GIF using gifshot.
 */
export async function exportToGif(
  renderFrameAtProgress: (progress: number) => void,
  canvas: HTMLCanvasElement,
  options: ExportOptions,
  config: EngineConfig,
  onProgress?: (percent: number) => void
): Promise<string> {
  const { fps, width, height } = options;
  const numFrames = Math.round(config.duration * fps);
  const frameImages: string[] = [];

  // Capture canvas snapshots across duration
  for (let i = 0; i <= numFrames; i++) {
    const progress = i / numFrames;
    renderFrameAtProgress(progress);

    // Create temporary downscaled frame canvas if needed
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(canvas, 0, 0, width, height);
      frameImages.push(tempCanvas.toDataURL('image/png'));
    }

    if (onProgress) {
      onProgress(Math.round((i / numFrames) * 50)); // 0-50% frame capture
    }
  }

  return new Promise((resolve, reject) => {
    gifshot.createGIF(
      {
        images: frameImages,
        gifWidth: width,
        gifHeight: height,
        interval: 1 / fps,
        numFrames: frameImages.length,
        numWorkers: 2,
        progressCallback: (p) => {
          if (onProgress) {
            onProgress(50 + Math.round(p * 50)); // 50-100% gif compilation
          }
        }
      },
      (obj) => {
        if (!obj.error) {
          resolve(obj.image);
        } else {
          reject(new Error(obj.errorMsg || 'Failed to encode GIF.'));
        }
      }
    );
  });
}

/**
 * Records real-time animation playback into WebM video using MediaRecorder API.
 */
export function recordToWebM(
  canvas: HTMLCanvasElement,
  startPlayback: () => void,
  stopPlayback: () => void,
  durationSec: number,
  fps: number = 30,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!('MediaRecorder' in window)) {
      return reject(new Error('MediaRecorder API is not supported in this browser.'));
    }

    const stream = canvas.captureStream(fps);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : 'video/mp4';

    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };

    recorder.onerror = (e) => {
      reject(e);
    };

    const startTime = performance.now();
    startPlayback();
    recorder.start();

    const interval = setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      const progressPercent = Math.min(100, Math.round((elapsed / durationSec) * 100));
      if (onProgress) onProgress(progressPercent);

      if (elapsed >= durationSec + 0.2) {
        clearInterval(interval);
        recorder.stop();
        stopPlayback();
      }
    }, 100);
  });
}

/**
 * Triggers browser file download of a Blob or data URL.
 */
export function triggerDownload(urlOrBlob: string | Blob, filename: string) {
  const link = document.createElement('a');
  if (typeof urlOrBlob === 'string') {
    link.href = urlOrBlob;
  } else {
    link.href = URL.createObjectURL(urlOrBlob);
  }
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
