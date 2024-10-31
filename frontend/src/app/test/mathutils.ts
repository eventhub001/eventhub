export function roundSmallToZero(num: number, threshold: number = 1e-14): number {
    return Math.abs(num) < threshold ? 0 : num;
  }