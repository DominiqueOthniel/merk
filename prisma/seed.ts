import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { THEMES } from "../src/lib/content/themes";
import { CARDS_DE } from "../src/lib/content/cards-de";
import { EXAM_ALL } from "../src/lib/content/exam-catalog";
import type { CefrLevel } from "../src/lib/types";

const prisma = new PrismaClient();

async function main() {
  await prisma.reviewLog.deleteMany();
  await prisma.cardProgress.deleteMany();
  await prisma.prepScore.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.card.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cohorte.deleteMany();
  await prisma.centre.deleteMany();

  const centre = await prisma.centre.create({
    data: {
      name: "Akademie Berlin Demo",
      languages: "de",
    },
  });

  const nextSession = new Date();
  nextSession.setDate(nextSession.getDate() + 2);
  nextSession.setHours(18, 0, 0, 0);

  const cohorte = await prisma.cohorte.create({
    data: {
      name: "B1 Abendgruppe",
      centreId: centre.id,
      nextSessionAt: nextSession,
    },
  });

  const passwordHash = await bcrypt.hash("merk1234", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@merk.demo",
      passwordHash,
      name: "Admin Centre",
      role: "CENTER_ADMIN",
      centreId: centre.id,
      language: "de",
    },
  });

  const student = await prisma.user.create({
    data: {
      email: "eleve@merk.demo",
      passwordHash,
      name: "Lea Martin",
      role: "STUDENT",
      centreId: centre.id,
      cohorteId: cohorte.id,
      language: "de",
      cefrLevel: "B1",
      placedAt: new Date(),
      streakDays: 3,
      lastReviewDay: null,
      totalPoints: 120,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: "eleve2@merk.demo",
      passwordHash,
      name: "Jonas Weber",
      role: "STUDENT",
      centreId: centre.id,
      cohorteId: cohorte.id,
      language: "de",
      cefrLevel: "B1",
      placedAt: new Date(),
      streakDays: 1,
      totalPoints: 80,
    },
  });

  const themeMap = new Map<string, string>();
  for (const t of THEMES) {
    const theme = await prisma.theme.create({
      data: {
        slug: t.slug,
        nameFr: t.nameFr,
        nameDe: t.nameDe,
        sortOrder: t.sortOrder,
      },
    });
    themeMap.set(t.slug, theme.id);
  }

  const createdCards = [];
  for (const c of CARDS_DE) {
    const themeId = themeMap.get(c.themeSlug);
    if (!themeId) continue;
    const card = await prisma.card.create({
      data: {
        themeId,
        language: "de",
        level: c.level,
        kind: "CLOZE",
        prompt: c.prompt,
        answer: c.answer,
        context: c.context,
        hint: c.hint,
      },
    });
    createdCards.push(card);
  }

  const examThemeByLevel: Record<string, string | undefined> = {
    B1: themeMap.get("examen-telc-b1"),
    B2: themeMap.get("examen-telc-b2"),
  };
  let examCardCount = 0;
  for (const exercise of EXAM_ALL) {
    const examThemeId = examThemeByLevel[exercise.level];
    if (!examThemeId) continue;

    if (exercise.format === "MATCH") {
      for (const [idx, pair] of exercise.pairs.entries()) {
        const card = await prisma.card.create({
          data: {
            themeId: examThemeId,
            language: "de",
            level: exercise.level,
            kind: "MATCH",
            prompt: "Quel titre correspond a ce texte ?",
            answer: pair.title,
            context: pair.passage,
            hint: `${exercise.section} · ${exercise.sourceTitle}`,
            options: JSON.stringify(exercise.options),
            sourceRef: `deuropa:${exercise.sourceId}:${idx}`,
          },
        });
        createdCards.push(card);
        examCardCount += 1;
      }
      continue;
    }

    for (const gap of exercise.gaps ?? []) {
      const kind = exercise.format === "CLOZE_BANK" ? "CLOZE_BANK" : "CLOZE_MCQ";
      const card = await prisma.card.create({
        data: {
          themeId: examThemeId,
          language: "de",
          level: exercise.level,
          kind,
          prompt: `Complete la lacune ${gap.n}`,
          answer: gap.answer,
          context: exercise.passage ?? "",
          hint: `${exercise.section} · ${exercise.sourceTitle} · #${gap.n}`,
          options: JSON.stringify(gap.choices),
          sourceRef: `deuropa:${exercise.sourceId}:${gap.n}`,
        },
      });
      createdCards.push(card);
      examCardCount += 1;
    }
  }

  const levelsForStudent: CefrLevel[] = ["A1", "A2", "B1", "B2"];
  const assignable = createdCards.filter((c) =>
    levelsForStudent.includes(c.level as CefrLevel)
  );

  const now = new Date();
  for (const user of [student, student2]) {
    for (let i = 0; i < assignable.length; i++) {
      const card = assignable[i];
      const examKind =
        card.kind === "MATCH" ||
        card.kind === "CLOZE_MCQ" ||
        card.kind === "CLOZE_BANK";
      const dueSoon = examKind ? i % 4 === 0 : i < 12;
      const next = new Date(now);
      if (!dueSoon) next.setDate(next.getDate() + 2 + (i % 5));
      await prisma.cardProgress.create({
        data: {
          userId: user.id,
          cardId: card.id,
          easeFactor: 2.5,
          intervalDays: dueSoon ? 0 : 3,
          repetitions: dueSoon ? 0 : 1,
          nextReviewAt: next,
        },
      });
    }
  }

  const startsAt = new Date();
  startsAt.setHours(0, 0, 0, 0);
  const endsAt = new Date(startsAt);
  endsAt.setDate(endsAt.getDate() + 7);

  await prisma.challenge.create({
    data: {
      cohorteId: cohorte.id,
      title: "100 cartes completees en groupe",
      goalCards: 100,
      progress: 24,
      startsAt,
      endsAt,
    },
  });

  await prisma.prepScore.create({
    data: { userId: student.id, value: 62 },
  });

  console.log("Seed OK");
  console.log({
    centre: centre.name,
    admin: admin.email,
    student: student.email,
    student2: student2.email,
    password: "merk1234",
    cards: createdCards.length,
    examCards: examCardCount,
    examSets: EXAM_ALL.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
