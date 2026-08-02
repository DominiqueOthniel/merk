import fs from "node:fs";
import path from "node:path";
import type { ExamProvider } from "@/lib/exam-provider";
import { normalizeExamProvider } from "@/lib/exam-provider";
import type { ExamExercise, ExamLevelInfo } from "./exam-types";
import {
  EXAM_CARD_KINDS,
  exerciseCardKind,
  exerciseItemCount,
  formatLabel,
  sectionSortKey,
} from "./exam-types";

export {
  EXAM_CARD_KINDS,
  exerciseCardKind,
  exerciseItemCount,
  formatLabel,
  sectionSortKey,
};
export type { ExamExercise, ExamLevelInfo, ExamFormat } from "./exam-types";

const LEVEL_FILES: Record<ExamProvider, Record<string, string>> = {
  TELC: {
    A1: "telc-a1.json",
    A2: "telc-a2.json",
    B1: "telc-b1.json",
    B2: "telc-b2.json",
    C1: "telc-c1.json",
  },
  GOETHE: {
    A1: "goethe-a1.json",
    A2: "goethe-a2.json",
    B1: "goethe-b1.json",
    B2: "goethe-b2.json",
    C1: "goethe-c1.json",
  },
};

const cached = new Map<string, ExamExercise[]>();

function cacheKey(provider: ExamProvider, level: string) {
  return `${provider}:${level}`;
}

function loadJson(name: string): ExamExercise[] {
  const filePath = path.join(process.cwd(), "content", "exam", name);
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as ExamExercise[];
}

function loadLevel(provider: ExamProvider, level: string): ExamExercise[] {
  const key = cacheKey(provider, level);
  const hit = cached.get(key);
  if (hit) return hit;
  const file = LEVEL_FILES[provider]?.[level];
  if (!file) return [];
  const data = loadJson(file);
  cached.set(key, data);
  return data;
}

export function getExamLevels(provider?: ExamProvider | string | null): ExamLevelInfo[] {
  const p = normalizeExamProvider(provider);
  const shared: ExamLevelInfo[] = [
    { id: "A1", label: "A1", available: true },
    { id: "A2", label: "A2", available: true },
    { id: "B1", label: "B1", available: true },
    { id: "B2", label: "B2", available: true },
  ];
  if (p === "GOETHE") {
    return [
      ...shared,
      {
        id: "C1",
        label: "C1",
        available: true,
        note: "Format Goethe-Zertifikat C1. Contenu MERK original aligne sur les types d epreuves.",
      },
    ];
  }
  return [
    ...shared,
    {
      id: "C1",
      label: "C1",
      available: true,
      note: "Format telc Deutsch C1. Contenu MERK original aligne sur les types d epreuves officiels.",
    },
  ];
}

/** @deprecated Prefer getExamLevels(provider) */
export const EXAM_LEVELS = getExamLevels("TELC");

export function getExamAll(provider?: ExamProvider | string | null): ExamExercise[] {
  const p = normalizeExamProvider(provider);
  return [
    ...loadLevel(p, "A1"),
    ...loadLevel(p, "A2"),
    ...loadLevel(p, "B1"),
    ...loadLevel(p, "B2"),
    ...loadLevel(p, "C1"),
  ];
}

export function getExamExercises(
  provider?: ExamProvider | string | null,
  level?: string | null,
): ExamExercise[] {
  const p = normalizeExamProvider(provider);
  if (!level || level === "ALL") return getExamAll(p);
  if (LEVEL_FILES[p][level]) return loadLevel(p, level);
  return getExamAll(p).filter((e) => e.level === level);
}

export function getExamExercise(
  sourceId: string,
  provider?: ExamProvider | string | null,
): ExamExercise | undefined {
  if (provider) {
    return getExamAll(provider).find((e) => e.sourceId === sourceId);
  }
  return (
    getExamAll("TELC").find((e) => e.sourceId === sourceId) ||
    getExamAll("GOETHE").find((e) => e.sourceId === sourceId)
  );
}
