import fs from "node:fs";
import path from "node:path";

const LEVELS = [
  {
    id: "B1",
    index: "https://deuropa.app/indexb1.html",
    out: "exam-telc-b1.ts",
    constName: "EXAM_TELC_B1",
  },
  {
    id: "B2",
    index: "https://deuropa.app/indexb2.html",
    out: "exam-telc-b2.ts",
    constName: "EXAM_TELC_B2",
  },
];

const LIMITS = {
  lesen1: 10,
  sprach1: 10,
  sprach2: 10,
};

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 MERK-content-import", Accept: "text/html" },
  });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.text();
}

function decodeHtml(s) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&uuml;/g, "ü")
    .replace(/&Uuml;/g, "Ü")
    .replace(/&auml;/g, "ä")
    .replace(/&Auml;/g, "Ä")
    .replace(/&ouml;/g, "ö")
    .replace(/&Ouml;/g, "Ö")
    .replace(/&szlig;/g, "ß")
    .replace(/\{\{/g, "{{")
    .replace(/\}\}/g, "}}")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractCatalog(html) {
  const items = [];
  let section = "unknown";
  const re =
    /<h1[^>]*>([^<]+)<\/h1>|<a[^>]+href=["']([^"']*quiz\/\d+\.html?)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    if (m[1]) {
      section = decodeHtml(m[1]);
      continue;
    }
    const href = m[2].startsWith("http") ? m[2] : new URL(m[2], "https://deuropa.app/").href;
    items.push({
      section,
      title: decodeHtml(m[3]),
      url: href.replace(/\.html?$/, "") + ".html",
      sourceId: href.match(/quiz\/(\d+)/)?.[1] ?? null,
    });
  }
  return items;
}

function extractMatchingQuiz(html, meta, level) {
  const options = [...html.matchAll(/<div[^>]*class="[^"]*draggable[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)]
    .map((m) => decodeHtml(m[1]))
    .filter(Boolean);

  const pairs = [];
  const boxRe =
    /<div[^>]*class="[^"]*question-box[^"]*"[^>]*data-correct="([^"]+)"[^>]*>[\s\S]*?<div[^>]*class="[^"]*question-text[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  let m;
  while ((m = boxRe.exec(html))) {
    const title = decodeHtml(m[1]);
    const passage = decodeHtml(m[2]);
    if (title && passage.length > 30) pairs.push({ passage, title });
  }

  if (pairs.length === 0) {
    const altRe =
      /<div[^>]*data-correct="([^"]+)"[^>]*class="[^"]*question-box[^"]*"[^>]*>[\s\S]*?<div[^>]*class="[^"]*question-text[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    while ((m = altRe.exec(html))) {
      const title = decodeHtml(m[1]);
      const passage = decodeHtml(m[2]);
      if (title && passage.length > 30) pairs.push({ passage, title });
    }
  }

  return {
    sourceId: String(meta.sourceId),
    sourceTitle: meta.title,
    section: meta.section,
    skill: "lesen",
    level,
    exam: "TELC",
    format: "MATCH",
    options: [...new Set(options.length ? options : pairs.map((p) => p.title))],
    pairs,
    gaps: [],
  };
}

function extractClozeMcq(html, meta, level) {
  const letterHtml =
    html.match(/<div class="letter">([\s\S]*?)<\/div>\s*<div class="choices">/)?.[1] || "";
  if (!letterHtml) return null;

  const marked = letterHtml.replace(
    /<span class="blank"[^>]*id="blank(\d+)"[^>]*>[\s\S]*?<\/span>/gi,
    "{{$1}}"
  );
  const passage = decodeHtml(marked);
  if (!passage.includes("{{")) return null;

  const answers = {};
  const ansBlock = html.match(/correctAnswers\s*=\s*\{([\s\S]*?)\}/);
  if (ansBlock) {
    for (const m of ansBlock[1].matchAll(/(\d+)\s*:\s*"([^"]+)"/g)) {
      answers[Number(m[1])] = m[2];
    }
  }

  const choicesByGap = new Map();
  const radioRe =
    /<input[^>]*type="radio"[^>]*(?:name="q(\d+)"[^>]*value="([^"]+)"|value="([^"]+)"[^>]*name="q(\d+)")[^>]*>/gi;
  let rm;
  while ((rm = radioRe.exec(html))) {
    const n = Number(rm[1] || rm[4]);
    const value = rm[2] || rm[3];
    if (!n || !value) continue;
    if (!choicesByGap.has(n)) choicesByGap.set(n, []);
    choicesByGap.get(n).push(value);
  }

  const gapNums = [
    ...new Set([...Object.keys(answers).map(Number), ...choicesByGap.keys()]),
  ].sort((a, b) => a - b);

  const gaps = [];
  for (const n of gapNums) {
    const choices = [...new Set(choicesByGap.get(n) || [])];
    const answer = answers[n];
    if (!answer || choices.length < 2) continue;
    if (!choices.includes(answer)) choices.push(answer);
    gaps.push({ n, answer, choices });
  }

  if (gaps.length === 0) return null;

  return {
    sourceId: String(meta.sourceId),
    sourceTitle: meta.title,
    section: meta.section,
    skill: "sprachbausteine",
    level,
    exam: "TELC",
    format: "CLOZE_MCQ",
    options: [],
    pairs: [],
    passage,
    gaps,
  };
}

function isRealWord(word) {
  return (
    typeof word === "string" &&
    word.trim().length > 0 &&
    !word.includes("${") &&
    !/droppedWord|wordText/i.test(word)
  );
}

function extractClozeBank(html, meta, level) {
  // Scripts contain template strings like data-word="${droppedWord}"; strip them first.
  const page = html.replace(/<script\b[\s\S]*?<\/script>/gi, " ");
  const quizText =
    page.match(/<div class="quiz-text">([\s\S]*?)<\/div>\s*<div class="word-bank-container">/)?.[1] ||
    page.match(/<div class="quiz-text">([\s\S]*?)<\/div>/)?.[1] ||
    "";
  if (!quizText.includes("data-answer")) return null;

  let gapN = 0;
  const gaps = [];
  const marked = quizText.replace(
    /<span class="blank"[^>]*data-answer="([^"]+)"[^>]*>[\s\S]*?<\/span>/gi,
    (_all, answer) => {
      gapN += 1;
      gaps.push({ n: gapN, answer, choices: [] });
      return `{{${gapN}}}`;
    }
  );
  const passage = decodeHtml(marked);
  if (gaps.length === 0) return null;

  const bankHtml =
    page.match(/<div class="word-bank">([\s\S]*?)<\/div>/)?.[1] ||
    page.match(/<div class="word-bank-container">([\s\S]*?)<\/div>/)?.[1] ||
    "";
  const bank = [
    ...new Set(
      [...bankHtml.matchAll(/data-word="([^"]+)"/gi)]
        .map((m) => m[1])
        .filter(isRealWord)
    ),
  ];
  if (bank.length === 0) {
    bank.push(...gaps.map((g) => g.answer).filter(isRealWord));
  }

  for (const gap of gaps) {
    gap.choices = bank.includes(gap.answer) ? bank : [...bank, gap.answer];
  }

  return {
    sourceId: String(meta.sourceId),
    sourceTitle: meta.title,
    section: meta.section,
    skill: "sprachbausteine",
    level,
    exam: "TELC",
    format: "CLOZE_BANK",
    options: bank,
    pairs: [],
    passage,
    bank,
    gaps,
  };
}

function toTsModule(exercises, constName, level) {
  const body = JSON.stringify(exercises, null, 2);
  return `/* Auto-imported TELC ${level} practice content adapted from public Deuropa exercises. */
import type { ExamExercise } from "./exam-types";

export const ${constName}: ExamExercise[] = ${body} as ExamExercise[];
`;
}

async function scrapeItems(items, level, parser, label) {
  const quizzes = [];
  for (const item of items) {
    try {
      const html = await fetchText(item.url);
      const parsed = parser(html, item, level);
      const count =
        parsed?.format === "MATCH" ? parsed.pairs?.length || 0 : parsed?.gaps?.length || 0;
      if (!parsed || count === 0) {
        console.warn(`SKIP empty ${label} ${item.sourceId} ${item.title}`);
        continue;
      }
      quizzes.push(parsed);
      console.log(`OK ${label} ${item.sourceId} ${item.title} items=${count}`);
      await new Promise((r) => setTimeout(r, 100));
    } catch (e) {
      console.warn(`FAIL ${item.url}`, e.message);
    }
  }
  return quizzes;
}

async function scrapeLevel(levelCfg) {
  console.log(`\n=== ${levelCfg.id} ===`);
  const catalog = extractCatalog(await fetchText(levelCfg.index));
  console.log(`Catalog: ${catalog.length}`);

  const lesen1 = catalog.filter((c) => /Lesen Teil 1/i.test(c.section)).slice(0, LIMITS.lesen1);
  const sprach1 = catalog
    .filter((c) => /Sprachbausteine Teil 1/i.test(c.section))
    .slice(0, LIMITS.sprach1);
  const sprach2 = catalog
    .filter((c) => /Sprachbausteine Teil 2/i.test(c.section))
    .slice(0, LIMITS.sprach2);

  const quizzes = [
    ...(await scrapeItems(lesen1, levelCfg.id, extractMatchingQuiz, "Lesen1")),
    ...(await scrapeItems(sprach1, levelCfg.id, extractClozeMcq, "Sprach1")),
    ...(await scrapeItems(sprach2, levelCfg.id, extractClozeBank, "Sprach2")),
  ];

  const outPath = path.join(process.cwd(), "src", "lib", "content", levelCfg.out);
  fs.writeFileSync(outPath, toTsModule(quizzes, levelCfg.constName, levelCfg.id), "utf8");
  console.log(`Wrote ${quizzes.length} -> ${outPath}`);
  return quizzes.length;
}

async function main() {
  let total = 0;
  for (const level of LEVELS) {
    total += await scrapeLevel(level);
  }
  console.log(`\nDone. ${total} exercises total.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
