"use client";

import { usePathname } from "@/i18n/navigation";
import HeaderLogo from "./HeaderLogo";
import HeaderNav from "./HeaderNav";
import HeaderAuth from "./HeaderAuth";
import BurgerMenu from "./BurgerMenu";

export default function HeaderShell() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <header
      className={
        isLanding
          ? "sticky top-0 z-50 border-b border-hairline bg-paper/95 backdrop-blur-md"
          : "sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur"
      }
    >
      <div className="section flex h-12 items-center justify-between gap-2 sm:h-14 lg:h-16">
        <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
          <HeaderLogo variant={isLanding ? "landing" : "default"} />
          <HeaderNav variant={isLanding ? "landing" : "default"} />
        </div>
        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <HeaderAuth variant={isLanding ? "landing" : "default"} />
          <BurgerMenu variant={isLanding ? "landing" : "default"} />
        </div>
      </div>
    </header>
  );
}
