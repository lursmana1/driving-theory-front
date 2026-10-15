import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { navLinks } from "@/CONSTS/navLinks";
import { headerNavLink, headerNavLinkActive } from "./headerStyles";
import HeaderMoreInfo from "./HeaderMoreInfo";

function isActivePath(pathname: string, href: string) {
  const base = href.split("?")[0].replace(/\/\d+$/, "");
  if (base === "/") return pathname === "/";
  return pathname === base || pathname.startsWith(`${base}/`);
}

export default function HeaderNav() {
  const t = useTranslations("Header");
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main navigation"
      className="ml-0.5 hidden flex-nowrap items-center gap-0.5 lg:ml-2 lg:flex lg:gap-1"
    >
      {navLinks.map((link) => {
        const active = isActivePath(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`${headerNavLink} ${active ? headerNavLinkActive : ""}`}
          >
            {t(link.labelKey)}
          </Link>
        );
      })}
      <HeaderMoreInfo />
    </nav>
  );
}
