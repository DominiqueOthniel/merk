export type ExamPair = { passage: string; title: string };

export type ExamGap = {
  n: number;
  answer: string;
  choices: string[];
  prompt?: string;
};

export type ExamFormat =
  | "MATCH"
  | "CLOZE_MCQ"
  | "CLOZE_BANK"
  | "READING_MCQ"
  | "TF"
  | "WRITE";

export type ExamExercise = {
  sourceId: string;
  sourceTitle: string;
  section: string;
  skill: "lesen" | "sprachbausteine" | "horen" | "schreiben";
  level: string;
  exam: string;
  format: ExamFormat;
  options: string[];
  pairs: ExamPair[];
  passage?: string;
  bank?: string[];
  gaps?: ExamGap[];
  audioUrl?: string | null;
  /** Script pour TTS Horen (si absent, genere depuis les items). */
  listenScript?: string | null;
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
    available: true,
    note: "Format telc Deutsch C1. Contenu MERK original aligne sur les types d epreuves officiels.",
  },
];

export const EXAM_CARD_KINDS = [
  "MATCH",
  "CLOZE_MCQ",
  "CLOZE_BANK",
  "READING_MCQ",
  "TF",
  "WRITE",
] as const;

export function exerciseItemCount(exercise: ExamExercise): number {
  if (exercise.format === "MATCH") return exercise.pairs?.length ?? 0;
  return exercise.gaps?.length ?? 0;
}

export function exerciseCardKind(exercise: ExamExercise): string {
  return exercise.format;
}

export function formatLabel(format: ExamFormat): string {
  switch (format) {
    case "MATCH":
      return "Association";
    case "CLOZE_MCQ":
      return "Lacunes MCQ";
    case "CLOZE_BANK":
      return "Banque de mots";
    case "READING_MCQ":
      return "Lecture QCM";
    case "TF":
      return "Richtig / Falsch";
    case "WRITE":
      return "Production ecrite";
    default:
      return format;
  }
}

export function sectionSortKey(section: string): number {
  const order = [
    "Lesen Teil 1",
    "Lesen Teil 2",
    "Lesen Teil 3",
    "Sprachbausteine Teil 1",
    "Sprachbausteine Teil 2",
    "Sprachbausteine",
    "Hören",
    "Schreiben",
    "Sprechen",
  ];
  const idx = order.findIndex(
    (s) => section === s || section.startsWith(s) || section.includes(s)
  );
  return idx === -1 ? 99 : idx;
}
