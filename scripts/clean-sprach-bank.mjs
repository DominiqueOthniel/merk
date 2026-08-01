import fs from "node:fs";
import path from "node:path";

function cleanBank(list) {
  return [...new Set(list)].filter(
    (w) =>
      typeof w === "string" &&
      w.trim() &&
      !w.includes("${") &&
      !/droppedWord|wordText/i.test(w)
  );
}

function cleanFile(filePath) {
  let raw = fs.readFileSync(filePath, "utf8");
  const marker = "ExamExercise[] = ";
  const start = raw.indexOf(marker);
  if (start < 0) throw new Error(`Missing export marker in ${filePath}`);
  const arrayStart = start + marker.length;
  const castAt = raw.indexOf("] as ExamExercise[]", arrayStart);
  if (castAt < 0) throw new Error(`Missing cast footer in ${filePath}`);

  const header = raw.slice(0, arrayStart);
  const footer = raw.slice(castAt + 1); // keep "] as ExamExercise[];\n"
  const exercises = JSON.parse(raw.slice(arrayStart, castAt + 1));

  let touched = 0;
  for (const ex of exercises) {
    if (ex.format !== "CLOZE_BANK") continue;
    const before = JSON.stringify(ex.bank);
    ex.bank = cleanBank(ex.bank || []);
    ex.options = cleanBank(ex.options || ex.bank);
    for (const gap of ex.gaps || []) {
      gap.choices = cleanBank(gap.choices?.length ? gap.choices : ex.bank);
      if (!gap.choices.includes(gap.answer)) gap.choices.push(gap.answer);
    }
    if (JSON.stringify(ex.bank) !== before) touched += 1;
  }

  fs.writeFileSync(
    filePath,
    `${header}${JSON.stringify(exercises, null, 2)}${footer}`,
    "utf8"
  );
  console.log(`${path.basename(filePath)}: cleaned ${touched} CLOZE_BANK sets`);
}

for (const name of ["exam-telc-b1.ts", "exam-telc-b2.ts"]) {
  cleanFile(path.join(process.cwd(), "src", "lib", "content", name));
}
