import type { QualityLabel } from "./sm2";

/**
 * Variable reward in a bounded range (30-50).
 * Driven by perceived difficulty + streak regularity, not pure chance.
 */
export function computePoints(
  quality: QualityLabel,
  streakDays: number,
  wasCorrect: boolean
): number {
  if (!wasCorrect) return 30;

  let base = 38;
  if (quality === "HARD") base = 44;
  if (quality === "EASY") base = 34;
  if (quality === "MEDIUM") base = 40;

  const streakBonus = Math.min(6, Math.floor(streakDays / 3));
  const wobble = ((streakDays + (wasCorrect ? 2 : 0)) % 3) - 1;

  return Math.min(50, Math.max(30, base + streakBonus + wobble));
}
