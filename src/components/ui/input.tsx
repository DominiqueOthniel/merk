import { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`min-h-[var(--touch)] w-full rounded-[1.35rem] border border-[var(--line)] bg-white/90 px-5 py-3.5 text-[1.05rem] outline-none transition placeholder:text-[var(--ink-faint)] focus:border-[var(--forest)] focus:bg-white focus:ring-4 focus:ring-[rgba(26,107,72,0.12)] ${className}`}
      {...props}
    />
  );
}
