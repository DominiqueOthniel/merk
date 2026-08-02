import Image from "next/image";

type BrandProps = {
  size?: "small" | "medium" | "large";
  className?: string;
};

const sizes = {
  small: {
    image: "h-12 w-12",
    text: "text-[clamp(2.4rem,7vw,3.2rem)]",
  },
  medium: {
    image: "h-16 w-16",
    text: "text-[clamp(3rem,10vw,4.2rem)]",
  },
  large: {
    image: "h-24 w-24 sm:h-28 sm:w-28",
    text: "text-[clamp(4rem,15vw,6rem)]",
  },
} as const;

export function Brand({
  size = "medium",
  className = "",
}: BrandProps) {
  const scale = sizes[size];

  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${className}`}>
      <Image
        src="/merk-logo.png"
        unoptimized
        alt=""
        width={112}
        height={112}
        priority={size === "large"}
        className={`${scale.image} shrink-0 object-contain drop-shadow-[0_10px_20px_rgba(15,70,48,0.16)]`}
      />
      <span
        className={`brand-mark ${scale.text} text-[var(--forest-deep)]`}
      >
        MERK.
      </span>
    </div>
  );
}
