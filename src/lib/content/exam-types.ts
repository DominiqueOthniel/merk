export type ExamPair = { passage: string; title: string };

export type ExamExercise = {
  sourceId: string;
  sourceTitle: string;
  section: string;
  skill: "lesen" | "sprachbausteine" | "horen";
  level: string;
  exam: string;
  options: string[];
  pairs: ExamPair[];
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
