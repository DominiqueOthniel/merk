import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const scrapePath = path.join(process.cwd(), "scripts", "scrape-deuropa.mjs");
const src = fs.readFileSync(scrapePath, "utf8");
const modPath = path.join(process.cwd(), "scripts", "_scrape-lib.mjs");
fs.writeFileSync(
  modPath,
  src.replace(/async function main\([\s\S]*$/m, "") +
    `
export {
  fetchText,
  extractCatalog,
  parseBySection,
  itemCount,
  sectionOrder,
  writeJson,
};
`
);

const {
  fetchText,
  extractCatalog,
  parseBySection,
  itemCount,
  sectionOrder,
  writeJson,
} = await import(pathToFileURL(modPath).href);

function loadJson(levelId) {
  const file = path.join(
    process.cwd(),
    "content",
    "exam",
    `telc-${levelId.toLowerCase()}.json`
  );
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const LEVELS = [
  { id: "B1", index: "https://deuropa.app/indexb1.html" },
  { id: "B2", index: "https://deuropa.app/indexb2.html" },
];

for (const levelCfg of LEVELS) {
  const existing = loadJson(levelCfg.id).filter(
    (e) => e.format !== "READING_MCQ" && e.format !== "WRITE" && e.section !== "Schreiben"
  );
  const catalog = extractCatalog(await fetchText(levelCfg.index)).filter(
    (c) => /Lesen Teil 2/i.test(c.section) || /Schreiben/i.test(c.section)
  );
  console.log(`\n${levelCfg.id} patch targets: ${catalog.length}`);
  const added = [];
  for (const item of catalog) {
    try {
      const html = await fetchText(item.url);
      const parsed = parseBySection(html, item, levelCfg.id);
      for (const ex of parsed) {
        if (itemCount(ex) === 0) continue;
        added.push(ex);
        console.log(`OK ${ex.format} ${ex.sourceId} ${ex.sourceTitle}`);
      }
      await new Promise((r) => setTimeout(r, 60));
    } catch (e) {
      console.warn("FAIL", item.url, e.message);
    }
  }
  const merged = [...existing, ...added].sort((a, b) => {
    const so = sectionOrder(a.section) - sectionOrder(b.section);
    if (so !== 0) return so;
    return String(a.sourceId).localeCompare(String(b.sourceId), "de", {
      numeric: true,
    });
  });
  const out = writeJson(merged, levelCfg.id);
  console.log(`Merged ${merged.length} (added ${added.length}) -> ${out}`);
}

fs.unlinkSync(modPath);
