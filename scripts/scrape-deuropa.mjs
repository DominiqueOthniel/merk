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
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripScripts(html) {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, " ");
}

function isRealWord(word) {
  return (
    typeof word === "string" &&
    word.trim().length > 0 &&
    !word.includes("${") &&
    !/droppedWord|wordText|NO_CORRECT_ANSWER/i.test(word)
  );
}

function extractCatalog(html) {
  const items = [];
  const seen = new Set();
  let section = "unknown";
  const re =
    /<h1[^>]*>([^<]+)<\/h1>|<a[^>]+href=["']([^"']*(?:quiz|quizz)\/[^"']+\.html?)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    if (m[1]) {
      section = decodeHtml(m[1]);
      continue;
    }
    const href = m[2].startsWith("http") ? m[2] : new URL(m[2], "https://deuropa.app/").href;
    const url = href.replace(/\.html?$/i, "") + ".html";
    const sourceId = url.match(/\/(?:quiz|quizz)\/([^/?#]+)\.html/i)?.[1] ?? null;
    if (!sourceId || seen.has(sourceId)) continue;
    seen.add(sourceId);
    items.push({
      section,
      title: decodeHtml(m[3]) || sourceId,
      url,
      sourceId,
    });
  }
  return items;
}

function baseExercise(meta, level, skill, format) {
  return {
    sourceId: String(meta.sourceId),
    sourceTitle: meta.title,
    section: meta.section,
    skill,
    level,
    exam: "TELC",
    format,
    options: [],
    pairs: [],
    gaps: [],
  };
}

function extractMatchingQuiz(html, meta, level) {
  const page = stripScripts(html);
  const options = [...page.matchAll(/<(?:div|span)[^>]*class="[^"]*draggable[^"]*"[^>]*>([\s\S]*?)<\/(?:div|span)>/gi)]
    .map((m) => decodeHtml(m[1]))
    .filter(isRealWord);

  const pairs = [];
  const boxRe =
    /<div[^>]*class="[^"]*question-box[^"]*"[^>]*data-correct="([^"]*)"[^>]*>[\s\S]*?<div[^>]*class="[^"]*question-text[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  let m;
  while ((m = boxRe.exec(page))) {
    const title = decodeHtml(m[1]);
    const passage = decodeHtml(m[2]);
    if (!isRealWord(title) || /NO_CORRECT_ANSWER/i.test(m[1])) continue;
    if (passage.length < 20) continue;
    pairs.push({ passage, title });
  }

  if (pairs.length === 0) return null;
  const ex = baseExercise(meta, level, "lesen", "MATCH");
  ex.options = [...new Set(options.length ? options : pairs.map((p) => p.title))];
  ex.pairs = pairs;
  return ex;
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
    for (const am of ansBlock[1].matchAll(/(\d+)\s*:\s*"([^"]+)"/g)) {
      answers[Number(am[1])] = am[2];
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

  const gaps = [];
  const gapNums = [
    ...new Set([...Object.keys(answers).map(Number), ...choicesByGap.keys()]),
  ].sort((a, b) => a - b);
  for (const n of gapNums) {
    const choices = [...new Set(choicesByGap.get(n) || [])];
    const answer = answers[n];
    if (!answer || choices.length < 2) continue;
    if (!choices.includes(answer)) choices.push(answer);
    gaps.push({ n, answer, choices });
  }
  if (!gaps.length) return null;

  const ex = baseExercise(meta, level, "sprachbausteine", "CLOZE_MCQ");
  ex.passage = passage;
  ex.gaps = gaps;
  return ex;
}

function extractClozeBank(html, meta, level) {
  const page = stripScripts(html);
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
  if (!gaps.length) return null;

  const bankHtml =
    page.match(/<div class="word-bank">([\s\S]*?)<\/div>/)?.[1] ||
    page.match(/<div class="word-bank-container">([\s\S]*?)<\/div>/)?.[1] ||
    "";
  const bank = [
    ...new Set(
      [...bankHtml.matchAll(/data-word="([^"]+)"/gi)].map((x) => x[1]).filter(isRealWord)
    ),
  ];
  if (!bank.length) bank.push(...gaps.map((g) => g.answer).filter(isRealWord));
  for (const gap of gaps) {
    gap.choices = bank.includes(gap.answer) ? bank : [...bank, gap.answer];
  }

  const ex = baseExercise(meta, level, "sprachbausteine", "CLOZE_BANK");
  ex.passage = passage;
  ex.bank = bank;
  ex.options = bank;
  ex.gaps = gaps;
  return ex;
}

function extractReadingMcq(html, meta, level) {
  const open = html.indexOf('<div class="text-section">');
  const quiz = html.indexOf('<div class="quiz-section">');
  let textHtml = "";
  if (open >= 0 && quiz > open) {
    textHtml = html
      .slice(open + '<div class="text-section">'.length, quiz)
      .replace(/<\/div>\s*$/i, "");
  }
  const passage = decodeHtml(textHtml);
  if (passage.length < 80) return null;

  const answers = {};
  const ansBlock = html.match(/(?:const|let|var)\s+answers\s*=\s*\{([\s\S]*?)\}/);
  if (ansBlock) {
    for (const am of ansBlock[1].matchAll(/q(\d+)\s*:\s*"([^"]+)"/g)) {
      answers[Number(am[1])] = am[2];
    }
  }
  if (!Object.keys(answers).length) return null;

  const gaps = [];
  const cardRe = /<div class="question-card">([\s\S]*?)<\/div>/gi;
  let cm;
  while ((cm = cardRe.exec(html))) {
    const block = cm[1];
    const nMatch = block.match(/name="q(\d+)"/i);
    if (!nMatch) continue;
    const n = Number(nMatch[1]);
    const prompt = decodeHtml(block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1] || `Frage ${n}`);
    const choiceMap = new Map();
    const labelRe =
      /<label[^>]*>\s*<input[^>]*value="([^"]+)"[^>]*>\s*([\s\S]*?)<\/label>/gi;
    let lm;
    while ((lm = labelRe.exec(block))) {
      choiceMap.set(lm[1], decodeHtml(lm[2]));
    }
    const letter = answers[n];
    const answerText = choiceMap.get(letter);
    if (!answerText) continue;
    const choices = [...choiceMap.values()].filter(Boolean);
    if (choices.length < 2) continue;
    gaps.push({ n, answer: answerText, choices, prompt });
  }
  if (!gaps.length) return null;

  const ex = baseExercise(meta, level, "lesen", "READING_MCQ");
  ex.passage = passage;
  ex.gaps = gaps;
  return ex;
}

function extractHorenBundles(html, meta, level) {
  const answers = {};
  const ansBlock = html.match(/correctAnswers\s*=\s*\{([\s\S]*?)\}/);
  if (ansBlock) {
    for (const am of ansBlock[1].matchAll(/q(\d+)_(\d+)\s*:\s*"([^"]+)"/g)) {
      answers[`${am[1]}_${am[2]}`] = am[3];
    }
  }
  if (!Object.keys(answers).length) return [];

  const containers = [
    ...html.matchAll(
      /<div class="quiz-container"[^>]*id="quiz(\d+)"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="quiz-container"|<script|$)/gi
    ),
  ];
  const out = [];

  for (const cm of containers) {
    const quizNum = cm[1];
    const block = cm[2];
    const title =
      decodeHtml(block.match(/<span class="audio-label">([\s\S]*?)<\/span>/i)?.[1] || "") ||
      decodeHtml(block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1] || "") ||
      `${meta.title} · Teil ${quizNum}`;
    const audioRel = block.match(/<source[^>]+src=["']([^"']+)["']/i)?.[1] || null;
    const audioUrl = audioRel
      ? new URL(audioRel, meta.url).href
      : null;

    const gaps = [];
    const rowRe =
      /<tr>\s*<td><input[^>]*name="q(\d+)_(\d+)"[^>]*value="richtig"[\s\S]*?<td>([\s\S]*?)<\/td>\s*<\/tr>/gi;
    let rm;
    while ((rm = rowRe.exec(block))) {
      if (String(rm[1]) !== String(quizNum)) continue;
      const n = Number(rm[2]);
      const statement = decodeHtml(rm[3]).replace(/^\d+\.\s*/, "");
      const answer = answers[`${quizNum}_${n}`];
      if (!answer || !statement) continue;
      gaps.push({
        n,
        answer,
        choices: ["richtig", "falsch"],
        prompt: statement,
      });
    }

    if (!gaps.length) continue;
    out.push({
      ...baseExercise(
        {
          ...meta,
          sourceId: `${meta.sourceId}__${quizNum}`,
          title,
        },
        level,
        "horen",
        "TF"
      ),
      sourceTitle: title,
      section: /Türkei|Turkei|تركيا/i.test(meta.section) ? "Hören" : meta.section,
      passage: title,
      audioUrl,
      gaps,
    });
  }
  return out;
}

function extractSchreiben(html, meta, level) {
  const page = stripScripts(html);
  const open = page.indexOf('<div class="task-side">');
  const writeAt = page.search(/<div class="(?:write-side|editor|right-side)"/i);
  let promptHtml = "";
  if (open >= 0) {
    promptHtml =
      writeAt > open
        ? page.slice(open + '<div class="task-side">'.length, writeAt)
        : page.slice(open + '<div class="task-side">'.length);
  }
  if (!promptHtml) {
    promptHtml =
      page.match(/<div class="ad-full">([\s\S]*?)<ul>([\s\S]*?)<\/ul>/i)?.[0] || "";
  }
  let passage = decodeHtml(promptHtml);
  passage = passage
    .replace(/SPEICHERN\s*&\s*ZURÜCK|Restzeit:|Home|LanguageTool|Text überprüfen/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (passage.length < 80) return null;
  if (passage.length > 2200) passage = `${passage.slice(0, 2200)}…`;

  const ex = baseExercise(meta, level, "schreiben", "WRITE");
  ex.section = "Schreiben";
  ex.passage = passage;
  ex.gaps = [
    {
      n: 1,
      answer: "done",
      choices: ["done"],
      prompt: "Redige ton texte selon la consigne, puis marque comme termine.",
    },
  ];
  return ex;
}

function parseBySection(html, meta, level) {
  const section = meta.section || "";
  if (/Schreiben/i.test(section)) {
    const one = extractSchreiben(html, meta, level);
    return one ? [one] : [];
  }
  if (/Hören|Horen|Türkei|Turkei/i.test(section)) {
    return extractHorenBundles(html, meta, level);
  }
  if (/Sprachbausteine Teil 1/i.test(section)) {
    const one = extractClozeMcq(html, meta, level);
    return one ? [one] : [];
  }
  if (/Sprachbausteine Teil 2/i.test(section)) {
    const one = extractClozeBank(html, meta, level);
    return one ? [one] : [];
  }
  if (/Lesen Teil 2/i.test(section)) {
    const one = extractReadingMcq(html, meta, level);
    return one ? [one] : [];
  }
  if (/Lesen Teil 1|Lesen Teil 3/i.test(section)) {
    const one = extractMatchingQuiz(html, meta, level);
    return one ? [one] : [];
  }
  return [];
}

function itemCount(ex) {
  if (ex.format === "MATCH") return ex.pairs?.length || 0;
  return ex.gaps?.length || 0;
}

function toTsModule(exercises, constName, level) {
  return `/* Auto-imported TELC ${level} practice content adapted from public Deuropa exercises. */
import type { ExamExercise } from "./exam-types";

export const ${constName}: ExamExercise[] = ${JSON.stringify(exercises, null, 2)} as ExamExercise[];
`;
}

function writeJson(exercises, levelId) {
  const dir = path.join(process.cwd(), "content", "exam");
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `telc-${levelId.toLowerCase()}.json`);
  fs.writeFileSync(out, JSON.stringify(exercises));
  return out;
}

function sectionOrder(section) {
  const order = [
    "Lesen Teil 1",
    "Lesen Teil 2",
    "Lesen Teil 3",
    "Sprachbausteine Teil 1",
    "Sprachbausteine Teil 2",
    "Hören",
    "Schreiben",
  ];
  const idx = order.findIndex((s) => section.startsWith(s) || section.includes(s));
  return idx === -1 ? 99 : idx;
}

async function scrapeLevel(levelCfg) {
  console.log(`\n=== ${levelCfg.id} ===`);
  const catalog = extractCatalog(await fetchText(levelCfg.index));
  console.log(`Catalog links: ${catalog.length}`);

  const quizzes = [];
  let ok = 0;
  let skip = 0;
  for (const item of catalog) {
    // Skip noisy non-core sections if needed; keep Türkei under Hören via parser.
    try {
      const html = await fetchText(item.url);
      const parsed = parseBySection(html, item, levelCfg.id);
      if (!parsed.length) {
        skip += 1;
        console.warn(`SKIP ${item.section} ${item.sourceId} ${item.title}`);
      } else {
        for (const ex of parsed) {
          if (itemCount(ex) === 0) continue;
          quizzes.push(ex);
          ok += 1;
          console.log(
            `OK ${ex.format} ${ex.sourceId} [${ex.section}] ${ex.sourceTitle} items=${itemCount(ex)}`
          );
        }
      }
      await new Promise((r) => setTimeout(r, 70));
    } catch (e) {
      skip += 1;
      console.warn(`FAIL ${item.url}`, e.message);
    }
  }

  quizzes.sort((a, b) => {
    const so = sectionOrder(a.section) - sectionOrder(b.section);
    if (so !== 0) return so;
    return String(a.sourceId).localeCompare(String(b.sourceId), "de", { numeric: true });
  });

  const jsonPath = writeJson(quizzes, levelCfg.id);
  console.log(
    `Wrote ${quizzes.length} exercises (ok=${ok}, skip=${skip}) -> ${jsonPath}`
  );
  return quizzes.length;
}

async function main() {
  let total = 0;
  for (const level of LEVELS) total += await scrapeLevel(level);
  console.log(`\nDone. ${total} exercises total.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
