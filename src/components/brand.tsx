import Image from "next/image";

type BrandProps = {
  size?: "small" | "medium" | "large";
  className?: string;
};

const sizes = {
  small: {
    box: "h-12 w-12",
    text: "text-[clamp(2.4rem,7vw,3.2rem)]",
    px: 48,
  },
  medium: {
    box: "h-16 w-16",
    text: "text-[clamp(3rem,10vw,4.2rem)]",
    px: 64,
  },
  large: {
    box: "h-24 w-24 sm:h-28 sm:w-28",
    text: "text-[clamp(4rem,15vw,6rem)]",
    px: 112,
  },
} as const;

export function Brand({
  size = "medium",
  className = "",
}: BrandProps) {
  const scale = sizes[size];

  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${className}`}>
      <span className={`brand-logo ${scale.box} shrink-0`} aria-hidden>
        <Image
          src="/merk-logo.png"
          unoptimized
          alt=""
          width={scale.px}
          height={scale.px}
          priority={size === "large"}
        />
      </span>
      <span
        className={`brand-mark ${scale.text} text-[var(--forest-deep)]`}
      >
        MERK.
      </span>
    </div>
  );
}
