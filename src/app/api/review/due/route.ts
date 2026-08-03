import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EXAM_CARD_KINDS } from "@/lib/content/exam-catalog";
import { buildReviewQueue, type QueueCardSelect } from "@/lib/srs/queue";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  try {
    const now = new Date();
    const [rows, user] = await Promise.all([
      prisma.cardProgress.findMany({
        where: {
          userId: session.user.id,
          card: { kind: { notIn: [...EXAM_CARD_KINDS] } },
          OR: [
            {
              status: { in: ["LEARNING", "RELEARNING", "REVIEW"] },
              nextReviewAt: { lte: now },
            },
            { status: "NEW" },
          ],
        },
        select: {
          id: true,
          cardId: true,
          status: true,
          learningStep: true,
          lapses: true,
          easeFactor: true,
          intervalDays: true,
          repetitions: true,
          nextReviewAt: true,
          createdAt: true,
          card: {
            select: {
              prompt: true,
              context: true,
              hint: true,
              level: true,
              sourceRef: true,
              theme: { select: { nameFr: true } },
            },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { cefrLevel: true, targetLevel: true, examProvider: true },
      }),
    ]);

    const queue = buildReviewQueue(rows as QueueCardSelect[], now);

    return NextResponse.json({
      count: queue.cards.length,
      counts: queue.counts,
      caps: queue.caps,
      profile: {
        cefrLevel: user?.cefrLevel ?? null,
        targetLevel: user?.targetLevel ?? null,
        examProvider: user?.examProvider ?? "TELC",
      },
      cards: queue.cards,
    });
  } catch (e) {
    console.error("[review/due]", e);
    return NextResponse.json(
      {
        error: "Erreur serveur",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
