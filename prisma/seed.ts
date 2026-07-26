import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { THEMES } from "../src/lib/content/themes";
import { CARDS_DE } from "../src/lib/content/cards-de";
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
      name: "A2 Abendgruppe",
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
      cefrLevel: "A2",
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
      cefrLevel: "A2",
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
        prompt: c.prompt,
        answer: c.answer,
        context: c.context,
        hint: c.hint,
      },
    });
    createdCards.push(card);
  }

  const levelsForStudent: CefrLevel[] = ["A1", "A2"];
  const assignable = createdCards.filter((c) =>
    levelsForStudent.includes(c.level as CefrLevel)
  );

  const now = new Date();
  for (const user of [student, student2]) {
    for (let i = 0; i < assignable.length; i++) {
      const card = assignable[i];
      const dueSoon = i < 12;
      const next = new Date(now);
      if (!dueSoon) next.setDate(next.getDate() + 3 + (i % 5));
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
