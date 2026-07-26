import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computePrepScore, prepLabel } from "@/lib/srs/prep-score";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      cohorte: true,
      centre: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const dueCount = await prisma.cardProgress.count({
    where: { userId: user.id, nextReviewAt: { lte: now } },
  });

  const doneToday = await prisma.reviewLog.count({
    where: { userId: user.id, createdAt: { gte: startOfDay } },
  });

  const recent = await prisma.reviewLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
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

  const themes = await prisma.theme.findMany({ orderBy: { sortOrder: "asc" } });
  const progressByTheme = await Promise.all(
    themes.map(async (theme) => {
      const total = await prisma.cardProgress.count({
        where: { userId: user.id, card: { themeId: theme.id } },
      });
      const mastered = await prisma.cardProgress.count({
        where: {
          userId: user.id,
          card: { themeId: theme.id },
          repetitions: { gte: 2 },
        },
      });
      return {
        slug: theme.slug,
        name: theme.nameFr,
        nameDe: theme.nameDe,
        total,
        mastered,
        pct: total === 0 ? 0 : Math.round((mastered / total) * 100),
      };
    })
  );

  let challenge = null;
  let ranking: { name: string; points: number; isYou: boolean }[] = [];

  if (user.cohorteId) {
    const ch = await prisma.challenge.findFirst({
      where: {
        cohorteId: user.cohorteId,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
    });
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

    const peers = await prisma.user.findMany({
      where: { cohorteId: user.cohorteId, role: "STUDENT" },
      orderBy: { totalPoints: "desc" },
      select: { id: true, name: true, totalPoints: true },
    });
    ranking = peers.map((p) => ({
      name: p.name,
      points: p.totalPoints,
      isYou: p.id === user.id,
    }));
  }

  const latestPrep = await prisma.prepScore.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

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
