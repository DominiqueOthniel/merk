import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const styles: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "text-white bg-[linear-gradient(180deg,var(--forest-mid),var(--forest))] shadow-[var(--shadow-glow)] hover:brightness-105 hover:shadow-[0_16px_36px_rgba(23,104,68,0.3)]",
  secondary:
    "bg-white/90 text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--forest-soft)] hover:border-[rgba(23,104,68,0.22)]",
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
      className={`inline-flex min-h-[var(--touch)] items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[1.05rem] font-semibold transition-[transform,filter,box-shadow,background,opacity] duration-200 ease-[cubic-bezier(0.34,1.3,0.64,1)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
