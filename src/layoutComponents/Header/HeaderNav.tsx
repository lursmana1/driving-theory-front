import { Link } from "@/i18n/navigation";
import { navLinks } from "@/CONSTS/navLinks";
import type { HeaderVariant } from "./headerVariants";
import { headerNavLink } from "./headerVariants";

type HeaderNavProps = {
  variant?: HeaderVariant;
};

export default function HeaderNav({ variant = "default" }: HeaderNavProps) {
  const navLinkClass = headerNavLink[variant];
  return (
    <nav
      aria-label="Main navigation"
      className="ml-0.5 hidden flex-nowrap items-center gap-0.5 md:ml-2 md:flex md:gap-1"
    >
      {navLinks.map((link) => (
        <Link key={link.href} href={link.href} className={navLinkClass}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
