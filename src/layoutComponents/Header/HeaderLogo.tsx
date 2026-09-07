import { Link } from "@/i18n/navigation";
import PravaLogo from "../../../public/images/jpg/pravaLogo.jpg";
import Image from "next/image";
import type { HeaderVariant } from "./headerVariants";

type HeaderLogoProps = {
  variant?: HeaderVariant;
};
export default function HeaderLogo({ variant = "default" }: HeaderLogoProps) {
  const isLanding = variant === "landing";
  return (
    <Link
      href="/"
      className={
        isLanding
          ? "flex shrink-0 items-center gap-1.5 text-sm font-bold text-ink hover:opacity-80 sm:text-base md:gap-2 md:text-lg"
          : "flex shrink-0 items-center gap-1.5 text-sm font-bold text-accent hover:opacity-80 sm:text-base md:gap-2 md:text-lg"
      }
    >
      <Image
        src={PravaLogo}
        alt="prava.ge"
        width={32}
        height={32}
        className="rounded-full"
      />
      <span className="hidden sm:inline">prava.ge</span>
    </Link>
  );
}
