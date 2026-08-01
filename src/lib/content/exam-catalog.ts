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

let cached: ExamExercise[] | null = null;

function loadJson(name: string): ExamExercise[] {
  const filePath = path.join(process.cwd(), "content", "exam", name);
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as ExamExercise[];
}

export function getExamAll(): ExamExercise[] {
  if (!cached) {
    cached = [...loadJson("telc-b1.json"), ...loadJson("telc-b2.json")];
  }
  return cached;
}

export function getExamExercises(level?: string | null): ExamExercise[] {
  const all = getExamAll();
  if (!level || level === "ALL") return all;
  return all.filter((e) => e.level === level);
}

export function getExamExercise(sourceId: string): ExamExercise | undefined {
  return getExamAll().find((e) => e.sourceId === sourceId);
}
