import type { EngineConfig, WorkerResultPayload } from './types';
import { getEasing } from './Easing';

const VERTEX_SHADER_SRC = `
attribute vec2 a_sourcePos;
attribute vec2 a_targetPos;
attribute vec4 a_sourceColor;
attribute vec4 a_targetColor;
attribute float a_seed;
attribute vec2 a_controlPos;

uniform float u_progress;
uniform float u_particleSize;
uniform float u_randomness;
uniform float u_blur;
uniform float u_isGenetic;

varying vec4 v_color;
varying float v_blur;

void main() {
  float t = u_progress;
  vec2 currentPos;

  if (u_isGenetic > 0.5) {
    // Genetic Swap mode: a_sourcePos already holds the exact animated annealing position for progress t
    currentPos = a_sourcePos;
  } else {
    // Quadratic Bezier curve trajectory: (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
    float oneMinusT = 1.0 - t;
    vec2 basePos = oneMinusT * oneMinusT * a_sourcePos + 
                   2.0 * oneMinusT * t * a_controlPos + 
                   t * t * a_targetPos;

    // Add organic wobble noise based on seed and sine curve
    float noiseX = sin(t * 12.57 + a_seed * 6.28) * u_randomness * 0.05 * sin(t * 3.14159);
    float noiseY = cos(t * 12.57 + a_seed * 6.28) * u_randomness * 0.05 * sin(t * 3.14159);
    
    currentPos = basePos + vec2(noiseX, noiseY);
  }

  // Convert 0..1 normalized space to clip space -1..1 (and flip Y)
  vec2 clipPos = (currentPos * 2.0 - 1.0) * vec2(1.0, -1.0);

  gl_Position = vec4(clipPos, 0.0, 1.0);
  
  // Expand point size when blur is active for soft glow diffusion
  gl_PointSize = u_particleSize * (1.0 + u_blur * 0.15);

  // Color interpolation
  v_color = mix(a_sourceColor, a_targetColor, t);
  v_blur = u_blur;
}
`;

const FRAGMENT_SHADER_SRC = `
precision mediump float;
varying vec4 v_color;
varying float v_blur;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) {
    discard;
  }
  // Soften particle edges proportional to blur parameter (0-10)
  float softEdge = mix(0.35, 0.01, clamp(v_blur / 10.0, 0.0, 1.0));
  float alpha = smoothstep(0.5, softEdge, dist) * v_color.a;
  gl_FragColor = vec4(v_color.rgb, alpha);
}
`;

export class WebGLRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;

  // Attribute locations
  private aSourcePosLoc = -1;
  private aTargetPosLoc = -1;
  private aSourceColorLoc = -1;
  private aTargetColorLoc = -1;
  private aSeedLoc = -1;
  private aControlPosLoc = -1;

  // Uniform locations
  private uProgressLoc: WebGLUniformLocation | null = null;
  private uParticleSizeLoc: WebGLUniformLocation | null = null;
  private uRandomnessLoc: WebGLUniformLocation | null = null;
  private uBlurLoc: WebGLUniformLocation | null = null;
  private uIsGeneticLoc: WebGLUniformLocation | null = null;

  // Buffers
  private sourcePosBuf: WebGLBuffer | null = null;
  private targetPosBuf: WebGLBuffer | null = null;
  private sourceColorBuf: WebGLBuffer | null = null;
  private targetColorBuf: WebGLBuffer | null = null;
  private seedBuf: WebGLBuffer | null = null;
  private controlPosBuf: WebGLBuffer | null = null;
  private dynamicPosBuf: WebGLBuffer | null = null;

  private particleCount = 0;
  private isInitialized = false;
  private particlesData: WorkerResultPayload['particles'] | null = null;
  private dynamicPosArray: Float32Array | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.initGL();
  }

  public isSupported(): boolean {
    return this.isInitialized && this.gl !== null;
  }

  private initGL(): boolean {
    try {
      this.gl = this.canvas.getContext('webgl', {
        alpha: true,
        preserveDrawingBuffer: true,
        antialias: true
      }) || (this.canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

      if (!this.gl) return false;

      const vertShader = this.createShader(this.gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
      const fragShader = this.createShader(this.gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);

      if (!vertShader || !fragShader) return false;

      this.program = this.gl.createProgram();
      if (!this.program) return false;

      this.gl.attachShader(this.program, vertShader);
      this.gl.attachShader(this.program, fragShader);
      this.gl.linkProgram(this.program);

      if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
        console.error('WebGL Program link error:', this.gl.getProgramInfoLog(this.program));
        return false;
      }

      this.gl.useProgram(this.program);

      // Attribute lookups
      this.aSourcePosLoc = this.gl.getAttribLocation(this.program, 'a_sourcePos');
      this.aTargetPosLoc = this.gl.getAttribLocation(this.program, 'a_targetPos');
      this.aSourceColorLoc = this.gl.getAttribLocation(this.program, 'a_sourceColor');
      this.aTargetColorLoc = this.gl.getAttribLocation(this.program, 'a_targetColor');
      this.aSeedLoc = this.gl.getAttribLocation(this.program, 'a_seed');
      this.aControlPosLoc = this.gl.getAttribLocation(this.program, 'a_controlPos');

      // Uniform lookups
      this.uProgressLoc = this.gl.getUniformLocation(this.program, 'u_progress');
      this.uParticleSizeLoc = this.gl.getUniformLocation(this.program, 'u_particleSize');
      this.uRandomnessLoc = this.gl.getUniformLocation(this.program, 'u_randomness');
      this.uBlurLoc = this.gl.getUniformLocation(this.program, 'u_blur');
      this.uIsGeneticLoc = this.gl.getUniformLocation(this.program, 'u_isGenetic');

      // Create buffers
      this.sourcePosBuf = this.gl.createBuffer();
      this.targetPosBuf = this.gl.createBuffer();
      this.sourceColorBuf = this.gl.createBuffer();
      this.targetColorBuf = this.gl.createBuffer();
      this.seedBuf = this.gl.createBuffer();
      this.controlPosBuf = this.gl.createBuffer();
      this.dynamicPosBuf = this.gl.createBuffer();

      // Enable alpha blending
      this.gl.enable(this.gl.BLEND);
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

      this.isInitialized = true;
      return true;
    } catch (e) {
      console.warn('WebGL Initialization failed:', e);
      this.isInitialized = false;
      return false;
    }
  }

  private createShader(type: number, src: string): WebGLShader | null {
    if (!this.gl) return null;
    const shader = this.gl.createShader(type);
    if (!shader) return null;
    this.gl.shaderSource(shader, src);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  public uploadParticles(data: WorkerResultPayload['particles']) {
    if (!this.gl || !this.isInitialized) return;

    this.particlesData = data;
    this.particleCount = data.sx.length;
    this.dynamicPosArray = new Float32Array(this.particleCount * 2);

    const N = this.particleCount;
    const scFloat = new Float32Array(N * 4);
    const tcFloat = new Float32Array(N * 4);

    for (let i = 0; i < N * 4; i++) {
      scFloat[i] = data.sc[i] / 255;
      tcFloat[i] = data.tc[i] / 255;
    }

    const sourcePos = new Float32Array(N * 2);
    const targetPos = new Float32Array(N * 2);
    const controlPos = new Float32Array(N * 2);

    for (let i = 0; i < N; i++) {
      sourcePos[i * 2] = data.sx[i];
      sourcePos[i * 2 + 1] = data.sy[i];

      targetPos[i * 2] = data.tx[i];
      targetPos[i * 2 + 1] = data.ty[i];

      controlPos[i * 2] = data.cpx[i];
      controlPos[i * 2 + 1] = data.cpy[i];
    }

    this.uploadBuffer(this.sourcePosBuf, sourcePos);
    this.uploadBuffer(this.targetPosBuf, targetPos);
    this.uploadBuffer(this.controlPosBuf, controlPos);
    this.uploadBuffer(this.sourceColorBuf, scFloat);
    this.uploadBuffer(this.targetColorBuf, tcFloat);
    this.uploadBuffer(this.seedBuf, data.seeds);
  }

  private uploadBuffer(buf: WebGLBuffer | null, data: Float32Array, usage: number = this.gl?.STATIC_DRAW || 35044) {
    if (!this.gl || !buf) return;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, usage);
  }

  public render(rawProgress: number, config: EngineConfig) {
    if (!this.gl || !this.program || !this.isInitialized || this.particleCount === 0) return;

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // Apply trail fade or clear screen
    const trailAlpha = config.trail > 0 ? 1.0 - config.trail : 1.0;
    this.gl.clearColor(0.07, 0.07, 0.07, trailAlpha);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.useProgram(this.program);

    const easedProgress = getEasing(rawProgress, config.easing);
    const isGenetic = config.algorithm === 'genetic-swap' && Boolean(this.particlesData?.trajectorySteps);

    if (isGenetic && this.particlesData?.trajectorySteps && this.dynamicPosArray && this.particlesData.stepCount) {
      const { trajectorySteps, stepCount } = this.particlesData;
      const N = this.particleCount;
      const stepFloat = easedProgress * (stepCount - 1);
      const stepA = Math.floor(stepFloat);
      const stepB = Math.min(stepCount - 1, stepA + 1);
      const factor = stepFloat - stepA;

      for (let i = 0; i < N; i++) {
        const offA = (stepA * N + i) * 2;
        const offB = (stepB * N + i) * 2;
        const xA = trajectorySteps[offA];
        const yA = trajectorySteps[offA + 1];
        const xB = trajectorySteps[offB];
        const yB = trajectorySteps[offB + 1];
        this.dynamicPosArray[i * 2] = xA + (xB - xA) * factor;
        this.dynamicPosArray[i * 2 + 1] = yA + (yB - yA) * factor;
      }

      this.uploadBuffer(this.dynamicPosBuf, this.dynamicPosArray, this.gl.DYNAMIC_DRAW);
      this.bindAttribute(this.aSourcePosLoc, this.dynamicPosBuf, 2);
    } else {
      this.bindAttribute(this.aSourcePosLoc, this.sourcePosBuf, 2);
    }

    // Set uniforms
    this.gl.uniform1f(this.uProgressLoc, easedProgress);
    this.gl.uniform1f(this.uParticleSizeLoc, config.particleSize * (window.devicePixelRatio || 1));
    this.gl.uniform1f(this.uRandomnessLoc, config.motionRandomness);
    this.gl.uniform1f(this.uBlurLoc, config.blur || 0.0);
    this.gl.uniform1f(this.uIsGeneticLoc, isGenetic ? 1.0 : 0.0);

    // Bind remaining Attributes
    this.bindAttribute(this.aTargetPosLoc, this.targetPosBuf, 2);
    this.bindAttribute(this.aControlPosLoc, this.controlPosBuf, 2);
    this.bindAttribute(this.aSourceColorLoc, this.sourceColorBuf, 4);
    this.bindAttribute(this.aTargetColorLoc, this.targetColorBuf, 4);
    this.bindAttribute(this.aSeedLoc, this.seedBuf, 1);

    // Draw Points
    this.gl.drawArrays(this.gl.POINTS, 0, this.particleCount);
  }

  private bindAttribute(loc: number, buf: WebGLBuffer | null, size: number) {
    if (!this.gl || loc === -1 || !buf) return;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
    this.gl.vertexAttribPointer(loc, size, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(loc);
  }
}
