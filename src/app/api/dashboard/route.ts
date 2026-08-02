import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EXAM_CARD_KINDS } from "@/lib/content/exam-catalog";
import { computePrepScore, prepLabel } from "@/lib/srs/prep-score";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const practiceKinds = { notIn: [...EXAM_CARD_KINDS] };

  const [user, dueCount, doneToday, recent, themes, progressRows, latestPrep] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { cohorte: true, centre: true },
      }),
      prisma.cardProgress.count({
        where: {
          userId,
          nextReviewAt: { lte: now },
          card: { kind: practiceKinds },
        },
      }),
      prisma.reviewLog.count({
        where: { userId, createdAt: { gte: startOfDay } },
      }),
      prisma.reviewLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { correct: true },
      }),
      prisma.theme.findMany({
        orderBy: { sortOrder: "asc" },
        select: { id: true, slug: true, nameFr: true, nameDe: true },
      }),
      prisma.cardProgress.findMany({
        where: { userId, card: { kind: practiceKinds } },
        select: {
          repetitions: true,
          card: { select: { themeId: true } },
        },
      }),
      prisma.prepScore.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { value: true },
      }),
    ]);

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const themeAgg = new Map<string, { total: number; mastered: number }>();
  for (const row of progressRows) {
    const themeId = row.card.themeId;
    let agg = themeAgg.get(themeId);
    if (!agg) {
      agg = { total: 0, mastered: 0 };
      themeAgg.set(themeId, agg);
    }
    agg.total += 1;
    if (row.repetitions >= 2) agg.mastered += 1;
  }

  const progressByTheme = themes
    .filter((theme) => !theme.slug.startsWith("examen-"))
    .map((theme) => {
      const agg = themeAgg.get(theme.id) ?? { total: 0, mastered: 0 };
      return {
        slug: theme.slug,
        name: theme.nameFr,
        nameDe: theme.nameDe,
        total: agg.total,
        mastered: agg.mastered,
        pct: agg.total === 0 ? 0 : Math.round((agg.mastered / agg.total) * 100),
      };
    });

  const recentCorrectRate =
    recent.length === 0
      ? 0.5
      : recent.filter((r) => r.correct).length / recent.length;

  let hoursUntilSession: number | null = null;
  if (user.cohorte?.nextSessionAt) {
    hoursUntilSession =
      (user.cohorte.nextSessionAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  }

  const prepValue = computePrepScore({
    dueTotal: dueCount + doneToday,
    dueDoneToday: doneToday,
    recentCorrectRate,
    hoursUntilSession,
  });

  let challenge = null;
  let ranking: { name: string; points: number; isYou: boolean }[] = [];

  if (user.cohorteId) {
    const [ch, peers] = await Promise.all([
      prisma.challenge.findFirst({
        where: {
          cohorteId: user.cohorteId,
          startsAt: { lte: now },
          endsAt: { gte: now },
        },
      }),
      prisma.user.findMany({
        where: { cohorteId: user.cohorteId, role: "STUDENT" },
        orderBy: { totalPoints: "desc" },
        select: { id: true, name: true, totalPoints: true },
      }),
    ]);

    if (ch) {
      challenge = {
        id: ch.id,
        title: ch.title,
        goalCards: ch.goalCards,
        progress: ch.progress,
        endsAt: ch.endsAt,
        pct: Math.min(100, Math.round((ch.progress / ch.goalCards) * 100)),
      };
    }

    ranking = peers.map((p) => ({
      name: p.name,
      points: p.totalPoints,
      isYou: p.id === user.id,
    }));
  }

  return NextResponse.json({
    user: {
      name: user.name,
      cefrLevel: user.cefrLevel,
      streakDays: user.streakDays,
      totalPoints: user.totalPoints,
      centre: user.centre?.name ?? null,
      cohorte: user.cohorte?.name ?? null,
      nextSessionAt: user.cohorte?.nextSessionAt ?? null,
    },
    dueCount,
    doneToday,
    prepScore: latestPrep?.value ?? prepValue,
    prepLabel: prepLabel(latestPrep?.value ?? prepValue),
    themes: progressByTheme,
    challenge,
    ranking,
  });
}
