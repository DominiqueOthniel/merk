import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { answersMatch } from "@/lib/normalize";
import { EXAM_CARD_KINDS } from "@/lib/content/exam-catalog";

const schema = z.object({
  progressId: z.string(),
  answer: z.string(),
  correct: z.boolean().optional(),
  responseMs: z.number().optional(),
});

/**
 * Exam practice submit: logs the attempt without touching SRS state.
 * Streak and ease stay owned by /api/review/submit.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  try {
    const data = schema.parse(await req.json());
    const progress = await prisma.cardProgress.findFirst({
      where: { id: data.progressId, userId: session.user.id },
      include: { card: true },
    });

    if (!progress) {
      return NextResponse.json({ error: "Carte introuvable" }, { status: 404 });
    }

    if (!(EXAM_CARD_KINDS as readonly string[]).includes(progress.card.kind)) {
      return NextResponse.json(
        { error: "Cette carte appartient a la revision, pas a l examen" },
        { status: 400 }
      );
    }

    const correct =
      data.correct ?? answersMatch(data.answer, progress.card.answer);
    const quality = correct ? "MEDIUM" : "HARD";

    await prisma.reviewLog.create({
      data: {
        userId: session.user.id,
        cardId: progress.cardId,
        quality,
        correct,
        responseMs: data.responseMs,
        pointsEarned: 0,
        mode: "EXAM",
      },
    });

    return NextResponse.json({
      correct,
      expected: progress.card.answer,
      points: 0,
      mode: "EXAM",
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Donnees invalides" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
