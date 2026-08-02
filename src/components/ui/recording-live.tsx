"use client";

type Props = {
  levels?: number[];
  label?: string;
};

export function RecordingLive({
  levels = [0.35, 0.6, 0.45, 0.75, 0.5],
  label = "Enregistrement en cours",
}: Props) {
  return (
    <div className="mt-4 rounded-[1.2rem] border border-[var(--danger)]/35 bg-[rgba(220,80,80,0.08)] px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="rec-dot inline-block h-2.5 w-2.5 rounded-full bg-[var(--danger)]" />
        <p className="text-[0.95rem] font-semibold text-[var(--danger)]">{label}</p>
      </div>
      <div className="mt-3 flex h-12 items-end justify-center gap-1.5" aria-hidden>
        {levels.map((level, i) => (
          <span
            key={i}
            className="w-2 rounded-full bg-[var(--danger)] transition-[height,opacity] duration-75"
            style={{
              height: `${16 + level * 30}px`,
              opacity: 0.5 + level * 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
}
