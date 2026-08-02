"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Brand } from "@/components/brand";
import { ExamProviderPicker } from "@/components/exam/exam-provider-picker";
import { ExamThemeSync } from "@/components/exam/exam-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeExamProvider, type ExamProvider } from "@/lib/exam-provider";

type Centre = {
  id: string;
  name: string;
  cohorts: { id: string; name: string }[];
};

const selectClass =
  "mt-0 min-h-[var(--touch)] w-full rounded-[1.35rem] border border-[var(--line)] bg-white/90 px-5 py-3.5 text-[1.05rem] outline-none focus:border-[var(--forest)] focus:ring-4 focus:ring-[rgba(26,107,72,0.12)]";

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
  const [centres, setCentres] = useState<Centre[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [centreId, setCentreId] = useState("");
  const [cohorteId, setCohorteId] = useState("");
  const [examProvider, setExamProvider] = useState<ExamProvider>(() =>
    normalizeExamProvider(searchParams.get("exam")),
  );
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
    setBusy(false);
    router.push("/placement");
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
          Choisis TELC ou Goethe, puis rattache-toi a ton centre.
        </p>
      </div>

      <form onSubmit={onSubmit} className="panel fade-up-delay mt-10 space-y-5">
        <ExamProviderPicker value={examProvider} onChange={setExamProvider} />
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
          {busy ? "Creation..." : "Creer mon compte"}
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
