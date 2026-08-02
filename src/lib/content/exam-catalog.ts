import fs from "node:fs";
import path from "node:path";
import type { ExamExercise } from "./exam-types";
import {
  EXAM_CARD_KINDS,
  EXAM_LEVELS,
  exerciseCardKind,
  exerciseItemCount,
  formatLabel,
  sectionSortKey,
} from "./exam-types";

export {
  EXAM_CARD_KINDS,
  EXAM_LEVELS,
  exerciseCardKind,
  exerciseItemCount,
  formatLabel,
  sectionSortKey,
};
export type { ExamExercise, ExamLevelInfo, ExamFormat } from "./exam-types";

const LEVEL_FILES: Record<string, string> = {
  B1: "telc-b1.json",
  B2: "telc-b2.json",
  C1: "telc-c1.json",
};

const cachedByLevel = new Map<string, ExamExercise[]>();
let cachedAll: ExamExercise[] | null = null;

function loadJson(name: string): ExamExercise[] {
  const filePath = path.join(process.cwd(), "content", "exam", name);
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as ExamExercise[];
}

function loadLevel(level: string): ExamExercise[] {
  const hit = cachedByLevel.get(level);
  if (hit) return hit;
  const file = LEVEL_FILES[level];
  if (!file) return [];
  const data = loadJson(file);
  cachedByLevel.set(level, data);
  return data;
}

export function getExamAll(): ExamExercise[] {
  if (!cachedAll) {
    cachedAll = [
      ...loadLevel("B1"),
      ...loadLevel("B2"),
      ...loadLevel("C1"),
    ];
  }
  return cachedAll;
}

export function getExamExercises(level?: string | null): ExamExercise[] {
  if (!level || level === "ALL") return getExamAll();
  if (LEVEL_FILES[level]) return loadLevel(level);
  return getExamAll().filter((e) => e.level === level);
}

export function getExamExercise(sourceId: string): ExamExercise | undefined {
  for (const level of Object.keys(LEVEL_FILES)) {
    const found = loadLevel(level).find((e) => e.sourceId === sourceId);
    if (found) return found;
  }
  return undefined;
}
