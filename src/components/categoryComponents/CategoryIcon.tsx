import Image from "next/image";

type CategoryIconProps = {
  src: string;
  alt?: string;
  className?: string;
  inverted?: boolean;
};

export function CategoryIcon({
  src,
  alt = "",
  className = "h-7 w-7",
  inverted = false,
}: CategoryIconProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={32}
      height={32}
      unoptimized
      // Theme-aware ink (globals.css): dark line art on light, light on dark.
      className={`shrink-0 object-contain ${className} ${inverted ? "icon-ink-on-accent" : "icon-ink"}`}
    />
  );
}
