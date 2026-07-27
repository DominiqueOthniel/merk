import fs from "node:fs";
const t = fs.readFileSync("scripts/sample-204.html", "utf8");
const i = t.indexOf('data-correct="Bildband');
console.log(t.slice(i - 100, i + 1200));
