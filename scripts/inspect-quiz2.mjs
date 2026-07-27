import fs from "node:fs";

const t = fs.readFileSync("scripts/sample-204.html", "utf8");

// Find answer checking logic
const idx = t.indexOf("correct");
console.log(t.slice(idx - 200, idx + 800));

console.log("\n\n=== data attributes ===");
const dataAttrs = [...t.matchAll(/data-[a-zA-Z-]+="[^"]*"/g)].slice(0, 50);
console.log(dataAttrs.map((m) => m[0]).join("\n"));

console.log("\n\n=== draggable blocks ===");
const drags = [...t.matchAll(/<div[^>]*class="[^"]*draggable[^"]*"[^>]*>[\s\S]*?<\/div>/gi)];
console.log("count", drags.length);
console.log(drags.slice(0, 3).map((d) => d[0].slice(0, 300)).join("\n---\n"));

console.log("\n\n=== drop-target blocks ===");
const drops = [...t.matchAll(/<div[^>]*class="[^"]*drop-target[^"]*"[^>]*>[\s\S]*?<\/div>/gi)];
console.log("count", drops.length);
console.log(drops.slice(0, 2).map((d) => d[0].slice(0, 400)).join("\n---\n"));
