"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Brand } from "@/components/brand";
import { ExamProviderPicker } from "@/components/exam/exam-provider-picker";
import { ExamThemeSync } from "@/components/exam/exam-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CEFR_LEVELS } from "@/lib/cefr";
import { normalizeExamProvider, type ExamProvider } from "@/lib/exam-provider";
import type { CefrLevel } from "@/lib/types";

type Centre = {
  id: string;
  name: string;
  cohorts: { id: string; name: string }[];
};

const selectClass =
  "mt-0 min-h-[var(--touch)] w-full rounded-[1.35rem] border border-[var(--line)] bg-white/90 px-5 py-3.5 text-[1.05rem] outline-none focus:border-[var(--forest)] focus:ring-4 focus:ring-[rgba(26,107,72,0.12)]";

const MOTIVATIONS = [
  { id: "examen", label: "Reussir mon examen" },
  { id: "travail", label: "Travail / integration" },
  { id: "etudes", label: "Etudes" },
  { id: "autre", label: "Autre" },
] as const;

export default function RegisterPage() {
  return (
    <main className="merk-shell merk-shell--narrow">
      <Suspense fallback={<p className="text-[var(--ink-soft)]">Chargement...</p>}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { update } = useSession();
  const [centres, setCentres] = useState<Centre[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [centreId, setCentreId] = useState("");
  const [cohorteId, setCohorteId] = useState("");
  const [examProvider, setExamProvider] = useState<ExamProvider>(() =>
    normalizeExamProvider(searchParams.get("exam")),
  );
  const [currentLevel, setCurrentLevel] = useState<CefrLevel>("A2");
  const [targetLevel, setTargetLevel] = useState<CefrLevel>("B1");
  const [motivation, setMotivation] = useState<string>("examen");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/centres")
      .then((r) => r.json())
      .then((data: Centre[]) => {
        setCentres(data);
        if (data[0]) {
          setCentreId(data[0].id);
          setCohorteId(data[0].cohorts[0]?.id ?? "");
        }
      });
  }, []);

  const selected = centres.find((c) => c.id === centreId);

  const targetOptions = useMemo(() => {
    const idx = CEFR_LEVELS.indexOf(currentLevel);
    return CEFR_LEVELS.slice(Math.max(0, idx));
  }, [currentLevel]);

  useEffect(() => {
    if (!targetOptions.includes(targetLevel)) {
      setTargetLevel(targetOptions[0] ?? currentLevel);
    }
  }, [targetOptions, targetLevel, currentLevel]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        centreId,
        cohorteId: cohorteId || null,
        examProvider,
        currentLevel,
        targetLevel,
        motivation,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erreur");
      setBusy(false);
      return;
    }
    await signIn("credentials", {
      email,
      password,
      examProvider,
      redirect: false,
    });
    await update({
      cefrLevel: data.cefrLevel,
      targetLevel: data.targetLevel,
      placedAt: data.placedAt,
      examProvider,
    });
    setBusy(false);
    router.push("/anki");
  }

  return (
    <>
      <ExamThemeSync preview={examProvider} />
      <div className="fade-up">
        <Brand size="medium" />
        <h1 className="display mt-6 text-[clamp(2rem,6vw,2.6rem)]">
          Inscription eleve
        </h1>
        <p className="mt-2 text-[1.08rem] text-[var(--ink-soft)]">
          Dis-nous ou tu en es : on prepare ton carnet de revision.
        </p>
      </div>

      <form onSubmit={onSubmit} className="panel fade-up-delay mt-10 space-y-5">
        <ExamProviderPicker value={examProvider} onChange={setExamProvider} />

        <fieldset className="space-y-3">
          <legend className="field-label">Ton niveau actuel</legend>
          <p className="text-[0.92rem] text-[var(--ink-faint)]">
            Ou tu te situes aujourd hui, sans pression.
          </p>
          <div className="grid grid-cols-5 gap-2">
            {CEFR_LEVELS.map((lvl) => {
              const active = currentLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setCurrentLevel(lvl)}
                  className={`rounded-[1.1rem] px-2 py-3 text-center text-[0.95rem] font-semibold transition ${
                    active
                      ? "bg-[var(--forest)] text-white shadow-[var(--shadow-glow)]"
                      : "border border-[var(--line)] bg-white/90 text-[var(--ink)]"
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="field-label">Niveau que tu vises</legend>
          <p className="text-[0.92rem] text-[var(--ink-faint)]">
            Examen ou objectif (doit etre egal ou au dessus du niveau actuel).
          </p>
          <div className="grid grid-cols-5 gap-2">
            {CEFR_LEVELS.map((lvl) => {
              const allowed = targetOptions.includes(lvl);
              const active = targetLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  disabled={!allowed}
                  onClick={() => setTargetLevel(lvl)}
                  className={`rounded-[1.1rem] px-2 py-3 text-center text-[0.95rem] font-semibold transition ${
                    active
                      ? "bg-[var(--forest)] text-white shadow-[var(--shadow-glow)]"
                      : allowed
                        ? "border border-[var(--line)] bg-white/90 text-[var(--ink)]"
                        : "cursor-not-allowed border border-[var(--line)] bg-[var(--moss)]/30 text-[var(--ink-faint)] opacity-45"
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="field-label">Pourquoi tu apprends</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {MOTIVATIONS.map((m) => {
              const active = motivation === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMotivation(m.id)}
                  className={`rounded-[1.2rem] px-4 py-3 text-left text-[0.98rem] font-medium transition ${
                    active
                      ? "bg-[var(--forest-soft)] text-[var(--forest-deep)] ring-2 ring-[var(--forest)]"
                      : "border border-[var(--line)] bg-white/90 text-[var(--ink-soft)]"
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="block">
          <span className="field-label">Prenom / nom</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="block">
          <span className="field-label">Email</span>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="field-label">Mot de passe</span>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        <label className="block">
          <span className="field-label">Centre</span>
          <select
            className={selectClass}
            value={centreId}
            onChange={(e) => {
              setCentreId(e.target.value);
              const c = centres.find((x) => x.id === e.target.value);
              setCohorteId(c?.cohorts[0]?.id ?? "");
            }}
            required
          >
            {centres.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Cohorte (optionnel)</span>
          <select
            className={selectClass}
            value={cohorteId}
            onChange={(e) => setCohorteId(e.target.value)}
          >
            <option value="">Sans cohorte</option>
            {selected?.cohorts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        {error ? <p className="text-[var(--danger)]">{error}</p> : null}
        <Button className="w-full" disabled={busy}>
          {busy ? "Preparation du carnet..." : "Creer mon compte et reviser"}
        </Button>
      </form>

      <p className="fade-up-late mt-8 text-[1.05rem] text-[var(--ink-soft)]">
        Deja inscrit ?{" "}
        <Link
          href={`/login?exam=${examProvider}`}
          className="font-semibold text-[var(--forest)] underline underline-offset-4"
        >
          Se connecter
        </Link>
      </p>
    </>
  );
}
