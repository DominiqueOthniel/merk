import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureGoetheCards } from "@/lib/content/ensure-goethe-cards";
import {
  examProviderLabel,
  examSourcePrefix,
  normalizeExamProvider,
} from "@/lib/exam-provider";

const schema = z.object({
  examProvider: z.enum(["TELC", "GOETHE"]),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  try {
    const body = schema.parse(await req.json());
    const examProvider = normalizeExamProvider(body.examProvider);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { examProvider },
    });

    if (examProvider === "GOETHE") {
      await ensureGoetheCards();
    }

    // Assigne les cartes examen du provider si manquantes
    const prefix = examSourcePrefix(examProvider);
    const cards = await prisma.card.findMany({
      where: { sourceRef: { startsWith: prefix } },
      select: { id: true },
    });
    const now = new Date();
    if (cards.length) {
      await prisma.cardProgress.createMany({
        data: cards.map((card) => ({
          userId: session.user.id,
          cardId: card.id,
          nextReviewAt: now,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      examProvider,
      examLabel: examProviderLabel(examProvider),
    });
  } catch {
    return NextResponse.json({ error: "Donnees invalides" }, { status: 400 });
  }
}
