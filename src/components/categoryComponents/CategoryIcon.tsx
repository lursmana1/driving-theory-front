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
    <span className={`relative inline-block shrink-0 ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        sizes="32px"
        className={`object-contain ${inverted ? "brightness-0 invert" : "opacity-80"}`}
      />
    </span>
  );
}
