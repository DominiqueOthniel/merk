/**
 * Audit CLOZE prompts with more than one blank (___).
 * Usage: npx tsx scripts/audit-multi-cloze.ts
 */
import { CARDS_DE } from "../src/lib/content/cards-de";

type Hit = {
  source: string;
  level: string;
  blanks: number;
  prompt: string;
};

const hits: Hit[] = [];

for (const [idx, card] of CARDS_DE.entries()) {
  const blanks = (card.prompt.match(/___/g) ?? []).length;
  if (blanks !== 1) {
    hits.push({
      source: `cloze:${card.themeSlug}:${idx}`,
      level: card.level,
      blanks,
      prompt: card.prompt,
    });
  }
}

console.log(`Cartes CLOZE seed: ${CARDS_DE.length}`);
console.log(`Multi-lacunes ou zero lacune: ${hits.length}`);
for (const hit of hits) {
  console.log(
    `- [${hit.level}] ${hit.source} (${hit.blanks} lacunes) ${hit.prompt}`
  );
}

if (hits.length === 0) {
  console.log("OK: chaque carte seed a exactement une lacune.");
  process.exit(0);
}

process.exit(1);
