import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { Brand } from "@/components/brand";

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
    <main className="relative z-[1] mx-auto flex min-h-[100dvh] w-full max-w-[440px] flex-col justify-between px-[var(--space)] py-[clamp(1.5rem,5vw,2.5rem)] lg:max-w-[1080px] lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-12 lg:px-10 lg:py-16">
      <div className="fade-up">
        <Brand size="large" />
        <p className="lede mt-5 lg:mt-7 lg:max-w-[34ch]">
          Retiens ce que tu apprends entre deux seances. Un peu chaque jour, ca reste.
        </p>
        <div className="mt-8 hidden max-w-sm space-y-3 lg:block">
          <Link href="/login" className="btn-link btn-link-primary">
            Se connecter
          </Link>
          <Link href="/register" className="btn-link btn-link-secondary">
            Creer un compte eleve
          </Link>
        </div>
      </div>

      <div className="panel-hero hero-breath fade-up-delay my-10 flex flex-col justify-end lg:my-0 lg:min-h-[420px]">
        <p className="eyebrow text-white/65">Cycle de retention</p>
        <p className="display relative z-[1] mt-4 text-[clamp(2rem,7vw,2.8rem)]">
          Ancrage.
          <br />
          Rappel.
          <br />
          Production.
        </p>
        <p className="relative z-[1] mt-5 max-w-[26ch] text-[1.05rem] leading-relaxed text-white/80 lg:max-w-[30ch]">
          Des cartes en contexte, un rythme qui respecte ta memoire, un defi avec ta cohorte.
        </p>
      </div>

      <div className="fade-up-late space-y-3 pb-2 lg:hidden">
        <Link href="/login" className="btn-link btn-link-primary">
          Se connecter
        </Link>
        <Link href="/register" className="btn-link btn-link-secondary">
          Creer un compte eleve
        </Link>
      </div>
    </main>
  );
}
