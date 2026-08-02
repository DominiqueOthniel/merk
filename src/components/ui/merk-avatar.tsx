import Image from "next/image";

export const MERK_AVATARS = {
  telc: "/avatars/avatar-telc.png",
  goethe: "/avatars/avatar-goethe.png",
  lesen: "/avatars/avatar-lesen.png",
  horen: "/avatars/avatar-horen.png",
  schreiben: "/avatars/avatar-schreiben.png",
  sprechen: "/avatars/avatar-sprechen.png",
  sprachbausteine: "/avatars/avatar-schreiben.png",
} as const;

export type MerkAvatarKey = keyof typeof MERK_AVATARS;

export function avatarForSection(section: string, skill?: string): string {
  const hay = `${section} ${skill ?? ""}`.toLowerCase();
  if (/hören|horen|listen/.test(hay)) return MERK_AVATARS.horen;
  if (/schreiben|write/.test(hay)) return MERK_AVATARS.schreiben;
  if (/sprechen|speak|oral/.test(hay)) return MERK_AVATARS.sprechen;
  if (/sprachbaustein|grammar|baustein/.test(hay)) {
    return MERK_AVATARS.sprachbausteine;
  }
  if (/lesen|read|match|teil/.test(hay)) return MERK_AVATARS.lesen;
  return MERK_AVATARS.lesen;
}

type MerkAvatarProps = {
  src: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "rounded";
  className?: string;
};

const SIZES = {
  sm: { box: "h-12 w-12", px: 48 },
  md: { box: "h-16 w-16", px: 64 },
  lg: { box: "h-24 w-24", px: 96 },
} as const;

export function MerkAvatar({
  src,
  alt = "",
  size = "md",
  shape = "circle",
  className = "",
}: MerkAvatarProps) {
  const scale = SIZES[size];
  const radius = shape === "circle" ? "rounded-full" : "rounded-[1.25rem]";

  return (
    <span
      className={`merk-avatar ${radius} ${scale.box} ${className}`}
      aria-hidden={alt ? undefined : true}
    >
      <Image
        src={src}
        alt={alt}
        width={scale.px}
        height={scale.px}
        className="h-full w-full object-cover"
      />
    </span>
  );
}
