"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Brand } from "@/components/brand";

const studentLinks = [
  { href: "/review", label: "Reviser" },
  { href: "/exam", label: "Examen" },
  { href: "/dashboard", label: "Carnet" },
  { href: "/subscription", label: "Pro" },
];

function NavLinks({
  orientation,
}: {
  orientation: "horizontal" | "vertical";
}) {
  const pathname = usePathname();
  const vertical = orientation === "vertical";

  return (
    <>
      {studentLinks.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              vertical
                ? `rounded-[1.15rem] px-3.5 py-3 text-[1.02rem] font-semibold transition-[background,color,box-shadow,transform] duration-200 ${
                    active
                      ? "bg-[var(--forest)] text-white shadow-[var(--shadow-glow)]"
                      : "text-[var(--ink-soft)] hover:bg-[var(--forest-soft)] hover:text-[var(--forest-deep)]"
                  }`
                : `flex-1 rounded-[1.2rem] px-2.5 py-3 text-center text-[0.92rem] font-semibold transition-[background,color,box-shadow,transform] duration-200 ${
                    active
                      ? "bg-[var(--forest)] text-white shadow-[0_10px_20px_rgba(23,104,68,0.28)]"
                      : "text-[var(--ink-soft)] hover:bg-[var(--forest-soft)]"
                  }`
            }
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

export function StudentNav() {
  const { data } = useSession();

  return (
    <>
      <aside className="merk-rail">
        <Brand size="small" />
        <p className="mt-5 px-1 text-[0.95rem] leading-snug text-[var(--ink-soft)]">
          {data?.user?.name ? (
            <>
              Bonjour{" "}
              <span className="font-semibold text-[var(--forest-deep)]">
                {data.user.name.split(" ")[0]}
              </span>
            </>
          ) : (
            "Espace eleve"
          )}
        </p>
        <p className="mt-2 px-1 text-[0.88rem] leading-snug text-[var(--ink-faint)]">
          Un peu chaque jour. Ca reste.
        </p>
        <nav className="mt-8 flex flex-1 flex-col gap-2" aria-label="Navigation eleve">
          <NavLinks orientation="vertical" />
        </nav>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-[1.15rem] px-3.5 py-3 text-left text-[0.98rem] font-medium text-[var(--ink-faint)] transition hover:bg-[var(--forest-soft)] hover:text-[var(--ink-soft)]"
        >
          Sortir
        </button>
      </aside>

      <nav
        className="merk-dock fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2"
        aria-label="Navigation eleve"
      >
        <div className="dock-shell mx-auto flex w-full max-w-[560px] items-center gap-1 rounded-[1.75rem] border border-white/75 bg-white/92 p-1.5 shadow-[var(--shadow)] backdrop-blur-xl md:max-w-[640px]">
          <NavLinks orientation="horizontal" />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-[1.2rem] px-2.5 py-3 text-[0.88rem] font-medium text-[var(--ink-faint)] transition hover:bg-[var(--forest-soft)] hover:text-[var(--ink-soft)]"
            title={data?.user?.name ?? "Quitter"}
          >
            Sortir
          </button>
        </div>
      </nav>
    </>
  );
}

export function BrandHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="mb-8 fade-up lg:mb-10 lg:flex lg:items-end lg:justify-between lg:gap-8">
      <Brand size="small" className="lg:hidden" />
      <div className="hidden lg:block">
        <p className="eyebrow">MERK.</p>
        {subtitle ? (
          <h1 className="display mt-2 max-w-[24ch] text-[clamp(2rem,3vw,2.75rem)] text-[var(--forest-deep)]">
            {subtitle}
          </h1>
        ) : null}
      </div>
      {subtitle ? (
        <p className="mt-3 max-w-[30ch] text-[1.08rem] leading-relaxed text-[var(--ink-soft)] lg:hidden">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
