"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ExamListenPlayer } from "@/components/exam/exam-listen-player";
import { ExamSpeakPanel } from "@/components/exam/exam-speak-panel";
import type { ExamFormat } from "@/lib/content/exam-types";

type Item = {
  progressId: string;
  cardId: string;
  kind: string;
  gapN: number | null;
  prompt?: string;
  passage: string;
  answer: string;
  options: string[];
  due: boolean;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderClozePassage(passage: string, activeGap: number | null) {
  const parts = passage.split(/(\{\{\d+\}\})/g);
  return parts.map((part, i) => {
    const m = part.match(/^\{\{(\d+)\}\}$/);
    if (!m) return <span key={i}>{part}</span>;
    const n = Number(m[1]);
    const active = activeGap === n;
    return (
      <span
        key={i}
        className={`mx-0.5 inline-flex min-w-[1.6rem] items-center justify-center rounded-md px-1.5 py-0.5 text-[0.92rem] font-semibold ${
          active
            ? "bg-[var(--forest)] text-white"
            : "bg-[rgba(26,107,72,0.12)] text-[var(--forest-deep)]"
        }`}
      >
        {n}
      </span>
    );
  });
}

function instructionFor(
  format: ExamFormat,
  section: string,
  options: string[] = []
) {
  if (format === "CLOZE_MCQ") return "Choisis la bonne forme pour la lacune active.";
  if (format === "CLOZE_BANK") return "Choisis le mot de la banque qui complete la lacune.";
  if (format === "READING_MCQ") return "Lis le texte puis reponds a la question.";
  if (format === "TF") {
    if (/Hören|Horen/i.test(section)) {
      return "Ecoute l audio, puis indique si l affirmation est richtig ou falsch.";
    }
    return options.includes("nicht im Text")
      ? "Indique richtig, falsch ou nicht im Text."
      : "Indique si l affirmation est richtig ou falsch.";
  }
  if (format === "SPEAK") {
    return "Prepare ta prise de parole, enregistre-toi, puis marque comme pret.";
  }
  if (format === "WRITE") {
    return "Redige selon la consigne, puis marque comme termine.";
  }
  if (/Teil 3/i.test(section)) return "Choisis la situation qui correspond a cette annonce.";
  return "Choisis le titre qui correspond au texte.";
}

function feedbackOk(format: ExamFormat) {
  if (format === "MATCH") return "Bonne association.";
  if (format === "SPEAK") return "Prise de parole enregistree.";
  if (format === "WRITE") return "Serie ecrite enregistree.";
  return "Bonne reponse.";
}

function feedbackBad(format: ExamFormat, answer: string) {
  if (format === "MATCH") return `Attendu : ${answer}`;
  if (format === "TF") return `Attendu : ${answer}`;
  return `Reponse attendue : ${answer}`;
}

function doneLabel(format: ExamFormat, score: { ok: number; total: number }) {
  if (score.total === 0) return "Aucun item dans cette serie.";
  if (format === "WRITE" || format === "SPEAK") return "Consigne traitee.";
  if (format === "MATCH") {
    return `${score.ok}/${score.total} associations correctes.`;
  }
  if (format === "TF" || format === "READING_MCQ") {
    return `${score.ok}/${score.total} reponses correctes.`;
  }
  return `${score.ok}/${score.total} lacunes correctement completees.`;
}

export function ExamSession({ sourceId }: { sourceId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [section, setSection] = useState("");
  const [level, setLevel] = useState("B1");
  const [examLabel, setExamLabel] = useState("TELC");
  const [format, setFormat] = useState<ExamFormat>("MATCH");
  const [sharedPassage, setSharedPassage] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [listenScript, setListenScript] = useState<string | null>(null);
  const [skill, setSkill] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [writeNote, setWriteNote] = useState("");
  const [phase, setPhase] = useState<"pick" | "feedback" | "done">("pick");
  const [correct, setCorrect] = useState(false);
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/exam/${encodeURIComponent(sourceId)}`)
      .then((r) => r.json())
      .then((data) => {
        setTitle(data.title ?? "");
        setSection(data.section ?? "");
        setLevel(data.level ?? "B1");
        setExamLabel(data.examLabel ?? "TELC");
        setFormat((data.format as ExamFormat) || "MATCH");
        setSkill(data.skill ?? "");
        setSharedPassage(data.passage ?? null);
        setAudioUrl(data.audioUrl ?? null);
        setListenScript(data.listenScript ?? null);
        setItems(data.items ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sourceId]);

  const current = items[index];
  const isCloze = format === "CLOZE_MCQ" || format === "CLOZE_BANK";
  const isReading = format === "READING_MCQ";
  const isTf = format === "TF";
  const isWrite = format === "WRITE";
  const isSpeak = format === "SPEAK" || skill === "sprechen";
  const isListen = skill === "horen" || /Hören|Horen/i.test(section);

  const choices = useMemo(() => {
    if (!current) return [];
    const real = current.options.filter(
      (w) => w && !w.includes("${") && !/droppedWord|wordText/i.test(w)
    );
    const pool = real.includes(current.answer)
      ? real
      : [...real, current.answer];
    if (isTf) {
      const tf = ["richtig", "falsch", "nicht im Text"].filter((x) =>
        pool.includes(x)
      );
      return tf.length ? tf : ["richtig", "falsch"];
    }
    if (format === "CLOZE_MCQ" || format === "CLOZE_BANK" || isReading) {
      return shuffle(pool);
    }
    return shuffle(pool).slice(0, Math.min(8, pool.length));
  }, [current, format, isReading, isTf]);

  async function confirmPick(forced?: string) {
    const value = forced ?? selected;
    if (!current || !value || !current.progressId || busy) return;
    setBusy(true);
    const isCorrect =
      format === "WRITE" || format === "SPEAK"
        ? true
        : value.trim() === current.answer.trim();
    setCorrect(isCorrect);
    setPhase("feedback");
    setScore((s) => ({ ok: s.ok + (isCorrect ? 1 : 0), total: s.total + 1 }));

    try {
      await fetch("/api/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progressId: current.progressId,
          answer: format === "WRITE" || format === "SPEAK" ? "done" : value,
          correct: isCorrect,
        }),
      });
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  function next() {
    if (index + 1 >= items.length) {
      setPhase("done");
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setWriteNote("");
    setPhase("pick");
  }

  if (loading) {
    return <p className="text-[1.05rem] text-[var(--ink-soft)]">Chargement de la serie...</p>;
  }

  if (!current || phase === "done") {
    return (
      <div className="panel fade-up">
        <p className="display text-[clamp(1.8rem,6vw,2.4rem)]">Serie terminee</p>
        <p className="mt-3 text-[1.1rem] text-[var(--ink-soft)]">
          {doneLabel(format, score)}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => router.push("/exam")}>Retour aux series</Button>
          <Button variant="secondary" onClick={() => router.push("/review")}>
            Revision du jour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 text-[0.98rem] text-[var(--ink-soft)]">
        <span className="font-semibold">
          {index + 1} / {items.length}
        </span>
        <span className="truncate">{section}</span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${(index / Math.max(1, items.length)) * 100}%` }}
        />
      </div>

      <div className="panel fade-up">
        <p className="eyebrow">{examLabel} {level} · {title}</p>
        <p className="mt-3 text-[1.02rem] font-semibold text-[var(--forest-deep)]">
          {instructionFor(format, section, current.options)}
        </p>

        {isListen && (audioUrl || listenScript) ? (
          <div className="mt-4">
            <ExamListenPlayer
              script={listenScript ?? ""}
              title={title}
              audioUrl={audioUrl}
              maxPlays={2}
            />
          </div>
        ) : null}

        {isSpeak ? (
          <div className="mt-5 space-y-4">
            {(sharedPassage || current.passage) && phase === "pick" ? (
              <div className="exam-passage">
                {sharedPassage || current.passage}
              </div>
            ) : null}
            {phase === "pick" ? (
              <ExamSpeakPanel
                title={title}
                level={level}
                sourceId={sourceId}
                prompt={sharedPassage || current.passage || title}
                notes={writeNote}
                onNotesChange={setWriteNote}
                onComplete={() => confirmPick("done")}
                busy={busy}
              />
            ) : null}
            {phase === "feedback" ? (
              <div className="fade-up-delay space-y-4">
                <div className="rounded-[1.3rem] bg-[var(--forest-soft)] px-4 py-3 text-[1.02rem] text-[var(--forest-deep)]">
                  {feedbackOk(format)}
                </div>
                <Button className="w-full" onClick={next} disabled={busy}>
                  Continuer
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-7">
            <div className="space-y-4">
              {!isListen &&
              (isCloze || isReading || isWrite || isTf) &&
              (sharedPassage || current.passage) ? (
                <div className="exam-passage">
                  {isCloze
                    ? renderClozePassage(current.passage, current.gapN)
                    : sharedPassage || current.passage}
                </div>
              ) : null}

              {!isListen && !isCloze && !isReading && !isWrite && !isTf ? (
                <div className="exam-passage">{current.passage}</div>
              ) : null}

              {(isReading || isTf) && current.prompt ? (
                <p className="rounded-[1.2rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[1.05rem] font-semibold">
                  {isListen
                    ? `Aussage ${index + 1} : ${current.prompt}`
                    : current.prompt}
                </p>
              ) : null}

              {isListen ? (
                <p className="text-[0.95rem] text-[var(--ink-faint)]">
                  Le texte audio n est pas affiche. Base-toi sur ce que tu as entendu.
                </p>
              ) : null}
            </div>

            <div>
              {phase === "pick" ? (
                <div className="space-y-2.5">
                  {isWrite ? (
                    <>
                      <textarea
                        value={writeNote}
                        onChange={(e) => setWriteNote(e.target.value)}
                        rows={10}
                        placeholder="Ecris ici ton brouillon (non corrige automatiquement)."
                        className="w-full rounded-[1.25rem] border border-[var(--line)] bg-white/90 px-4 py-3 text-[16px] leading-relaxed outline-none focus:border-[var(--forest)] focus:ring-4 focus:ring-[rgba(26,107,72,0.12)]"
                      />
                      <Button
                        className="mt-3 w-full"
                        disabled={busy || writeNote.trim().length < 40}
                        onClick={() => confirmPick("done")}
                      >
                        Marquer comme termine
                      </Button>
                    </>
                  ) : (
                    <>
                      <div
                        className={
                          format === "CLOZE_BANK" || isTf
                            ? "flex flex-wrap gap-2"
                            : "space-y-2.5"
                        }
                      >
                        {choices.map((choice) => {
                          const active = selected === choice;
                          const pill = format === "CLOZE_BANK" || isTf;
                          return (
                            <button
                              key={choice}
                              type="button"
                              onClick={() => setSelected(choice)}
                              className={
                                pill
                                  ? `rounded-full border px-3.5 py-2 text-[0.98rem] transition ${
                                      active
                                        ? "border-[var(--forest)] bg-[var(--forest)] text-white"
                                        : "border-[var(--line)] bg-white/90 text-[var(--ink)] hover:bg-[var(--forest-soft)]/50"
                                    }`
                                  : `w-full rounded-[1.2rem] border px-4 py-3.5 text-left text-[0.98rem] leading-snug transition ${
                                      active
                                        ? "border-[var(--forest)] bg-[var(--forest-soft)] text-[var(--forest-deep)]"
                                        : "border-[var(--line)] bg-white/90 hover:bg-[var(--forest-soft)]/50"
                                    }`
                              }
                            >
                              {choice}
                            </button>
                          );
                        })}
                      </div>
                      <Button
                        className="mt-3 w-full"
                        disabled={!selected || busy}
                        onClick={() => confirmPick()}
                      >
                        Valider
                      </Button>
                    </>
                  )}
                </div>
              ) : null}

              {phase === "feedback" ? (
                <div className="fade-up-delay space-y-4">
                  <div
                    className={`rounded-[1.3rem] px-4 py-3 text-[1.02rem] ${
                      correct
                        ? "bg-[var(--forest-soft)] text-[var(--forest-deep)]"
                        : "bg-rose-50 text-[var(--danger)]"
                    }`}
                  >
                    {correct
                      ? feedbackOk(format)
                      : feedbackBad(format, current.answer)}
                  </div>
                  <Button className="w-full" onClick={next} disabled={busy}>
                    Continuer
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
