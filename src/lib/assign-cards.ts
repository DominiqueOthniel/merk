import { prisma } from "@/lib/db";
import { EXAM_CARD_KINDS } from "@/lib/content/exam-catalog";
import {
  examSourcePrefix,
  normalizeExamProvider,
  type ExamProvider,
} from "@/lib/exam-provider";
import type { CefrLevel } from "@/lib/types";

/** Assigne les cartes CLOZE (+ examen du provider) pour la plage de niveaux. */
export async function assignReviewCards(opts: {
  userId: string;
  levels: CefrLevel[];
  provider?: ExamProvider | string | null;
  now?: Date;
}): Promise<number> {
  const now = opts.now ?? new Date();
  const provider = normalizeExamProvider(opts.provider);
  const prefix = examSourcePrefix(provider);
  const levels = opts.levels.length ? opts.levels : (["A1"] as CefrLevel[]);

  const cards = await prisma.card.findMany({
    where: {
      language: "de",
      level: { in: levels },
      OR: [
        { kind: "CLOZE" },
        {
          kind: { in: [...EXAM_CARD_KINDS] },
          sourceRef: { startsWith: prefix },
        },
      ],
    },
    select: { id: true },
  });

  for (const card of cards) {
    await prisma.cardProgress.upsert({
      where: {
        userId_cardId: { userId: opts.userId, cardId: card.id },
      },
      create: {
        userId: opts.userId,
        cardId: card.id,
        nextReviewAt: now,
      },
      update: {},
    });
  }

  return cards.length;
}
