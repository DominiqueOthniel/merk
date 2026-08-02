"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AudioRecorder } from "@/components/review/audio-recorder";

type DueCard = {
  progressId: string;
  cardId: string;
  prompt: string;
  context: string;
  hint?: string | null;
  theme: string;
  level: string;
};

type CheckResult = {
  correct: boolean;
  expected: string;
  context: string;
};

type SubmitResult = {
  points: number;
  prepScore: number;
  streakDays: number;
};

export function ReviewSession() {
  const router = useRouter();
  const [cards, setCards] = useState<DueCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [phase, setPhase] = useState<"answer" | "quality" | "done">("answer");
  const [check, setCheck] = useState<CheckResult | null>(null);
  const [submitMeta, setSubmitMeta] = useState<SubmitResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [sessionPoints, setSessionPoints] = useState(0);

  useEffect(() => {
    fetch("/api/review/due")
      .then((r) => r.json())
      .then((data) => {
        setCards(data.cards ?? []);
        setLoading(false);
        setStartedAt(Date.now());
      })
      .catch(() => setLoading(false));
  }, []);

  const current = cards[index];
  const remaining = Math.max(0, cards.length - index);

  const promptParts = useMemo(() => {
    if (!current) return null;
    return current.prompt.split("___");
  }, [current]);

  async function verify() {
    if (!current || !answer.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/review/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progressId: current.progressId, answer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setCheck(data);
      setPhase("quality");
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  async function rate(quality: "HARD" | "MEDIUM" | "EASY") {
    if (!current || !check || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/review/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progressId: current.progressId,
          answer,
          quality: check.correct ? quality : "HARD",
          responseMs: Date.now() - startedAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setSubmitMeta({
        points: data.points,
        prepScore: data.prepScore,
        streakDays: data.streakDays,
      });
      setSessionPoints((p) => p + (data.points ?? 0));

      if (index + 1 >= cards.length) {
        setPhase("done");
      } else {
        setIndex((i) => i + 1);
        setAnswer("");
        setCheck(null);
        setSubmitMeta(null);
        setPhase("answer");
        setStartedAt(Date.now());
      }
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="skeleton h-56 w-full rounded-[28px]" />
      </div>
    );
  }

  if (!current || phase === "done") {
    return (
      <div className="panel fade-up">
        <p className="eyebrow">Session</p>
        <p className="display mt-2 text-[clamp(2rem,7vw,2.7rem)] text-[var(--forest-deep)]">
          {cards.length === 0 ? "Rien a revoir" : "Bien joue"}
        </p>
        <p className="mt-4 text-[1.1rem] leading-relaxed text-[var(--ink-soft)]">
          {cards.length === 0
            ? "Aucune carte due pour le moment. Reviens demain, la regularite gagne."
            : `+${sessionPoints} points. Ta memoire garde mieux ce que tu revisites.`}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button onClick={() => router.push("/dashboard")}>Voir mon carnet</Button>
          <Button variant="secondary" onClick={() => router.push("/exam")}>
            Entrainer l examen
          </Button>
        </div>
      </div>
    );
  }

  const sessionPct = Math.round(((index + (phase === "quality" ? 1 : 0)) / cards.length) * 100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 text-[1rem] text-[var(--ink-soft)]">
        <span className="font-semibold text-[var(--forest-deep)]">
          {index + 1} / {cards.length}
        </span>
        <span className="stat-chip">
          {current.theme} · {current.level}
        </span>
      </div>
      <div className="progress-track" aria-label={`Progression ${sessionPct}%`}>
        <div
          className="progress-fill"
          style={{
            width: `${Math.min(100, sessionPct)}%`,
          }}
        />
      </div>

      <div className="panel fade-up lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:items-start">
        <div>
          <p className="eyebrow">Contexte</p>
          <p className="mt-2 text-[1.08rem] leading-relaxed text-[var(--ink-soft)] lg:text-[1.12rem]">
            {current.context}
          </p>

          <p className="display mt-8 text-[clamp(1.85rem,6.5vw,2.55rem)] leading-[1.25]">
            {promptParts?.[0]}
            <span className="mx-1.5 inline-block min-w-[5rem] border-b-[3px] border-[var(--forest)] px-1 text-center text-[var(--forest)]">
              {phase === "quality" && check ? check.expected : "?"}
            </span>
            {promptParts?.[1]}
          </p>

          {current.hint ? (
            <p className="mt-5 text-[1.02rem] text-[var(--ink-faint)]">
              Indice : {current.hint}
            </p>
          ) : null}
        </div>

        <div className="mt-8 lg:mt-0">
          {phase === "answer" ? (
            <div className="space-y-4">
              <Input
                autoFocus
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Ecris ta reponse"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && answer.trim()) verify();
                }}
              />
              <AudioRecorder />
              <Button className="w-full" disabled={!answer.trim() || busy} onClick={verify}>
                Verifier
              </Button>
              <p className="text-center text-[0.98rem] text-[var(--ink-faint)]">
                {remaining} carte{remaining > 1 ? "s" : ""} restante
                {remaining > 1 ? "s" : ""}
              </p>
            </div>
          ) : null}

          {phase === "quality" && check ? (
            <div className="fade-up-delay space-y-5">
              <div
                className={`pop-in rounded-[1.4rem] px-5 py-4 text-[1.05rem] leading-relaxed ${
                  check.correct ? "feedback-ok" : "feedback-bad"
                }`}
              >
                {check.correct
                  ? "Correct. Choisis la difficulte pour planifier la suite."
                  : `Attendu : ${check.expected}`}
              </div>
              <p className="text-[1.05rem] text-[var(--ink-soft)]">Comment c etait pour toi ?</p>
              <div className="grid grid-cols-3 gap-2.5">
                <Button
                  variant="secondary"
                  className="px-2 text-[0.95rem]"
                  disabled={busy}
                  onClick={() => rate("HARD")}
                >
                  Difficile
                </Button>
                <Button
                  variant="secondary"
                  className="px-2 text-[0.95rem]"
                  disabled={busy}
                  onClick={() => rate("MEDIUM")}
                >
                  Moyen
                </Button>
                <Button
                  className="px-2 text-[0.95rem]"
                  disabled={busy}
                  onClick={() => rate("EASY")}
                >
                  Facile
                </Button>
              </div>
              {submitMeta ? (
                <p className="text-[0.95rem] text-[var(--ink-faint)]">
                  +{submitMeta.points} pts · prep {submitMeta.prepScore} · serie{" "}
                  {submitMeta.streakDays}j
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
