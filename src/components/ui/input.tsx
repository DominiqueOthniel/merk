import { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`min-h-[var(--touch)] w-full rounded-[1.35rem] border border-[var(--line)] bg-white/92 px-5 py-3.5 text-[16px] outline-none transition-[border-color,box-shadow,background] duration-200 placeholder:text-[var(--ink-faint)] focus:border-[var(--forest)] focus:bg-white focus:shadow-[0_0_0_4px_var(--focus)] ${className}`}
      {...props}
    />
  );
}
