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
          ? "flex shrink-0 items-center gap-1.5 text-sm font-bold text-white hover:opacity-90 sm:text-base md:gap-2 md:text-lg"
          : "flex shrink-0 items-center gap-1.5 text-sm font-bold text-blue-600 hover:opacity-80 sm:text-base md:gap-2 md:text-lg"
      }
    >
      <Image src={PravaLogo} alt="prava.ge" width={32} height={32} />
      <span className="hidden sm:inline">prava.ge</span>
    </Link>
  );
}
