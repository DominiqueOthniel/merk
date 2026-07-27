"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Item = { id: number; prompt: string; level: string };

export default function PlacementPage() {
  const router = useRouter();
  const { update } = useSession();
  const [items, setItems] = useState<Item[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<{
    level: string;
    correct: number;
    total: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/placement")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setAnswers(new Array((data.items ?? []).length).fill(""));
      });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/placement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return;
    setResult(data);
    await update({
      cefrLevel: data.level,
      placedAt: new Date().toISOString(),
    });
  }

  if (result) {
    return (
      <main className="merk-shell merk-shell--narrow">
        <Brand size="medium" className="fade-up" />
        <div className="panel fade-up-delay mt-10">
          <p className="display text-[clamp(2.4rem,8vw,3.4rem)]">
            Niveau {result.level}
          </p>
          <p className="mt-4 text-[1.1rem] leading-relaxed text-[var(--ink-soft)]">
            {result.correct}/{result.total} reponses justes. Tes cartes sont pretes.
          </p>
          <Button className="mt-8 w-full" onClick={() => router.push("/review")}>
            Commencer a reviser
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="merk-shell merk-shell--narrow lg:!max-w-[720px]">
      <div className="fade-up">
        <Brand size="medium" />
        <h1 className="display mt-6 text-[clamp(2rem,6vw,2.6rem)]">
          Test de positionnement
        </h1>
        <p className="mt-2 text-[1.08rem] text-[var(--ink-soft)]">
          Complete les phrases. Pas de chronometre.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {items.map((item, i) => (
          <label key={item.id} className="surface block px-5 py-5">
            <span className="eyebrow">{item.level}</span>
            <p className="mt-2 text-[1.15rem] font-semibold leading-snug">
              {item.prompt.replace("___", "_____")}
            </p>
            <Input
              className="mt-4"
              value={answers[i] ?? ""}
              onChange={(e) => {
                const next = [...answers];
                next[i] = e.target.value;
                setAnswers(next);
              }}
              required
            />
          </label>
        ))}
        <Button className="w-full" disabled={busy || items.length === 0}>
          {busy ? "Analyse..." : "Voir mon niveau"}
        </Button>
      </form>
    </main>
  );
}
