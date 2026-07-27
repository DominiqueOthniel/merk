"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Item = {
  progressId: string;
  cardId: string;
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

export function ExamSession({ sourceId }: { sourceId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [section, setSection] = useState("");
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
        setItems(data.items ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sourceId]);

  const current = items[index];
  const choices = useMemo(() => {
    if (!current) return [];
    const pool = current.options.includes(current.answer)
      ? current.options
      : [...current.options, current.answer];
    return shuffle(pool).slice(0, Math.min(8, pool.length));
  }, [current]);

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
          {score.total === 0
            ? "Aucun item dans cette serie."
            : `${score.ok}/${score.total} titres correctement associes.`}
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
        <p className="eyebrow">TELC B1 · {title}</p>
        <p className="mt-3 text-[1.02rem] font-semibold text-[var(--forest-deep)]">
          Choisis le titre qui correspond au texte
        </p>
        <div className="mt-5 max-h-[40vh] overflow-y-auto rounded-[1.25rem] bg-[rgba(216,235,224,0.35)] p-4 text-[1.05rem] leading-relaxed">
          {current.passage}
        </div>

        {phase === "pick" ? (
          <div className="mt-5 space-y-2.5">
            {choices.map((choice) => {
              const active = selected === choice;
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
          <div className="fade-up-delay mt-5 space-y-4">
            <div
              className={`rounded-[1.3rem] px-4 py-3 text-[1.02rem] ${
                correct
                  ? "bg-[var(--forest-soft)] text-[var(--forest-deep)]"
                  : "bg-rose-50 text-[var(--danger)]"
              }`}
            >
              {correct
                ? "Bon titre."
                : `Titre attendu : ${current.answer}`}
            </div>
            <Button className="w-full" onClick={next} disabled={busy}>
              Continuer
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
