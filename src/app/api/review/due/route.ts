import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EXAM_CARD_KINDS } from "@/lib/content/exam-catalog";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const now = new Date();
  const [due, user] = await Promise.all([
    prisma.cardProgress.findMany({
      where: {
        userId: session.user.id,
        nextReviewAt: { lte: now },
        card: { kind: { notIn: [...EXAM_CARD_KINDS] } },
      },
      select: {
        id: true,
        cardId: true,
        card: {
          select: {
            prompt: true,
            context: true,
            hint: true,
            level: true,
            theme: { select: { nameFr: true } },
          },
        },
      },
      orderBy: { nextReviewAt: "asc" },
      take: 20,
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { cefrLevel: true, targetLevel: true, examProvider: true },
    }),
  ]);

  return NextResponse.json({
    count: due.length,
    profile: {
      cefrLevel: user?.cefrLevel ?? null,
      targetLevel: user?.targetLevel ?? null,
      examProvider: user?.examProvider ?? "TELC",
    },
    cards: due.map((p) => ({
      progressId: p.id,
      cardId: p.cardId,
      prompt: p.card.prompt,
      context: p.card.context,
      hint: p.card.hint,
      theme: p.card.theme.nameFr,
      level: p.card.level,
    })),
  });
}
