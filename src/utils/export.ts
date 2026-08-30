import gifshot from 'gifshot';
import type { EngineConfig } from '../engine/types';

export interface ExportOptions {
  fps: number; // e.g. 12, 15, 24
  quality: number; // 1 to 10
  width: number;
  height: number;
  compactMode?: boolean;
}

/**
 * Captures animated frame sequence across full duration and encodes to GIF using gifshot.
 */
export async function exportToGif(
  renderFrameAtProgress: (progress: number) => void,
  canvas: HTMLCanvasElement,
  options: ExportOptions,
  config: EngineConfig,
  stopPlayback: () => void,
  onProgress?: (percent: number) => void
): Promise<string> {
  const { fps, width, height, compactMode = true } = options;
  const numFrames = Math.round(config.duration * fps);
  const frameImages: string[] = [];

  // Stop any active animation playback to take precise frame snapshots
  stopPlayback();

  // Capture canvas snapshots across duration sequentially with WebGL sync
  for (let i = 0; i <= numFrames; i++) {
    const progress = i / numFrames;
    renderFrameAtProgress(progress);

    // Give browser & GPU draw pipeline time to complete rendering each frame
    await new Promise((r) => requestAnimationFrame(r));

    // Create temporary downscaled frame canvas for max compression
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(canvas, 0, 0, width, height);
      frameImages.push(tempCanvas.toDataURL('image/jpeg', compactMode ? 0.75 : 0.9));
    }

    if (onProgress) {
      onProgress(Math.round((i / numFrames) * 40));
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
        sampleInterval: compactMode ? 12 : 6, // Higher sampleInterval = smaller color palette & drastically smaller GIF size
        progressCallback: (p) => {
          if (onProgress) {
            onProgress(40 + Math.round(p * 60));
          }
        }
      },
      (obj) => {
        if (!obj.error) {
          resolve(obj.image);
        } else {
          reject(new Error(obj.errorMsg || 'ไม่สามารถเข้ารหัสไฟล์ GIF ได้'));
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
  renderFrameAtProgress: (progress: number) => void,
  durationSec: number,
  fps: number = 24,
  compactMode: boolean = true,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!('MediaRecorder' in window)) {
      return reject(new Error('เบราว์เซอร์นี้ไม่รองรับ MediaRecorder API'));
    }

    // Reset playback and seek to start frame (progress 0)
    stopPlayback();
    renderFrameAtProgress(0.0);

    setTimeout(() => {
      try {
        const stream = canvas.captureStream(fps);
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : MediaRecorder.isTypeSupported('video/webm')
          ? 'video/webm'
          : 'video/mp4';

        // 1.2 Mbps for compact mode, 4 Mbps for HD
        const videoBitsPerSecond = compactMode ? 1200000 : 4000000;

        const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond });
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          resolve(blob);
        };

        recorder.onerror = (e) => {
          reject(e);
        };

        // Start recorder with 50ms timeslice & start playback from beginning
        recorder.start(50);
        startPlayback();

        const startTime = performance.now();
        const interval = setInterval(() => {
          const elapsed = (performance.now() - startTime) / 1000;
          const progressPercent = Math.min(100, Math.round((elapsed / durationSec) * 100));
          if (onProgress) onProgress(progressPercent);

          if (elapsed >= durationSec + 0.3) {
            clearInterval(interval);
            stopPlayback();
            if (recorder.state !== 'inactive') {
              recorder.stop();
            }
          }
        }, 50);
      } catch (err) {
        reject(err);
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
  setTimeout(() => {
    document.body.removeChild(link);
    if (typeof urlOrBlob !== 'string') {
      URL.revokeObjectURL(link.href);
    }
  }, 1000);
}
