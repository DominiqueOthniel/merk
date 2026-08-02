"use client";

import { useState } from "react";
import { BrandHeader } from "@/components/nav";
import { Button } from "@/components/ui/button";

type PlanId = "essai" | "pro" | "centre";

type Plan = {
  id: PlanId;
  name: string;
  price: string;
  period?: string;
  blurb: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "essai",
    name: "Essai",
    price: "0 €",
    blurb: "Pour tester le rythme MERK. sur quelques themes.",
    features: [
      "Cartes de revision (themes)",
      "Score de preparation",
      "1 niveau d examen en apercu",
    ],
    cta: "Plan actuel",
  },
  {
    id: "pro",
    name: "Pro",
    price: "14 €",
    period: "/ mois",
    blurb: "Tout le parcours eleve, sans plafond.",
    features: [
      "Revision illimitee",
      "Catalogue TELC et Goethe B1, B2, C1",
      "Defi de cohorte et carnet complet",
      "Historique de progression",
    ],
    cta: "Choisir Pro",
    highlighted: true,
  },
  {
    id: "centre",
    name: "Centre",
    price: "Sur devis",
    blurb: "Pour les academies qui suivent plusieurs cohortes.",
    features: [
      "Comptes eleves en volume",
      "Espace admin centre",
      "Suivi de cohortes",
      "Accompagnement mise en place",
    ],
    cta: "Contacter MERK.",
  },
];

export default function SubscriptionPage() {
  const [current] = useState<PlanId>("essai");
  const [selected, setSelected] = useState<PlanId>("pro");
  const [message, setMessage] = useState<string | null>(null);

  function choose(plan: Plan) {
    setSelected(plan.id);

    if (plan.id === "essai") {
      setMessage("Tu es deja sur l essai. Passe en Pro quand tu es pret.");
      return;
    }

    if (plan.id === "centre") {
      setMessage(
        "Ecris a hello@merkacademy.net pour un devis centre. On te repond vite.",
      );
      return;
    }

    setMessage(
      "Pro arrive bientot. Ta selection est enregistree, le paiement ouvrira ici.",
    );
  }

  return (
    <>
      <BrandHeader subtitle="Choisis ton offre MERK." />

      <section className="panel fade-up mb-6 lg:mb-8">
        <p className="eyebrow">Abonnement</p>
        <h2 className="display mt-3 text-[clamp(1.8rem,5vw,2.4rem)] text-[var(--forest-deep)]">
          Un rythme clair. Un prix simple.
        </h2>
        <p className="mt-3 max-w-[40ch] text-[1.08rem] leading-relaxed text-[var(--ink-soft)]">
          L essai reste gratuit. Pro debloque tout l entrainement examen et la
          revision sans limite.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        {PLANS.map((plan, index) => {
          const active = selected === plan.id;
          const isCurrent = current === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => choose(plan)}
              className={`fade-up rounded-[1.6rem] border px-5 py-6 text-left transition lg:px-6 lg:py-7 ${
                plan.highlighted
                  ? "border-[var(--forest)] bg-[var(--forest)] text-white shadow-[0_18px_36px_rgba(26,107,72,0.28)]"
                  : active
                    ? "border-[var(--forest-mid)] bg-white/95 shadow-[var(--shadow-soft)]"
                    : "border-[var(--line)] bg-white/80 hover:border-[var(--forest)]/40 hover:bg-white"
              }`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className={`eyebrow ${
                      plan.highlighted ? "text-white/65" : ""
                    }`}
                  >
                    {isCurrent ? "Ton plan" : "Offre"}
                  </p>
                  <p
                    className={`display mt-2 text-[clamp(1.7rem,4vw,2.1rem)] ${
                      plan.highlighted ? "text-white" : "text-[var(--forest-deep)]"
                    }`}
                  >
                    {plan.name}
                  </p>
                </div>
                {plan.highlighted ? (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[0.85rem] font-semibold text-white">
                    Conseille
                  </span>
                ) : null}
              </div>

              <p
                className={`mt-4 text-[clamp(1.8rem,5vw,2.3rem)] font-semibold tracking-tight ${
                  plan.highlighted ? "text-white" : "text-[var(--ink)]"
                }`}
              >
                {plan.price}
                {plan.period ? (
                  <span
                    className={`ml-1 text-[1rem] font-medium ${
                      plan.highlighted ? "text-white/75" : "text-[var(--ink-faint)]"
                    }`}
                  >
                    {plan.period}
                  </span>
                ) : null}
              </p>

              <p
                className={`mt-3 text-[1.02rem] leading-relaxed ${
                  plan.highlighted ? "text-white/85" : "text-[var(--ink-soft)]"
                }`}
              >
                {plan.blurb}
              </p>

              <ul
                className={`mt-5 space-y-2.5 text-[1.02rem] ${
                  plan.highlighted ? "text-white/90" : "text-[var(--ink)]"
                }`}
              >
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <span
                      className={
                        plan.highlighted ? "text-white/70" : "text-[var(--forest)]"
                      }
                    >
                      ·
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                <span
                  className={`inline-flex min-h-[var(--touch)] w-full items-center justify-center rounded-full px-5 text-[1.02rem] font-semibold ${
                    plan.highlighted
                      ? "bg-white text-[var(--forest-deep)]"
                      : isCurrent
                        ? "bg-[var(--forest-soft)] text-[var(--forest-deep)]"
                        : "bg-[var(--forest)] text-white"
                  }`}
                >
                  {isCurrent && plan.id === "essai" ? "Plan actuel" : plan.cta}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {message ? (
        <section className="surface fade-up mt-6 px-5 py-5 lg:mt-8">
          <p className="text-[1.05rem] leading-relaxed text-[var(--ink-soft)]">
            {message}
          </p>
          {selected === "centre" ? (
            <a
              href="mailto:hello@merkacademy.net?subject=Devis%20centre%20MERK"
              className="btn-link btn-link-primary mt-5"
            >
              Envoyer un mail
            </a>
          ) : null}
          {selected === "pro" && current !== "pro" ? (
            <Button
              type="button"
              className="mt-5 w-full sm:w-auto"
              onClick={() =>
                setMessage(
                  "Liste d attente Pro note. On t ecrira des que le paiement est ouvert.",
                )
              }
            >
              Me prevenir
            </Button>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
