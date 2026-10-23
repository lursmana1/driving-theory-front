import { Link } from "@/i18n/navigation";
import type { SignSummary } from "@/lib/types/signs";

type SignTileProps = {
  sign: Pick<SignSummary, "number" | "image" | "wide" | "kind">;
  /** visible name ("მონიშვნა 1.1" for markings, which have none) */
  label: string;
  /** where the card goes — a sign's place on its group page (`/signs/category/<group>#<slug>`) */
  href: string;
  priority?: boolean;
};

/** Wide sheets and road markings are landscape images, so they take two grid columns (from `sm`; on phones every card is a full-width row). */
export function signTileSpan(sign: Pick<SignSummary, "wide" | "kind">) {
  return sign.wide || sign.kind === "marking" ? "sm:col-span-2" : "";
}

export default function SignTile({ sign, label, href, priority = false }: SignTileProps) {
  const landscape = sign.wide || sign.kind === "marking";

  return (
    <Link
      href={href}
      className="group relative flex h-full flex-row items-center gap-3 rounded-card border border-line bg-surface p-2.5 text-left shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-raised sm:flex-col sm:items-stretch sm:gap-0"
    >
      <span className="absolute left-2 top-2 z-10 rounded-xs bg-inverse px-1.5 py-0.5 font-mono text-2xs font-semibold text-fg-inverse">
        {sign.number}
      </span>
      <span
        className={`flex shrink-0 items-center justify-center rounded-control bg-surface-muted p-2 sm:w-auto sm:p-4 ${
          landscape ? "aspect-2/1 w-40" : "aspect-square w-24"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG signs */}
        <img
          src={sign.image}
          alt={label}
          width={landscape ? 320 : 160}
          height={160}
          className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      </span>
      <span className="line-clamp-3 min-w-0 flex-1 wrap-anywhere text-sm font-medium leading-5 text-fg sm:mt-3 sm:line-clamp-2 sm:min-h-10 sm:flex-none">
        {label}
      </span>
    </Link>
  );
}
