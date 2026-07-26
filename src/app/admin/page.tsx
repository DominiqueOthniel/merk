"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

type Overview = {
  centre: { id?: string; name?: string };
  cohorts: {
    id: string;
    name: string;
    nextSessionAt: string | null;
    studentCount: number;
    inactiveCount: number;
    avgPrepScore: number | null;
  }[];
  students: {
    id: string;
    name: string;
    email: string;
    cefrLevel: string | null;
    cohorte: string;
    streakDays: number;
    totalPoints: number;
    lastReviewAt: string | null;
    prepScore: number | null;
    inactive: boolean;
  }[];
  alerts: { id: string; name: string; lastReviewAt: string | null }[];
};

export default function AdminPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/overview")
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error || "Erreur");
        setData(json);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <main className="merk-wide">
        <p className="text-[var(--danger)]">{error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="merk-wide">
        <p className="text-[1.1rem] text-[var(--ink-soft)]">Chargement du back-office...</p>
      </main>
    );
  }

  return (
    <main className="merk-wide">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4 fade-up">
        <div>
          <p className="brand-mark text-[clamp(3rem,8vw,4.2rem)] text-[var(--forest-deep)]">
            MERK.
          </p>
          <p className="mt-3 text-[1.1rem] text-[var(--ink-soft)]">
            Back-office · {data.centre.name}
          </p>
        </div>
        <Button variant="secondary" onClick={() => signOut({ callbackUrl: "/login" })}>
          Deconnexion
        </Button>
      </header>

      {data.alerts.length > 0 ? (
        <section className="mb-7 rounded-[1.6rem] border border-amber-200/80 bg-amber-50/90 px-5 py-5">
          <p className="text-[1.1rem] font-semibold text-[var(--warn)]">
            Alertes inactifs ({data.alerts.length})
          </p>
          <ul className="mt-3 space-y-2 text-[1.02rem]">
            {data.alerts.map((a) => (
              <li key={a.id}>
                {a.name}
                {a.lastReviewAt
                  ? ` · derniere revision ${new Date(a.lastReviewAt).toLocaleDateString("fr-FR")}`
                  : " · jamais revise"}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.cohorts.map((c) => (
          <article key={c.id} className="panel">
            <h2 className="display text-[1.55rem]">{c.name}</h2>
            <p className="mt-3 text-[1.05rem] text-[var(--ink-soft)]">
              {c.studentCount} eleves · {c.inactiveCount} inactif
              {c.inactiveCount > 1 ? "s" : ""}
            </p>
            <p className="mt-2 text-[1.05rem]">
              Prep moyenne : {c.avgPrepScore ?? "—"}
            </p>
            {c.nextSessionAt ? (
              <p className="mt-3 text-[0.98rem] text-[var(--ink-faint)]">
                Prochaine seance {new Date(c.nextSessionAt).toLocaleString("fr-FR")}
              </p>
            ) : null}
          </article>
        ))}
      </section>

      <section>
        <h2 className="display mb-4 text-[clamp(1.6rem,4vw,2rem)]">Eleves</h2>
        <div className="overflow-x-auto rounded-[1.6rem] bg-white/85 shadow-[var(--shadow-soft)]">
          <table className="min-w-full text-left text-[1.02rem]">
            <thead className="border-b border-[var(--line)] text-[var(--ink-soft)]">
              <tr>
                <th className="px-5 py-4 font-semibold">Nom</th>
                <th className="px-5 py-4 font-semibold">Cohorte</th>
                <th className="px-5 py-4 font-semibold">Niveau</th>
                <th className="px-5 py-4 font-semibold">Prep</th>
                <th className="px-5 py-4 font-semibold">Serie</th>
                <th className="px-5 py-4 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((s) => (
                <tr key={s.id} className="border-b border-[var(--line)] last:border-0">
                  <td className="px-5 py-4">
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-[0.95rem] text-[var(--ink-faint)]">{s.email}</div>
                  </td>
                  <td className="px-5 py-4">{s.cohorte}</td>
                  <td className="px-5 py-4">{s.cefrLevel ?? "—"}</td>
                  <td className="px-5 py-4">{s.prepScore ?? "—"}</td>
                  <td className="px-5 py-4">{s.streakDays}j</td>
                  <td className="px-5 py-4">
                    {s.inactive ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1.5 text-[0.9rem] text-[var(--warn)]">
                        Inactif
                      </span>
                    ) : (
                      <span className="rounded-full bg-[var(--forest-soft)] px-3 py-1.5 text-[0.9rem] text-[var(--forest-deep)]">
                        Actif
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
