import type { EasingType } from './types';

export function getEasing(t: number, type: EasingType): number {
  const clampT = Math.max(0, Math.min(1, t));

  switch (type) {
    case 'linear':
      return clampT;

    case 'cubic-in-out':
      return clampT < 0.5
        ? 4 * clampT * clampT * clampT
        : 1 - Math.pow(-2 * clampT + 2, 3) / 2;

    case 'quad-in-out':
      return clampT < 0.5
        ? 2 * clampT * clampT
        : 1 - Math.pow(-2 * clampT + 2, 2) / 2;

    case 'exponential':
      if (clampT === 0) return 0;
      if (clampT === 1) return 1;
      return clampT < 0.5
        ? Math.pow(2, 20 * clampT - 10) / 2
        : (2 - Math.pow(2, -20 * clampT + 10)) / 2;

    case 'elastic': {
      if (clampT === 0) return 0;
      if (clampT === 1) return 1;
      const c4 = (2 * Math.PI) / 3;
      return clampT < 0.5
        ? -(Math.pow(2, 20 * clampT - 10) * Math.sin((clampT * 20 - 11.125) * c4)) / 2
        : (Math.pow(2, -20 * clampT + 10) * Math.sin((clampT * 20 - 11.125) * c4)) / 2 + 1;
    }

    case 'bounce': {
      const n1 = 7.5625;
      const d1 = 2.75;
      let x = clampT;
      if (x < 1 / d1) {
        return n1 * x * x;
      } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
      } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
      } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
      }
    }

    case 'chaos-burst': {
      const base = clampT < 0.5
        ? 8 * Math.pow(clampT, 4)
        : 1 - Math.pow(-2 * clampT + 2, 4) / 2;
      return base;
    }

    case 'spiral-flow': {
      return 1 / (1 + Math.exp(-12 * (clampT - 0.5)));
    }

    default:
      return clampT;
  }
}
