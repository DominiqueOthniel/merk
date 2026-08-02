export type MockLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type MockItem = {
  id: string;
  sourceId: string;
  sourceTitle: string;
  skill: string;
  section: string;
  format: string;
  prompt: string;
  passage?: string | null;
  options: string[];
  answer: string;
  selfScore?: boolean;
};

export const MOCK_SKILL_ORDER = [
  "lesen",
  "sprachbausteine",
  "horen",
  "schreiben",
  "sprechen",
] as const;

export const MOCK_MAX_PER_SKILL: Record<string, number> = {
  lesen: 5,
  sprachbausteine: 4,
  horen: 4,
  schreiben: 1,
  sprechen: 1,
};

export function mockDurationMinutes(level: MockLevel): number {
  if (level === "C1") return 90;
  if (level === "B2") return 70;
  if (level === "B1") return 50;
  if (level === "A2") return 40;
  return 35;
}

export function mockDurationLabel(level: MockLevel): string {
  const m = mockDurationMinutes(level);
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (h === 0) return `${m} min`;
  if (rest === 0) return `${h}h`;
  return `${h}h ${rest}min`;
}

export function mockSkillLabels(skillsPresent: string[]): string[] {
  const labels: Record<string, string> = {
    lesen: "Lesen",
    sprachbausteine: "Bausteine",
    horen: "Horen",
    schreiben: "Schreiben",
    sprechen: "Sprechen",
  };
  return MOCK_SKILL_ORDER.filter((s) => skillsPresent.includes(s)).map(
    (s) => labels[s] ?? s,
  );
}
