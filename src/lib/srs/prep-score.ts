/**
 * Preparation score 0-100.
 * Mix of due-card completion, recent performance, and session proximity.
 */
export function computePrepScore(input: {
  dueTotal: number;
  dueDoneToday: number;
  recentCorrectRate: number;
  hoursUntilSession: number | null;
}): number {
  const dueRatio =
    input.dueTotal === 0
      ? 1
      : Math.min(1, input.dueDoneToday / Math.max(1, input.dueTotal));

  const duePart = dueRatio * 55;
  const perfPart = Math.min(1, Math.max(0, input.recentCorrectRate)) * 30;

  let proximityPart = 10;
  if (input.hoursUntilSession != null) {
    if (input.hoursUntilSession <= 24) {
      proximityPart = dueRatio >= 0.85 ? 15 : 5;
    } else if (input.hoursUntilSession <= 72) {
      proximityPart = dueRatio >= 0.6 ? 12 : 8;
    }
  }

  return Math.round(Math.min(100, Math.max(0, duePart + perfPart + proximityPart)));
}

export function prepLabel(score: number): string {
  if (score >= 80) return "Tu es pret";
  if (score >= 55) return "Encore un effort";
  return "Il reste du travail";
}
