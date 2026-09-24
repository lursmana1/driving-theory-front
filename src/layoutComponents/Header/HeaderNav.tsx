import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { navLinks } from "@/CONSTS/navLinks";
import type { HeaderVariant } from "./headerVariants";
import { headerNavLink } from "./headerVariants";
import HeaderMoreInfo from "./HeaderMoreInfo";

type HeaderNavProps = {
  variant?: HeaderVariant;
};

export default function HeaderNav({ variant = "default" }: HeaderNavProps) {
  const t = useTranslations("Header");
  const navLinkClass = headerNavLink[variant];
  return (
    <nav
      aria-label="Main navigation"
      className="ml-0.5 hidden flex-nowrap items-center gap-0.5 lg:ml-2 lg:flex lg:gap-1"
    >
      {navLinks.map((link) => (
        <Link key={link.href} href={link.href} className={navLinkClass}>
          {t(link.labelKey)}
        </Link>
      ))}
      <HeaderMoreInfo variant={variant} />
    </nav>
  );
}
