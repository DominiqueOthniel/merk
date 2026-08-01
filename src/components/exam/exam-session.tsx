"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type ExamFormat = "MATCH" | "CLOZE_MCQ" | "CLOZE_BANK";

type Item = {
  progressId: string;
  cardId: string;
  kind: string;
  gapN: number | null;
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

function instructionFor(format: ExamFormat) {
  if (format === "CLOZE_MCQ") return "Choisis la bonne forme pour la lacune active.";
  if (format === "CLOZE_BANK") return "Choisis le mot de la banque qui complete la lacune.";
  return "Choisis le titre qui correspond au texte.";
}

function feedbackOk(format: ExamFormat) {
  if (format === "MATCH") return "Bon titre.";
  return "Bonne reponse.";
}

function feedbackBad(format: ExamFormat, answer: string) {
  if (format === "MATCH") return `Titre attendu : ${answer}`;
  return `Reponse attendue : ${answer}`;
}

function doneLabel(format: ExamFormat, score: { ok: number; total: number }) {
  if (score.total === 0) return "Aucun item dans cette serie.";
  if (format === "MATCH") {
    return `${score.ok}/${score.total} titres correctement associes.`;
  }
  return `${score.ok}/${score.total} lacunes correctement completees.`;
}

export function ExamSession({ sourceId }: { sourceId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [section, setSection] = useState("");
  const [level, setLevel] = useState("B1");
  const [format, setFormat] = useState<ExamFormat>("MATCH");
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<"pick" | "feedback" | "done">("pick");
  const [correct, setCorrect] = useState(false);
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/exam/${sourceId}`)
      .then((r) => r.json())
      .then((data) => {
        setTitle(data.title ?? "");
        setSection(data.section ?? "");
        setLevel(data.level ?? "B1");
        setFormat((data.format as ExamFormat) || "MATCH");
        setItems(data.items ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sourceId]);

  const current = items[index];
  const isCloze = format === "CLOZE_MCQ" || format === "CLOZE_BANK";

  const choices = useMemo(() => {
    if (!current) return [];
    const real = current.options.filter(
      (w) => w && !w.includes("${") && !/droppedWord|wordText/i.test(w)
    );
    const pool = real.includes(current.answer)
      ? real
      : [...real, current.answer];
    if (format === "CLOZE_MCQ") return shuffle(pool);
    if (format === "CLOZE_BANK") return shuffle(pool);
    return shuffle(pool).slice(0, Math.min(8, pool.length));
  }, [current, format]);

  async function confirmPick() {
    if (!current || !selected || !current.progressId || busy) return;
    setBusy(true);
    const isCorrect = selected.trim() === current.answer.trim();
    setCorrect(isCorrect);
    setPhase("feedback");
    setScore((s) => ({ ok: s.ok + (isCorrect ? 1 : 0), total: s.total + 1 }));

    try {
      await fetch("/api/review/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progressId: current.progressId,
          answer: selected,
          quality: isCorrect ? "MEDIUM" : "HARD",
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
        <div className="mt-8 flex flex-col gap-3">
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
        <p className="eyebrow">TELC {level} · {title}</p>
        <p className="mt-3 text-[1.02rem] font-semibold text-[var(--forest-deep)]">
          {instructionFor(format)}
        </p>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-7">
          <div className="max-h-[42vh] overflow-y-auto rounded-[1.25rem] bg-[rgba(216,235,224,0.35)] p-4 text-[1.05rem] leading-relaxed lg:max-h-[min(68vh,36rem)] lg:p-5 lg:text-[1.08rem]">
            {isCloze
              ? renderClozePassage(current.passage, current.gapN)
              : current.passage}
          </div>

          <div>
            {phase === "pick" ? (
              <div className="space-y-2.5">
                <div
                  className={
                    format === "CLOZE_BANK"
                      ? "flex flex-wrap gap-2"
                      : "space-y-2.5"
                  }
                >
                  {choices.map((choice) => {
                    const active = selected === choice;
                    if (format === "CLOZE_BANK") {
                      return (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => setSelected(choice)}
                          className={`rounded-full border px-3.5 py-2 text-[0.98rem] transition ${
                            active
                              ? "border-[var(--forest)] bg-[var(--forest)] text-white"
                              : "border-[var(--line)] bg-white/90 text-[var(--ink)] hover:bg-[var(--forest-soft)]/50"
                          }`}
                        >
                          {choice}
                        </button>
                      );
                    }
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => setSelected(choice)}
                        className={`w-full rounded-[1.2rem] border px-4 py-3.5 text-left text-[0.98rem] leading-snug transition ${
                          active
                            ? "border-[var(--forest)] bg-[var(--forest-soft)] text-[var(--forest-deep)]"
                            : "border-[var(--line)] bg-white/90 hover:bg-[var(--forest-soft)]/50"
                        }`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
                <Button
                  className="mt-3 w-full"
                  disabled={!selected || busy}
                  onClick={confirmPick}
                >
                  Valider
                </Button>
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
      </div>
    </div>
  );
}
