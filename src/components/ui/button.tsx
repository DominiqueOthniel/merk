import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const styles: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "text-white bg-[linear-gradient(180deg,var(--forest-mid),var(--forest))] shadow-[0_14px_28px_rgba(26,107,72,0.28)] hover:brightness-105",
  secondary:
    "bg-white/85 text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--forest-soft)]",
  ghost: "bg-transparent text-[var(--ink-soft)] hover:bg-[var(--forest-soft)]",
  danger: "bg-[var(--danger)] text-white hover:opacity-90",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: Props) {
  return (
    <button
      className={`inline-flex min-h-[var(--touch)] items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[1.05rem] font-semibold transition active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
