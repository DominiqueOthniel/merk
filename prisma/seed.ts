import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { THEMES } from "../src/lib/content/themes";
import { CARDS_DE } from "../src/lib/content/cards-de";
import { getExamAll } from "../src/lib/content/exam-catalog";
import {
  examSourcePrefix,
  examThemeSlug,
  type ExamProvider,
} from "../src/lib/exam-provider";
import type { CefrLevel } from "../src/lib/types";

const prisma = new PrismaClient();

async function main() {
  const EXAM_ALL = [...getExamAll("TELC"), ...getExamAll("GOETHE")];
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
      examProvider: "TELC",
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
      examProvider: "GOETHE",
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
  for (const [idx, c] of CARDS_DE.entries()) {
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
        sourceRef: `cloze:${c.themeSlug}:${idx}`,
      },
    });
    createdCards.push(card);
  }

  const examRows: {
    themeId: string;
    language: string;
    level: string;
    kind: string;
    prompt: string;
    answer: string;
    context: string;
    hint: string;
    options: string;
    sourceRef: string;
  }[] = [];

  for (const exercise of EXAM_ALL) {
    const provider = (
      exercise.exam === "GOETHE" ? "GOETHE" : "TELC"
    ) as ExamProvider;
    const examThemeId = themeMap.get(examThemeSlug(provider, exercise.level));
    if (!examThemeId) continue;
    const prefix = examSourcePrefix(provider);

    if (exercise.format === "MATCH") {
      for (const [idx, pair] of exercise.pairs.entries()) {
        examRows.push({
          themeId: examThemeId,
          language: "de",
          level: exercise.level,
          kind: "MATCH",
          prompt: /Teil 3/i.test(exercise.section)
            ? "Quelle situation correspond a cette annonce ?"
            : "Quel titre correspond a ce texte ?",
          answer: pair.title,
          context: pair.passage,
          hint: `${exercise.section} · ${exercise.sourceTitle}`,
          options: JSON.stringify(exercise.options),
          sourceRef: `${prefix}${exercise.sourceId}:${idx}`,
        });
      }
      continue;
    }

    for (const gap of exercise.gaps ?? []) {
      const prompt =
        exercise.format === "READING_MCQ"
          ? gap.prompt || `Question ${gap.n}`
          : exercise.format === "TF"
            ? gap.prompt || `Aussage ${gap.n}`
            : exercise.format === "WRITE"
              ? gap.prompt || "Redige selon la consigne"
              : exercise.format === "SPEAK"
                ? gap.prompt ||
                  "Prepare tes notes, enregistre-toi, puis marque comme pret."
                : `Complete la lacune ${gap.n}`;
      const optionPayload =
        exercise.format === "CLOZE_BANK"
          ? exercise.bank?.length
            ? exercise.bank
            : exercise.options
          : gap.choices;
      examRows.push({
        themeId: examThemeId,
        language: "de",
        level: exercise.level,
        kind: exercise.format,
        prompt,
        answer: gap.answer,
        context: exercise.passage ?? "",
        hint: `${exercise.section} · ${exercise.sourceTitle} · #${gap.n}`,
        options: JSON.stringify(optionPayload),
        sourceRef: `${prefix}${exercise.sourceId}:${gap.n}`,
      });
    }
  }

  for (let i = 0; i < examRows.length; i += 200) {
    const chunk = examRows.slice(i, i + 200);
    await prisma.card.createMany({ data: chunk });
  }
  const examCardCount = examRows.length;
  const examCards = await prisma.card.findMany({
    where: {
      OR: [
        { sourceRef: { startsWith: "deuropa:" } },
        { sourceRef: { startsWith: "goethe:" } },
      ],
    },
    select: { id: true, kind: true, level: true },
  });
  createdCards.push(...examCards);

  const levelsForStudent: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1"];
  const assignable = createdCards.filter((c) =>
    levelsForStudent.includes(c.level as CefrLevel)
  );

  const now = new Date();
  const examKinds = new Set([
    "MATCH",
    "CLOZE_MCQ",
    "CLOZE_BANK",
    "READING_MCQ",
    "TF",
    "WRITE",
    "SPEAK",
  ]);
  const progressRows = [];
  for (const user of [student, student2]) {
    for (let i = 0; i < assignable.length; i++) {
      const card = assignable[i];
      const isExam = examKinds.has(card.kind);
      const dueSoon = isExam ? i % 5 === 0 : i < 12;
      const next = new Date(now);
      if (!dueSoon) next.setDate(next.getDate() + 2 + (i % 5));

      let status = "NEW";
      let repetitions = 0;
      let intervalDays = 0;
      let nextReviewAt = new Date("2099-01-01T00:00:00.000Z");

      if (isExam) {
        status = "REVIEW";
        repetitions = dueSoon ? 0 : 1;
        intervalDays = dueSoon ? 0 : 3;
        nextReviewAt = next;
      } else if (dueSoon) {
        // A few cards already in review for demo sessions
        status = "REVIEW";
        repetitions = 1;
        intervalDays = 0;
        nextReviewAt = now;
      } else if (i < 30) {
        status = "NEW";
      } else {
        status = "REVIEW";
        repetitions = 1;
        intervalDays = 3;
        nextReviewAt = next;
      }

      progressRows.push({
        userId: user.id,
        cardId: card.id,
        status,
        learningStep: 0,
        lapses: 0,
        easeFactor: 2.5,
        intervalDays,
        repetitions,
        nextReviewAt,
      });
    }
  }
  for (let i = 0; i < progressRows.length; i += 300) {
    await prisma.cardProgress.createMany({
      data: progressRows.slice(i, i + 300),
    });
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
