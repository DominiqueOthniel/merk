import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getExamExercise } from "@/lib/content/exam-catalog";

type Ctx = { params: Promise<{ sourceId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { sourceId } = await ctx.params;
  const exercise = getExamExercise(sourceId);
  if (!exercise) {
    return NextResponse.json({ error: "Serie introuvable" }, { status: 404 });
  }

  const now = new Date();
  let cards = await prisma.card.findMany({
    where: {
      kind: "MATCH",
      sourceRef: { startsWith: `deuropa:${sourceId}:` },
    },
    include: {
      progress: { where: { userId: session.user.id } },
    },
    orderBy: { sourceRef: "asc" },
  });

  for (const card of cards) {
    if (!card.progress[0]) {
      await prisma.cardProgress.create({
        data: {
          userId: session.user.id,
          cardId: card.id,
          nextReviewAt: now,
        },
      });
    }
  }

  cards = await prisma.card.findMany({
    where: {
      kind: "MATCH",
      sourceRef: { startsWith: `deuropa:${sourceId}:` },
    },
    include: {
      progress: { where: { userId: session.user.id } },
    },
    orderBy: { sourceRef: "asc" },
  });

  const dueFirst = [...cards].sort((a, b) => {
    const aDue = a.progress[0]?.nextReviewAt ?? now;
    const bDue = b.progress[0]?.nextReviewAt ?? now;
    return aDue.getTime() - bDue.getTime();
  });

  return NextResponse.json({
    sourceId: exercise.sourceId,
    title: exercise.sourceTitle,
    section: exercise.section,
    skill: exercise.skill,
    level: exercise.level,
    options: exercise.options,
    items: dueFirst.map((card) => ({
      progressId: card.progress[0]?.id,
      cardId: card.id,
      passage: card.context,
      answer: card.answer,
      options: card.options ? (JSON.parse(card.options) as string[]) : exercise.options,
      due: (card.progress[0]?.nextReviewAt ?? now) <= now,
    })),
  });
}
