/**
 * Ajoute des series Sprechen originales MERK pour TELC B1/B2
 * et migre toute section Sprechen existante vers skill/format SPEAK.
 */
import fs from "fs";
import path from "path";

const outDir = path.join(process.cwd(), "content", "exam");

function speak(level, sourceId, title, passage, prompt) {
  return {
    sourceId,
    sourceTitle: title,
    section: "Sprechen",
    skill: "sprechen",
    level,
    exam: "TELC",
    format: "SPEAK",
    options: [],
    pairs: [],
    passage,
    gaps: [
      {
        n: 1,
        answer: "done",
        choices: ["done"],
        prompt:
          prompt ||
          "Prepare tes notes, enregistre-toi, puis marque comme pret.",
      },
    ],
    audioUrl: null,
  };
}

const b1Speak = [
  speak(
    "B1",
    "t-b1-s-01",
    "Sich vorstellen",
    "Teil 1 (ca. 2 Minuten):\n\nStellen Sie sich vor: Name, Herkunft, Wohnort, Beruf oder Studium, Hobbys und warum Sie Deutsch lernen. Sprechen Sie frei. Notizen als Stichpunkte sind erlaubt.",
  ),
  speak(
    "B1",
    "t-b1-s-02",
    "Alltagssituation",
    "Teil 2 (ca. 2 Minuten):\n\nSituation: Sie sind in einem Cafe. Bestellen Sie etwas, fragen Sie nach WLAN und nach einer Empfehlung fur das Mittagessen. Reagieren Sie freundlich auf die Antworten.",
  ),
  speak(
    "B1",
    "t-b1-s-03",
    "Wochenende planen",
    "Teil 3 (ca. 2 Minuten):\n\nPlanen Sie mit einer Freundin / einem Freund den Samstag: Museum oder Park, Mittagessen, Uhrzeiten. Machen Sie Vorschlage und Kompromisse.",
  ),
];

const b2Speak = [
  speak(
    "B2",
    "t-b2-s-01",
    "Kurzprasentation Medien",
    "Teil 1 (ca. 3 Minuten):\n\nBereiten Sie eine kurze Prasentation vor: \"Social Media im Alltag\". Struktur: Einleitung, 2 Argumente mit Beispiel, kurzer Schluss. Sprechen Sie zusammenhangend.",
  ),
  speak(
    "B2",
    "t-b2-s-02",
    "Diskussion Mobilitat",
    "Teil 2 (ca. 3 Minuten):\n\nDiskutieren Sie: Soll die Innenstadt autofrei werden? Nennen Sie Pro und Contra, Ihre Meinung und einen Kompromissvorschlag.",
  ),
  speak(
    "B2",
    "t-b2-s-03",
    "Meinung Arbeit und Homeoffice",
    "Teil 3 (ca. 3 Minuten):\n\nNehmen Sie Stellung: Homeoffice fur alle? Begrunden Sie mit mindestens zwei Argumenten und einem konkreten Beispiel aus Studium oder Beruf.",
  ),
];

function migrateSpeak(exercises) {
  return exercises.map((e) => {
    if (e.section !== "Sprechen" && !/Sprechen/i.test(e.section || "")) {
      return e;
    }
    return {
      ...e,
      skill: "sprechen",
      format: "SPEAK",
      gaps: (e.gaps || []).map((g) => ({
        ...g,
        prompt:
          g.prompt?.includes("enregistre") || g.prompt?.includes("notes")
            ? g.prompt
            : "Prepare tes notes, enregistre-toi, puis marque comme pret.",
      })),
    };
  });
}

function upsertBySourceId(existing, extras) {
  const map = new Map(existing.map((e) => [e.sourceId, e]));
  for (const ex of extras) map.set(ex.sourceId, ex);
  return [...map.values()];
}

for (const file of ["goethe-b1.json", "goethe-b2.json", "goethe-c1.json", "telc-c1.json"]) {
  const p = path.join(outDir, file);
  const data = migrateSpeak(JSON.parse(fs.readFileSync(p, "utf8")));
  fs.writeFileSync(p, JSON.stringify(data));
  console.log("migrated", file, data.filter((e) => e.format === "SPEAK").length);
}

for (const [file, extras] of [
  ["telc-b1.json", b1Speak],
  ["telc-b2.json", b2Speak],
]) {
  const p = path.join(outDir, file);
  const data = upsertBySourceId(
    migrateSpeak(JSON.parse(fs.readFileSync(p, "utf8"))),
    extras,
  );
  fs.writeFileSync(p, JSON.stringify(data));
  console.log(
    "updated",
    file,
    "speak",
    data.filter((e) => e.format === "SPEAK").length,
    "total",
    data.length,
  );
}
