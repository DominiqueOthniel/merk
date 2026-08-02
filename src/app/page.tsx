import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { Brand } from "@/components/brand";
import { ProviderSelectCards } from "@/components/exam/provider-select-cards";

export default async function HomePage() {
  let session = null;
  try {
    session = await getSession();
  } catch (error) {
    console.error("Home session lookup failed", error);
  }

  if (session?.user) {
    if (session.user.role === "CENTER_ADMIN") redirect("/admin");
    if (!session.user.placedAt) redirect("/placement");
    redirect("/review");
  }

  return (
    <main className="relative z-[1] w-full">
      <section className="landing-hero">
        <div className="landing-hero__veil" aria-hidden />
        <div className="landing-hero__inner">
          <Brand size="large" className="landing-hero__brand" />
          <h1 className="landing-hero__headline display">
            Prepare ton examen allemand.
          </h1>
          <p className="landing-hero__lede">
            TELC ou Goethe, puis revision espacee, Horen et Sprechen dans le
            meme rythme.
          </p>
          <div className="landing-hero__actions">
            <a href="#provider-selection" className="btn-link btn-link-primary">
              Choisir mon examen
            </a>
            <Link href="/login" className="btn-link btn-link-secondary">
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      <section
        id="provider-selection"
        className="landing-providers fade-up"
        aria-labelledby="provider-heading"
      >
        <div className="landing-providers__inner">
          <p className="eyebrow">Parcours examen</p>
          <h2
            id="provider-heading"
            className="display mt-2 text-[clamp(1.7rem,5vw,2.4rem)] text-[var(--forest-deep)]"
          >
            Choisis ton organisme
          </h2>
          <p className="mt-3 max-w-[40ch] text-[1.08rem] leading-relaxed text-[var(--ink-soft)]">
            Un parcours fixe le contenu et l ambiance. Tu pourras t entrainer
            sur Lesen, Horen, Schreiben et Sprechen.
          </p>
          <div className="mt-8">
            <ProviderSelectCards mode="links" />
          </div>
          <p className="mt-8 text-center text-[1.02rem] text-[var(--ink-soft)]">
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="font-semibold text-[var(--forest)] underline underline-offset-4"
            >
              Creer un compte eleve
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
