/**
 * Color utility functions for RGB color distance, HSL conversion, and interpolation
 */

export function colorDistance(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number {
  // Weighted RGB euclidean distance according to human eye color perception
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  const rMean = (r1 + r2) / 2;
  return Math.sqrt(
    (2 + rMean / 256) * dr * dr +
    4 * dg * dg +
    (2 + (255 - rMean) / 256) * db * db
  );
}

export function interpolateColor(
  sc: [number, number, number, number],
  tc: [number, number, number, number],
  t: number
): [number, number, number, number] {
  const clampT = Math.max(0, Math.min(1, t));
  return [
    Math.round(sc[0] + (tc[0] - sc[0]) * clampT),
    Math.round(sc[1] + (tc[1] - sc[1]) * clampT),
    Math.round(sc[2] + (tc[2] - sc[2]) * clampT),
    Math.round(sc[3] + (tc[3] - sc[3]) * clampT)
  ];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}
