import type { ExamExercise } from "./exam-types";

/** Construit un texte parle coherent avec les bonnes reponses richtig/falsch. */
export function buildListenScript(exercise: ExamExercise): string | null {
  if (exercise.skill !== "horen") return null;

  if (exercise.listenScript?.trim()) return exercise.listenScript.trim();

  const gaps = exercise.gaps ?? [];
  if (!gaps.length) {
    const title = exercise.sourceTitle?.trim();
    return title
      ? `Hortext zum Thema ${title}. Bitte horen Sie aufmerksam zu.`
      : null;
  }

  const lines: string[] = [
    `Hortext: ${exercise.sourceTitle || "Ubung"}.`,
  ];

  for (const gap of gaps) {
    const statement = (gap.prompt || "").trim();
    if (!statement) continue;
    const answer = (gap.answer || "").toLowerCase().trim();

    if (answer === "richtig") {
      lines.push(statement);
      continue;
    }

    if (answer === "falsch") {
      lines.push(negateGermanStatement(statement));
      continue;
    }

    // nicht im Text / autre : phrase neutre sans trancher
    lines.push(`Im Text wird dazu nichts Genaues gesagt.`);
  }

  lines.push("Ende des Hortexts.");
  return lines.join(" ");
}

function negateGermanStatement(statement: string): string {
  const s = statement.replace(/\s+/g, " ").trim();

  if (/^der zug nach hamburg hat verspatung/i.test(s)) {
    return "Der Zug nach Hamburg fahrt planmassig.";
  }
  if (/alle reisenden mussen den zug sofort verlassen/i.test(s)) {
    return "Bitte bleiben Sie ruhig. Sie mussen den Zug nicht verlassen.";
  }
  if (/die durchsage betrifft einen flug/i.test(s)) {
    return "Dies ist eine Bahndurchsage, kein Flug.";
  }
  if (/onlinekurse werden als nutzlos/i.test(s)) {
    return "Onlinekurse werden als hilfreich dargestellt.";
  }
  if (/nur studierende durfen kurse/i.test(s)) {
    return "Die Kurse stehen auch Berufstatigen offen.";
  }
  if (/der gast lehnt offentlichen verkehr ab/i.test(s)) {
    return "Der Gast empfiehlt den Offentlichen Verkehr.";
  }
  if (/der vortrag behandelt ausschliesslich flugverkehr/i.test(s)) {
    return "Der Vortrag behandelt vor allem die Stadtmobilitat.";
  }
  if (/offentlicher verkehr wird grundsatzlich abgelehnt/i.test(s)) {
    return "Offentlicher Verkehr wird als wichtige Losung genannt.";
  }
  if (/menschliche kontrolle gilt als entbehrlich/i.test(s)) {
    return "Menschliche Kontrolle bleibt unerlasslich.";
  }
  if (/man darf das medikament mit alkohol/i.test(s)) {
    return "Nehmen Sie das Medikament bitte nicht mit Alkohol ein.";
  }

  if (/^nicht\b/i.test(s) || /\bnicht\b/i.test(s)) {
    return s.replace(/\bnicht\b/i, "").replace(/\s+/g, " ").trim();
  }
  if (/^kein\b/i.test(s)) {
    return s.replace(/^kein\b/i, "ein");
  }
  if (/^keine\b/i.test(s)) {
    return s.replace(/^keine\b/i, "eine");
  }
  if (/^keinen\b/i.test(s)) {
    return s.replace(/^keinen\b/i, "einen");
  }

  return `Im Gegensatz dazu gilt: ${s.replace(/\.$/, "")} ist so nicht richtig.`;
}
