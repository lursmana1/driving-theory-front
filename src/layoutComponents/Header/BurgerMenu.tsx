"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/LocaleSwitcher/LocaleSwitcher";
import { navLinks } from "@/CONSTS/navLinks";
import { useUser } from "@/contexts/UserContext";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { HeaderVariant } from "./headerVariants";

/** Dark drawer (matches landing / reference UI) */
const drawerBg =
  "border-b border-white/10 bg-[#0d1117] shadow-xl shadow-black/40";

/** Same vertical rhythm + light text on dark */
const mobileNavItem =
  "flex min-h-12 w-full items-center rounded-lg px-0 py-3 text-base font-medium leading-snug text-white/95 transition-colors hover:bg-white/10 active:bg-white/15";

type BurgerMenuProps = {
  variant?: HeaderVariant;
};

export default function BurgerMenu({ variant = "default" }: BurgerMenuProps) {
  const isLanding = variant === "landing";
  const user = useUser();
  const tAuth = useTranslations("Auth");
  const tHome = useTranslations("Home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const closeMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setMenuOpen(false);
      setIsClosing(false);
    }, 200);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    if (menuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const bar = isLanding ? "bg-white" : "bg-slate-700";
  const btnWrap = isLanding ? "hover:bg-white/10" : "hover:bg-slate-100";

  return (
    <>
      <button
        type="button"
        onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        className={`relative z-60 flex h-10 w-10 shrink-0 touch-manipulation flex-col items-center justify-center gap-1.5 rounded-lg transition-colors ${btnWrap} md:hidden`}
      >
        <span
          className={`block h-0.5 w-6 rounded-full transition-all duration-200 ${bar} ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
        />
        <span
          className={`block h-0.5 w-6 rounded-full transition-all duration-200 ${bar} ${menuOpen ? "opacity-0 scale-0" : ""}`}
        />
        <span
          className={`block h-0.5 w-6 rounded-full transition-all duration-200 ${bar} ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
        />
      </button>

      {menuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className={`fixed inset-x-0 bottom-0 top-12 z-100 bg-black/55 backdrop-blur-sm transition-opacity duration-200 sm:top-14 md:hidden ${
                isClosing ? "opacity-0" : "opacity-100"
              }`}
              aria-hidden
              onClick={closeMenu}
            />
            <nav
              id="mobile-menu"
              role="navigation"
              aria-label="Mobile navigation"
              className={`fixed left-0 right-0 top-12 z-110 max-h-[min(100dvh-3rem,calc(100vh-3rem))] overflow-y-auto sm:top-14 md:hidden ${drawerBg} ${
                isClosing ? "burger-menu-exit" : "burger-menu-enter"
              }`}
            >
              <div className="section flex flex-col pb-4 pt-2">
                <ul className="flex flex-col">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className={mobileNavItem}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 border-t border-white/10 pt-6">
                  <div className="flex min-h-12 items-center justify-between gap-4">
                    {user ? (
                      <Link
                        href="/profile"
                        onClick={closeMenu}
                        className="inline-flex min-h-10 flex-1 items-center text-base font-medium text-white/95 hover:text-white"
                      >
                        <span className="line-clamp-2 break-all text-left">
                          {user.name || user.email}
                        </span>
                      </Link>
                    ) : (
                      <Link
                        href="/auth"
                        onClick={closeMenu}
                        className="inline-flex min-h-10 flex-1 items-center text-base font-medium text-white/95 hover:text-white"
                      >
                        {tAuth("login")}
                      </Link>
                    )}
                    <div className="flex shrink-0 items-center self-center">
                      <LocaleSwitcher variant="landing" />
                    </div>
                  </div>

                  <Link
                    href="/exam"
                    onClick={closeMenu}
                    className="mt-5 flex min-h-12 w-full items-center justify-center rounded-full bg-linear-to-r from-[#2b65f0] to-[#8e44ad] px-6 text-center text-base font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:brightness-110"
                  >
                    {tHome("headerStartExam")}
                  </Link>
                </div>
              </div>
            </nav>
          </>,
          document.body,
        )}
    </>
  );
}
