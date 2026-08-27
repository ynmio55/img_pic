import type { WorkerComputePayload, WorkerResultPayload, EngineConfig } from '../engine/types';

// Pseudo-random number generator with seed
function createRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Color distance helper inside worker
function workerColorDistance(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return dr * dr + dg * dg + db * db;
}

self.onmessage = (event: MessageEvent<WorkerComputePayload>) => {
  const startTime = performance.now();
  const { sourcePixels, targetPixels, width, height, config } = event.data;

  const particleCount = Math.min(config.particleCount, width * height);
  const rng = createRandom(config.seed || 12345);

  // Step 1: Collect valid pixels from Source and Target
  const sourceList: { x: number; y: number; r: number; g: number; b: number; a: number; lum: number; edge: number }[] = [];
  const targetList: { x: number; y: number; r: number; g: number; b: number; a: number; lum: number; edge: number }[] = [];

  const stepX = Math.max(1, Math.floor(width / Math.sqrt(particleCount * 1.5)));
  const stepY = Math.max(1, Math.floor(height / Math.sqrt(particleCount * 1.5)));

  for (let y = 0; y < height; y += stepY) {
    for (let x = 0; x < width; x += stepX) {
      const idx = (y * width + x) * 4;
      const sa = sourcePixels[idx + 3];
      const ta = targetPixels[idx + 3];

      if (sa > 15) {
        const sr = sourcePixels[idx];
        const sg = sourcePixels[idx + 1];
        const sb = sourcePixels[idx + 2];
        const lum = 0.299 * sr + 0.587 * sg + 0.114 * sb;

        const rightIdx = (y * width + Math.min(width - 1, x + 1)) * 4;
        const downIdx = (Math.min(height - 1, y + 1) * width + x) * 4;
        const rLum = 0.299 * sourcePixels[rightIdx] + 0.587 * sourcePixels[rightIdx + 1] + 0.114 * sourcePixels[rightIdx + 2];
        const dLum = 0.299 * sourcePixels[downIdx] + 0.587 * sourcePixels[downIdx + 1] + 0.114 * sourcePixels[downIdx + 2];
        const edge = Math.abs(lum - rLum) + Math.abs(lum - dLum);

        sourceList.push({ x: x / width, y: y / height, r: sr, g: sg, b: sb, a: sa, lum, edge });
      }

      if (ta > 15) {
        const tr = targetPixels[idx];
        const tg = targetPixels[idx + 1];
        const tb = targetPixels[idx + 2];
        const lum = 0.299 * tr + 0.587 * tg + 0.114 * tb;

        const rightIdx = (y * width + Math.min(width - 1, x + 1)) * 4;
        const downIdx = (Math.min(height - 1, y + 1) * width + x) * 4;
        const rLum = 0.299 * targetPixels[rightIdx] + 0.587 * targetPixels[rightIdx + 1] + 0.114 * targetPixels[rightIdx + 2];
        const dLum = 0.299 * targetPixels[downIdx] + 0.587 * targetPixels[downIdx + 1] + 0.114 * targetPixels[downIdx + 2];
        const edge = Math.abs(lum - rLum) + Math.abs(lum - dLum);

        targetList.push({ x: x / width, y: y / height, r: tr, g: tg, b: tb, a: ta, lum, edge });
      }
    }
  }

  const N = Math.min(particleCount, Math.max(sourceList.length, targetList.length, 100));
  const finalSource = sampleExactN(sourceList, N, rng);
  const finalTarget = sampleExactN(targetList, N, rng);

  // Step 2: Compute particle matching / genetic annealing trajectory
  let trajectorySteps: Float32Array | undefined;
  let stepCount: number | undefined;

  let matchedTargetIndices: number[];

  if (config.algorithm === 'genetic-swap') {
    stepCount = 32;
    trajectorySteps = new Float32Array(stepCount * N * 2);

    // Initial assignment: Step 0 is exact source positions
    const currentAssignments = Array.from({ length: N }, (_, i) => i % finalTarget.length);
    
    for (let i = 0; i < N; i++) {
      trajectorySteps[i * 2] = finalSource[i].x;
      trajectorySteps[i * 2 + 1] = finalSource[i].y;
    }

    // Run 31 annealing steps with decreasing search radius maxDist
    for (let step = 1; step < stepCount; step++) {
      const maxDist = (1 - step / stepCount) * 0.45 + 0.005;

      for (let i = 0; i < N; i++) {
        const s = finalSource[i];
        const currentTIdx = currentAssignments[i];
        const currentT = finalTarget[currentTIdx];
        const currentCost = workerColorDistance(s.r, s.g, s.b, currentT.r, currentT.g, currentT.b);

        // Try swapping with random candidate in maxDist radius
        const candidateTIdx = Math.floor(rng() * finalTarget.length);
        const candidateT = finalTarget[candidateTIdx];
        const spatialDist = Math.abs(s.x - candidateT.x) + Math.abs(s.y - candidateT.y);

        if (spatialDist <= maxDist) {
          const candidateCost = workerColorDistance(s.r, s.g, s.b, candidateT.r, candidateT.g, candidateT.b);
          if (candidateCost < currentCost) {
            currentAssignments[i] = candidateTIdx;
          }
        }
      }

      // Record snapshot positions for this step
      const stepOffset = step * N * 2;
      for (let i = 0; i < N; i++) {
        const t = finalTarget[currentAssignments[i]];
        trajectorySteps[stepOffset + i * 2] = t.x;
        trajectorySteps[stepOffset + i * 2 + 1] = t.y;
      }
    }

    matchedTargetIndices = currentAssignments;
  } else {
    matchedTargetIndices = matchParticles(finalSource, finalTarget, config, rng);
  }

  // Step 3: Package into typed arrays for WebGL buffer upload
  const sx = new Float32Array(N);
  const sy = new Float32Array(N);
  const tx = new Float32Array(N);
  const ty = new Float32Array(N);
  const sc = new Uint8Array(N * 4);
  const tc = new Uint8Array(N * 4);
  const seeds = new Float32Array(N);
  const cpx = new Float32Array(N);
  const cpy = new Float32Array(N);

  const randomness = config.motionRandomness;

  for (let i = 0; i < N; i++) {
    const s = finalSource[i];
    const tIdx = matchedTargetIndices[i];
    const t = finalTarget[tIdx];

    sx[i] = s.x;
    sy[i] = s.y;
    tx[i] = t.x;
    ty[i] = t.y;

    sc[i * 4] = s.r;
    sc[i * 4 + 1] = s.g;
    sc[i * 4 + 2] = s.b;
    sc[i * 4 + 3] = s.a;

    tc[i * 4] = t.r;
    tc[i * 4 + 1] = t.g;
    tc[i * 4 + 2] = t.b;
    tc[i * 4 + 3] = t.a;

    seeds[i] = rng();

    // Curved Bezier trajectory control point offsets
    const angle = rng() * Math.PI * 2;
    const dist = (rng() * 0.4 + 0.1) * randomness;
    cpx[i] = (s.x + t.x) / 2 + Math.cos(angle) * dist;
    cpy[i] = (s.y + t.y) / 2 + Math.sin(angle) * dist;
  }

  const computeTimeMs = Math.round(performance.now() - startTime);

  const resultPayload: WorkerResultPayload = {
    particles: {
      sx, sy, tx, ty, sc, tc, seeds, cpx, cpy,
      trajectorySteps, stepCount
    },
    computeTimeMs,
    particleCount: N
  };

  const transferList: Transferable[] = [
    sx.buffer, sy.buffer, tx.buffer, ty.buffer,
    sc.buffer, tc.buffer, seeds.buffer, cpx.buffer, cpy.buffer
  ];

  if (trajectorySteps) {
    transferList.push(trajectorySteps.buffer);
  }

  (self as any).postMessage(resultPayload, transferList);
};

function sampleExactN(
  list: { x: number; y: number; r: number; g: number; b: number; a: number; lum: number; edge: number }[],
  N: number,
  rng: () => number
) {
  if (list.length === 0) {
    const res: typeof list = [];
    const side = Math.ceil(Math.sqrt(N));
    for (let i = 0; i < N; i++) {
      const gx = (i % side) / side;
      const gy = Math.floor(i / side) / side;
      res.push({ x: gx, y: gy, r: 128, g: 128, b: 128, a: 255, lum: 128, edge: 0 });
    }
    return res;
  }

  if (list.length === N) return list;

  const res: typeof list = [];
  if (list.length > N) {
    const step = list.length / N;
    for (let i = 0; i < N; i++) {
      res.push(list[Math.floor(i * step)]);
    }
  } else {
    for (let i = 0; i < N; i++) {
      const base = list[i % list.length];
      res.push({
        ...base,
        x: Math.max(0, Math.min(1, base.x + (rng() - 0.5) * 0.005)),
        y: Math.max(0, Math.min(1, base.y + (rng() - 0.5) * 0.005))
      });
    }
  }
  return res;
}

function matchParticles(
  sources: { x: number; y: number; r: number; g: number; b: number; a: number; lum: number; edge: number }[],
  targets: { x: number; y: number; r: number; g: number; b: number; a: number; lum: number; edge: number }[],
  config: EngineConfig,
  rng: () => number
): number[] {
  const N = sources.length;
  const matched = new Array<number>(N);
  const usedTarget = new Uint8Array(targets.length);

  const { algorithm, colorImportance, positionImportance } = config;

  // Random Chaos
  if (algorithm === 'random-chaos') {
    const indices = Array.from({ length: N }, (_, i) => i % targets.length);
    for (let i = N - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }

  // Particle Morph (Edge & Luminance density)
  if (algorithm === 'particle-morph') {
    const sSorted = sources.map((s, idx) => ({ s, idx, score: s.lum * 0.6 + s.edge * 1.4 })).sort((a, b) => a.score - b.score);
    const tSorted = targets.map((t, idx) => ({ t, idx, score: t.lum * 0.6 + t.edge * 1.4 })).sort((a, b) => a.score - b.score);

    for (let i = 0; i < N; i++) {
      matched[sSorted[i].idx] = tSorted[i].idx;
    }
    return matched;
  }

  // Nearest Color
  if (algorithm === 'nearest-color') {
    const sSorted = sources.map((s, idx) => ({ s, idx })).sort((a, b) => a.s.lum - b.s.lum);
    const tSorted = targets.map((t, idx) => ({ t, idx })).sort((a, b) => a.t.lum - b.t.lum);

    for (let i = 0; i < N; i++) {
      matched[sSorted[i].idx] = tSorted[i].idx;
    }
    return matched;
  }

  // Nearest Position
  if (algorithm === 'nearest-position') {
    const sSorted = sources.map((s, idx) => ({ s, idx, posKey: s.x + s.y * 1.5 })).sort((a, b) => a.posKey - b.posKey);
    const tSorted = targets.map((t, idx) => ({ t, idx, posKey: t.x + t.y * 1.5 })).sort((a, b) => a.posKey - b.posKey);

    for (let i = 0; i < N; i++) {
      matched[sSorted[i].idx] = tSorted[i].idx;
    }
    return matched;
  }

  // Smooth Flow
  if (algorithm === 'smooth-flow') {
    const sSorted = sources.map((s, idx) => ({ s, idx, angle: Math.atan2(s.y - 0.5, s.x - 0.5) })).sort((a, b) => a.angle - b.angle);
    const tSorted = targets.map((t, idx) => ({ t, idx, angle: Math.atan2(t.y - 0.5, t.x - 0.5) })).sort((a, b) => a.angle - b.angle);

    for (let i = 0; i < N; i++) {
      matched[sSorted[i].idx] = tSorted[i].idx;
    }
    return matched;
  }

  // Default: Hybrid 'pixel-morph'
  const wColor = (colorImportance ?? 0.5) * 2.0;
  const wPos = (positionImportance ?? 0.5) * 10.0;

  const GRID_SIZE = 12;
  const grid: number[][][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => [])
  );

  for (let i = 0; i < targets.length; i++) {
    const gx = Math.min(GRID_SIZE - 1, Math.floor(targets[i].x * GRID_SIZE));
    const gy = Math.min(GRID_SIZE - 1, Math.floor(targets[i].y * GRID_SIZE));
    grid[gx][gy].push(i);
  }

  for (let i = 0; i < N; i++) {
    const s = sources[i];
    const gx = Math.min(GRID_SIZE - 1, Math.floor(s.x * GRID_SIZE));
    const gy = Math.min(GRID_SIZE - 1, Math.floor(s.y * GRID_SIZE));

    let bestIdx = -1;
    let minCost = Infinity;

    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
          const bucket = grid[nx][ny];
          for (let k = 0; k < bucket.length; k++) {
            const tIdx = bucket[k];
            if (usedTarget[tIdx] && N < targets.length) continue;

            const t = targets[tIdx];
            const cDist = workerColorDistance(s.r, s.g, s.b, t.r, t.g, t.b);
            const pDist = (s.x - t.x) * (s.x - t.x) + (s.y - t.y) * (s.y - t.y);
            const cost = wColor * cDist + wPos * pDist * 255 * 255;

            if (cost < minCost) {
              minCost = cost;
              bestIdx = tIdx;
            }
          }
        }
      }
    }

    if (bestIdx === -1) {
      bestIdx = Math.floor(rng() * targets.length);
    }

    matched[i] = bestIdx;
    usedTarget[bestIdx] = 1;
  }

  return matched;
}
