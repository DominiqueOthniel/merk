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
            className={
              vertical
                ? `rounded-[1.15rem] px-3.5 py-3 text-[1.02rem] font-semibold transition ${
                    active
                      ? "bg-[var(--forest)] text-white shadow-[0_10px_20px_rgba(26,107,72,0.28)]"
                      : "text-[var(--ink-soft)] hover:bg-[var(--forest-soft)]"
                  }`
                : `flex-1 rounded-[1.25rem] px-3 py-3.5 text-center text-[0.98rem] font-semibold transition ${
                    active
                      ? "bg-[var(--forest)] text-white shadow-[0_10px_20px_rgba(26,107,72,0.28)]"
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
        <p className="mt-5 px-1 text-[0.92rem] leading-snug text-[var(--ink-soft)]">
          {data?.user?.name ? `Bonjour ${data.user.name}` : "Espace eleve"}
        </p>
        <nav className="mt-8 flex flex-1 flex-col gap-2">
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

      <nav className="merk-dock fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <div className="mx-auto flex w-full max-w-[560px] items-center gap-1 rounded-[1.75rem] border border-white/70 bg-white/88 p-2 shadow-[var(--shadow)] backdrop-blur-xl md:max-w-[640px]">
          <NavLinks orientation="horizontal" />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-[1.25rem] px-3 py-3.5 text-[0.95rem] font-medium text-[var(--ink-faint)] hover:bg-[var(--forest-soft)] hover:text-[var(--ink-soft)]"
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
          <h1 className="display mt-2 max-w-[22ch] text-[clamp(2rem,3vw,2.7rem)] text-[var(--forest-deep)]">
            {subtitle}
          </h1>
        ) : null}
      </div>
      {subtitle ? (
        <p className="mt-3 max-w-[28ch] text-[1.05rem] leading-relaxed text-[var(--ink-soft)] lg:hidden">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
