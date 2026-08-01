import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "content", "exam");
fs.mkdirSync(dir, { recursive: true });

for (const [tsName, jsonName] of [
  ["exam-telc-b1.ts", "telc-b1.json"],
  ["exam-telc-b2.ts", "telc-b2.json"],
]) {
  const raw = fs.readFileSync(
    path.join(process.cwd(), "src", "lib", "content", tsName),
    "utf8"
  );
  const marker = "ExamExercise[] = ";
  const start = raw.indexOf(marker) + marker.length;
  const castAt = raw.indexOf("] as ExamExercise[]", start);
  const data = JSON.parse(raw.slice(start, castAt + 1));
  const out = path.join(dir, jsonName);
  fs.writeFileSync(out, JSON.stringify(data));
  console.log(jsonName, data.length, "bytes", fs.statSync(out).size);
}
