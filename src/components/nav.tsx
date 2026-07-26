"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const studentLinks = [
  { href: "/review", label: "Reviser" },
  { href: "/dashboard", label: "Carnet" },
  { href: "/challenge", label: "Defi" },
];

export function StudentNav() {
  const pathname = usePathname();
  const { data } = useSession();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <div className="mx-auto flex w-full max-w-[560px] items-center gap-1 rounded-[1.75rem] border border-white/70 bg-white/88 p-2 shadow-[var(--shadow)] backdrop-blur-xl md:max-w-[640px]">
        {studentLinks.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 rounded-[1.25rem] px-3 py-3.5 text-center text-[0.98rem] font-semibold transition ${
                active
                  ? "bg-[var(--forest)] text-white shadow-[0_10px_20px_rgba(26,107,72,0.28)]"
                  : "text-[var(--ink-soft)] hover:bg-[var(--forest-soft)]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
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
  );
}

export function BrandHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="mb-8 fade-up">
      <p className="brand-mark text-[clamp(2.6rem,8vw,3.4rem)] text-[var(--forest-deep)]">
        MERK.
      </p>
      {subtitle ? (
        <p className="mt-3 max-w-[28ch] text-[1.05rem] leading-relaxed text-[var(--ink-soft)]">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
