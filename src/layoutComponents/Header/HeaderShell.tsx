"use client";

import HeaderLogo from "./HeaderLogo";
import HeaderNav from "./HeaderNav";
import HeaderAuth from "./HeaderAuth";
import BurgerMenu from "./BurgerMenu";

export default function HeaderShell() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/90 backdrop-blur-md">
      <div className="section flex h-12 items-center justify-between gap-2 sm:h-14 lg:h-16">
        <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
          <HeaderLogo />
          <HeaderNav />
        </div>
        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <HeaderAuth />
          <BurgerMenu />
        </div>
      </div>
    </header>
  );
}
