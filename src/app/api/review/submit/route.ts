import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { answersMatch } from "@/lib/normalize";
import { applySm2, type QualityLabel } from "@/lib/srs/sm2";
import { computePoints } from "@/lib/srs/points";
import { updateStreak } from "@/lib/srs/streak";
import { computePrepScore } from "@/lib/srs/prep-score";

const schema = z.object({
  progressId: z.string(),
  answer: z.string(),
  quality: z.enum(["HARD", "MEDIUM", "EASY"]),
  responseMs: z.number().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  try {
    const data = schema.parse(await req.json());
    const progress = await prisma.cardProgress.findFirst({
      where: { id: data.progressId, userId: session.user.id },
      include: { card: true, user: true },
    });

    if (!progress) {
      return NextResponse.json({ error: "Carte introuvable" }, { status: 404 });
    }

    const correct = answersMatch(data.answer, progress.card.answer);
    const quality = (correct ? data.quality : "HARD") as QualityLabel;

    const sm2 = applySm2(
      {
        easeFactor: progress.easeFactor,
        intervalDays: progress.intervalDays,
        repetitions: progress.repetitions,
      },
      quality
    );

    const streak = updateStreak(progress.user.lastReviewDay, progress.user.streakDays);
    const points = computePoints(quality, streak.streakDays, correct);

    await prisma.$transaction(async (tx) => {
      await tx.cardProgress.update({
        where: { id: progress.id },
        data: {
          easeFactor: sm2.easeFactor,
          intervalDays: sm2.intervalDays,
          repetitions: sm2.repetitions,
          nextReviewAt: sm2.nextReviewAt,
          lastReviewedAt: new Date(),
        },
      });

      await tx.reviewLog.create({
        data: {
          userId: session.user.id,
          cardId: progress.cardId,
          quality,
          correct,
          responseMs: data.responseMs,
          pointsEarned: points,
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: {
          streakDays: streak.streakDays,
          lastReviewDay: streak.lastReviewDay,
          totalPoints: { increment: points },
        },
      });

      if (progress.user.cohorteId) {
        const challenge = await tx.challenge.findFirst({
          where: {
            cohorteId: progress.user.cohorteId,
            startsAt: { lte: new Date() },
            endsAt: { gte: new Date() },
          },
        });
        if (challenge) {
          await tx.challenge.update({
            where: { id: challenge.id },
            data: { progress: { increment: 1 } },
          });
        }
      }
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { cohorte: true },
    });

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const dueTotal = await prisma.cardProgress.count({
      where: { userId: session.user.id, nextReviewAt: { lte: now } },
    });
    const dueDoneToday = await prisma.reviewLog.count({
      where: { userId: session.user.id, createdAt: { gte: startOfDay } },
    });
    const recent = await prisma.reviewLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    const recentCorrectRate =
      recent.length === 0
        ? 0.5
        : recent.filter((r) => r.correct).length / recent.length;

    let hoursUntilSession: number | null = null;
    if (user?.cohorte?.nextSessionAt) {
      hoursUntilSession =
        (user.cohorte.nextSessionAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    }

    const prepValue = computePrepScore({
      dueTotal: dueTotal + dueDoneToday,
      dueDoneToday,
      recentCorrectRate,
      hoursUntilSession,
    });

    await prisma.prepScore.create({
      data: { userId: session.user.id, value: prepValue },
    });

    return NextResponse.json({
      correct,
      expected: progress.card.answer,
      context: progress.card.context,
      points,
      nextReviewAt: sm2.nextReviewAt,
      prepScore: prepValue,
      streakDays: streak.streakDays,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Donnees invalides" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
