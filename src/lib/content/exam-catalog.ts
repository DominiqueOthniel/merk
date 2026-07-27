import { EXAM_TELC_B1 } from "./exam-telc-b1";
import { EXAM_TELC_B2 } from "./exam-telc-b2";
import type { ExamExercise } from "./exam-types";
import { EXAM_LEVELS } from "./exam-types";

export { EXAM_LEVELS };
export type { ExamExercise, ExamLevelInfo } from "./exam-types";

export const EXAM_ALL: ExamExercise[] = [...EXAM_TELC_B1, ...EXAM_TELC_B2];

export function getExamExercises(level?: string | null): ExamExercise[] {
  if (!level || level === "ALL") return EXAM_ALL;
  return EXAM_ALL.filter((e) => e.level === level);
}

export function getExamExercise(sourceId: string): ExamExercise | undefined {
  return EXAM_ALL.find((e) => e.sourceId === sourceId);
}
