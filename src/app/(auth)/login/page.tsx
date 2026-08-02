"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/brand";
import { ExamProviderPicker } from "@/components/exam/exam-provider-picker";
import { ExamThemeSync } from "@/components/exam/exam-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ExamProvider } from "@/lib/exam-provider";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("eleve@merk.demo");
  const [password, setPassword] = useState("merk1234");
  const [examProvider, setExamProvider] = useState<ExamProvider>("TELC");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      examProvider,
      redirect: false,
    });
    setBusy(false);
    if (res?.error) {
      setError("Identifiants incorrects");
      return;
    }
    router.refresh();
    router.push("/");
  }

  return (
    <main className="merk-shell merk-shell--narrow">
      <ExamThemeSync preview={examProvider} />
      <div className="fade-up">
        <Brand size="medium" />
        <h1 className="display mt-6 text-[clamp(2rem,6vw,2.6rem)]">Connexion</h1>
        <p className="mt-2 text-[1.08rem] text-[var(--ink-soft)]">
          Un parcours, une couleur, un seul contenu examen.
        </p>
      </div>

      <form onSubmit={onSubmit} className="panel fade-up-delay mt-10 space-y-5">
        <ExamProviderPicker value={examProvider} onChange={setExamProvider} />
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
            required
          />
        </label>
        {error ? <p className="text-[var(--danger)]">{error}</p> : null}
        <Button className="w-full" disabled={busy}>
          {busy
            ? "Connexion..."
            : `Entrer en ${examProvider === "GOETHE" ? "Goethe" : "TELC"}`}
        </Button>
      </form>

      <p className="fade-up-late mt-8 text-[1.05rem] text-[var(--ink-soft)]">
        Pas encore de compte ?{" "}
        <Link
          href="/register"
          className="font-semibold text-[var(--forest)] underline underline-offset-4"
        >
          S inscrire
        </Link>
      </p>
      <p className="mt-5 rounded-[1.4rem] bg-[var(--forest-soft)]/80 px-5 py-4 text-[0.95rem] leading-relaxed text-[var(--forest-deep)]">
        Demo eleve : eleve@merk.demo / merk1234
        <br />
        Demo admin : admin@merk.demo / merk1234
      </p>
    </main>
  );
}
