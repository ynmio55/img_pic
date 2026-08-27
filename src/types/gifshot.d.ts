declare module 'gifshot' {
  export interface GifOptions {
    images?: (string | HTMLCanvasElement | HTMLImageElement)[];
    video?: string[];
    webcam?: unknown;
    gifWidth?: number;
    gifHeight?: number;
    filter?: string;
    interval?: number;
    numFrames?: number;
    frameDuration?: number;
    sampleInterval?: number;
    numWorkers?: number;
    progressCallback?: (captureProgress: number) => void;
    completeCallback?: (obj: { error: boolean; errorCode?: string; errorMsg?: string; image: string }) => void;
  }

  export function createGIF(
    options: GifOptions,
    callback: (obj: { error: boolean; errorCode?: string; errorMsg?: string; image: string }) => void
  ): void;

  export function isSupported(): boolean;
}
