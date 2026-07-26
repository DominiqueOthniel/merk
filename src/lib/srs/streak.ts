import { format } from "date-fns";

export function todayKey(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

export function updateStreak(
  lastReviewDay: string | null | undefined,
  streakDays: number,
  now: Date = new Date()
): { streakDays: number; lastReviewDay: string; isNewDay: boolean } {
  const today = todayKey(now);
  if (lastReviewDay === today) {
    return { streakDays, lastReviewDay: today, isNewDay: false };
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = todayKey(yesterday);

  if (lastReviewDay === yesterdayKey) {
    return { streakDays: streakDays + 1, lastReviewDay: today, isNewDay: true };
  }

  return { streakDays: 1, lastReviewDay: today, isNewDay: true };
}
