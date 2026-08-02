import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  EXAM_CARD_KINDS,
  exerciseItemCount,
  getExamExercise,
} from "@/lib/content/exam-catalog";
import { buildListenScript } from "@/lib/content/listen-script";
import {
  examProviderLabel,
  examSourcePrefix,
  normalizeExamProvider,
} from "@/lib/exam-provider";

type Ctx = { params: Promise<{ sourceId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { examProvider: true },
  });
  const provider = normalizeExamProvider(
    dbUser?.examProvider ?? session.user.examProvider,
  );
  const prefix = examSourcePrefix(provider);

  const { sourceId } = await ctx.params;
  const exercise = getExamExercise(sourceId, provider);
  if (!exercise) {
    return NextResponse.json({ error: "Serie introuvable" }, { status: 404 });
  }

  const now = new Date();
  const where = {
    kind: { in: [...EXAM_CARD_KINDS] },
    sourceRef: { startsWith: `${prefix}${sourceId}:` },
  };

  let cards = await prisma.card.findMany({
    where,
    include: {
      progress: { where: { userId: session.user.id } },
    },
    orderBy: { sourceRef: "asc" },
  });

  const missing = cards.filter((card) => !card.progress[0]);
  if (missing.length) {
    await prisma.cardProgress.createMany({
      data: missing.map((card) => ({
        userId: session.user.id,
        cardId: card.id,
        nextReviewAt: now,
      })),
      skipDuplicates: true,
    });
    cards = await prisma.card.findMany({
      where,
      include: {
        progress: { where: { userId: session.user.id } },
      },
      orderBy: { sourceRef: "asc" },
    });
  }

  const dueFirst = [...cards].sort((a, b) => {
    const aDue = a.progress[0]?.nextReviewAt ?? now;
    const bDue = b.progress[0]?.nextReviewAt ?? now;
    return aDue.getTime() - bDue.getTime();
  });

  const listenScript = buildListenScript(exercise);
  const isListen = exercise.skill === "horen";

  return NextResponse.json({
    exam: provider,
    examLabel: examProviderLabel(provider),
    sourceId: exercise.sourceId,
    title: exercise.sourceTitle,
    section: exercise.section,
    skill: exercise.skill,
    level: exercise.level,
    format: exercise.format,
    // Pour Horen on ne renvoie pas le script lisible (anti-triche)
    passage: isListen ? null : exercise.passage ?? null,
    audioUrl: exercise.audioUrl ?? null,
    listenScript,
    itemCount: exerciseItemCount(exercise),
    options: exercise.bank?.length ? exercise.bank : exercise.options,
    items: dueFirst.map((card) => {
      const gapMatch = card.sourceRef?.match(/:(\d+)$/);
      const gapN = gapMatch ? Number(gapMatch[1]) : null;
      const rawOptions = card.options
        ? (JSON.parse(card.options) as string[])
        : exercise.bank?.length
          ? exercise.bank
          : exercise.options;
      const options = rawOptions.filter(
        (w) => w && !w.includes("${") && !/droppedWord|wordText/i.test(w)
      );
      return {
        progressId: card.progress[0]?.id,
        cardId: card.id,
        kind: card.kind,
        gapN,
        prompt: card.prompt,
        passage: isListen ? "" : card.context,
        answer: card.answer,
        options: options.includes(card.answer)
          ? options
          : [...options, card.answer],
        due: (card.progress[0]?.nextReviewAt ?? now) <= now,
      };
    }),
  });
}
