import type { CefrLevel } from "@/lib/types";

export const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1"];

export function isCefrLevel(value: unknown): value is CefrLevel {
  return CEFR_LEVELS.includes(value as CefrLevel);
}

export function levelsBetween(from: CefrLevel, to: CefrLevel): CefrLevel[] {
  const a = CEFR_LEVELS.indexOf(from);
  const b = CEFR_LEVELS.indexOf(to);
  if (a < 0 || b < 0) return ["A1"];
  const start = Math.min(a, b);
  const end = Math.max(a, b);
  return CEFR_LEVELS.slice(start, end + 1);
}

export function levelsUpTo(level: CefrLevel): CefrLevel[] {
  const idx = CEFR_LEVELS.indexOf(level);
  return CEFR_LEVELS.slice(0, Math.max(1, idx + 1));
}
