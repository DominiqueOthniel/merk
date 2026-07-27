import fs from "node:fs";

const t = fs.readFileSync("scripts/sample-204.html", "utf8");
const keys = ["answer", "correct", "draggable", "dropzone", "option", "passage", "quizData", "questions", "matching", "Drop here"];
for (const k of keys) {
  console.log(k, t.toLowerCase().indexOf(k.toLowerCase()));
}

const scripts = [...t.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)]
  .map((m) => m[1])
  .filter((s) => s.length > 80);

console.log("scripts", scripts.length, scripts.map((s) => s.length));
for (const [i, s] of scripts.entries()) {
  console.log(`\n=== SCRIPT ${i} head ===\n`, s.slice(0, 2500));
}

// Extract visible content-ish blocks
const bodyMatch = t.match(/<body[^>]*>([\s\S]*)<\/body>/i);
if (bodyMatch) {
  const body = bodyMatch[1].replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "");
  const texts = [...body.matchAll(/>([^<]{20,})</g)].map((m) => m[1].replace(/\s+/g, " ").trim()).filter(Boolean);
  console.log("\n=== TEXT SNIPPETS ===");
  console.log([...new Set(texts)].slice(0, 40).join("\n---\n"));
}
