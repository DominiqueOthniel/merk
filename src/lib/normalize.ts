/** Normalize answers for tolerant comparison (accents, case, ß). */
export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/\s+/g, " ");
}

export function answersMatch(input: string, expected: string): boolean {
  const a = normalizeAnswer(input);
  const b = normalizeAnswer(expected);
  if (a === b) return true;
  const alts = expected.split("|").map((s) => normalizeAnswer(s));
  return alts.includes(a);
}
