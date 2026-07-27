export type ExamPair = { passage: string; title: string };

export type ExamGap = {
  n: number;
  answer: string;
  choices: string[];
};

export type ExamFormat = "MATCH" | "CLOZE_MCQ" | "CLOZE_BANK";

export type ExamExercise = {
  sourceId: string;
  sourceTitle: string;
  section: string;
  skill: "lesen" | "sprachbausteine" | "horen";
  level: string;
  exam: string;
  format: ExamFormat;
  options: string[];
  pairs: ExamPair[];
  passage?: string;
  bank?: string[];
  gaps?: ExamGap[];
};

export type ExamLevelInfo = {
  id: "B1" | "B2" | "C1";
  label: string;
  available: boolean;
  note?: string;
};

export const EXAM_LEVELS: ExamLevelInfo[] = [
  { id: "B1", label: "B1", available: true },
  { id: "B2", label: "B2", available: true },
  {
    id: "C1",
    label: "C1",
    available: false,
    note: "Contenu C1 bientot. Sur Deuropa il est hors app (Telegram).",
  },
];

export const EXAM_CARD_KINDS = ["MATCH", "CLOZE_MCQ", "CLOZE_BANK"] as const;

export function exerciseItemCount(exercise: ExamExercise): number {
  if (exercise.format === "MATCH") return exercise.pairs?.length ?? 0;
  return exercise.gaps?.length ?? 0;
}

export function exerciseCardKind(exercise: ExamExercise): string {
  if (exercise.format === "CLOZE_MCQ") return "CLOZE_MCQ";
  if (exercise.format === "CLOZE_BANK") return "CLOZE_BANK";
  return "MATCH";
}
