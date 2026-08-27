export type MorphAlgorithm = 
  | 'pixel-morph'
  | 'genetic-swap'
  | 'particle-morph'
  | 'nearest-color'
  | 'nearest-position'
  | 'random-chaos'
  | 'smooth-flow';

export type EasingType =
  | 'linear'
  | 'cubic-in-out'
  | 'quad-in-out'
  | 'exponential'
  | 'elastic'
  | 'bounce'
  | 'chaos-burst'
  | 'spiral-flow';

export interface Particle {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  x: number;
  y: number;
  sc: [number, number, number, number];
  tc: [number, number, number, number];
  c: [number, number, number, number];
  size: number;
  seed: number;
  cpx: number;
  cpy: number;
}

export interface EngineConfig {
  algorithm: MorphAlgorithm;
  resolution: number;
  particleCount: number;
  duration: number;
  particleSize: number;
  motionRandomness: number;
  colorImportance: number;
  positionImportance: number;
  blur: number;
  trail: number;
  easing: EasingType;
  seed: number;
  renderMode: 'auto' | 'webgl' | 'canvas2d';
}

export interface ProcessingProgress {
  stage: 'idle' | 'sampling' | 'matching' | 'ready' | 'error';
  progress: number;
  message: string;
  particleCount: number;
  computeTimeMs: number;
}

export interface MetricsState {
  fps: number;
  particleCount: number;
  processingTimeMs: number;
  renderMode: 'webgl' | 'canvas2d';
  currentFrame: number;
  totalFrames: number;
  progress: number;
  isProcessing: boolean;
}

// Worker message interfaces
export interface WorkerComputePayload {
  sourcePixels: Uint8ClampedArray;
  targetPixels: Uint8ClampedArray;
  width: number;
  height: number;
  config: EngineConfig;
}

export interface WorkerResultPayload {
  particles: {
    sx: Float32Array;
    sy: Float32Array;
    tx: Float32Array;
    ty: Float32Array;
    sc: Uint8Array;
    tc: Uint8Array;
    seeds: Float32Array;
    cpx: Float32Array;
    cpy: Float32Array;
    // Step snapshots for Obamify Genetic Annealing Dissolve
    trajectorySteps?: Float32Array;
    stepCount?: number;
  };
  computeTimeMs: number;
  particleCount: number;
}
