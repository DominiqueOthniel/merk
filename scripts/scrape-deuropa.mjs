import fs from "node:fs";
import path from "node:path";

const OUT_RAW = path.join(process.cwd(), "scripts", "deuropa-raw.json");
const OUT_SEED = path.join(process.cwd(), "src", "lib", "content", "exam-telc-b1.ts");
const INDEX = "https://deuropa.app/indexb1";

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

function extractMatchingQuiz(html, meta) {
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

  // Alternate attribute order
  if (pairs.length === 0) {
    const altRe =
      /<div[^>]*data-correct="([^"]+)"[^>]*class="[^"]*question-box[^"]*"[^>]*>[\s\S]*?<div[^>]*class="[^"]*question-text[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    while ((m = altRe.exec(html))) {
      const title = decodeHtml(m[1]);
      const passage = decodeHtml(m[2]);
      if (title && passage.length > 30) pairs.push({ passage, title });
    }
  }

  const skill = /Sprachbausteine/i.test(meta.section)
    ? "sprachbausteine"
    : /Hören|Hoeren|Horen/i.test(meta.section)
      ? "horen"
      : "lesen";

  return {
    sourceId: String(meta.sourceId),
    sourceTitle: meta.title,
    section: meta.section,
    skill,
    level: "B1",
    exam: "TELC",
    options: [...new Set(options.length ? options : pairs.map((p) => p.title))],
    pairs,
  };
}

function toTsModule(exercises) {
  const body = JSON.stringify(exercises, null, 2);
  return `/* Auto-imported TELC B1 practice content adapted from public Deuropa exercises. */
export type ExamPair = { passage: string; title: string };

export type ExamExercise = {
  sourceId: string;
  sourceTitle: string;
  section: string;
  skill: "lesen" | "sprachbausteine" | "horen";
  level: string;
  exam: string;
  options: string[];
  pairs: ExamPair[];
};

export const EXAM_TELC_B1: ExamExercise[] = ${body} as ExamExercise[];
`;
}

async function main() {
  console.log("Fetching catalog...");
  const catalog = extractCatalog(await fetchText(INDEX));
  console.log(`Catalog: ${catalog.length}`);

  const lesen1 = catalog.filter((c) => /Lesen Teil 1/i.test(c.section));
  const sprach1 = catalog.filter((c) => /Sprachbausteine Teil 1/i.test(c.section));
  const selected = [...lesen1.slice(0, 15), ...sprach1.slice(0, 10)];

  const quizzes = [];
  for (const item of selected) {
    try {
      const html = await fetchText(item.url);
      const parsed = extractMatchingQuiz(html, item);
      if (parsed.pairs.length === 0) {
        console.warn(`SKIP empty ${item.sourceId} ${item.title}`);
        continue;
      }
      quizzes.push(parsed);
      console.log(
        `OK ${item.sourceId} ${item.section} ${item.title} pairs=${parsed.pairs.length} opts=${parsed.options.length}`
      );
      await new Promise((r) => setTimeout(r, 150));
    } catch (e) {
      console.warn(`FAIL ${item.url}`, e.message);
    }
  }

  fs.writeFileSync(
    OUT_RAW,
    JSON.stringify({ scrapedAt: new Date().toISOString(), catalog, quizzes }, null, 2),
    "utf8"
  );
  fs.writeFileSync(OUT_SEED, toTsModule(quizzes), "utf8");
  console.log(`Wrote ${quizzes.length} exercises to ${OUT_SEED}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
