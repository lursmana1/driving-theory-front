"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { navLinks } from "@/CONSTS/navLinks";
import { moreInfoLinks } from "@/CONSTS/moreInfoLinks";
import { useUser } from "@/contexts/UserContext";
import { InstallAppItem } from "@/components/Pwa/InstallAppItem";
import { useInstallPrompt } from "@/utills/helpers/hooks/useInstallPrompt";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  burgerAccountLink,
  burgerDivider,
  burgerDrawer,
  burgerNavItem,
  burgerOverlay,
} from "./headerStyles";

export default function BurgerMenu() {
  const user = useUser();
  const tAuth = useTranslations("Auth");
  const tHeader = useTranslations("Header");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { canInstall, install, guide } = useInstallPrompt();

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

  return (
    <>
      <button
        type="button"
        onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        className={`relative z-60 flex h-10 w-10 shrink-0 touch-manipulation flex-col items-center justify-center gap-1.5 rounded-control transition-colors hover:bg-fg/5 lg:hidden`}
      >
        <span
          className={`block h-0.5 w-6 rounded-full transition-all duration-200 bg-fg ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
        />
        <span
          className={`block h-0.5 w-6 rounded-full transition-all duration-200 bg-fg ${menuOpen ? "opacity-0 scale-0" : ""}`}
        />
        <span
          className={`block h-0.5 w-6 rounded-full transition-all duration-200 bg-fg ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
        />
      </button>

      {menuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className={`fixed inset-x-0 bottom-0 top-12 z-100 backdrop-blur-sm transition-opacity duration-200 sm:top-14 lg:hidden ${burgerOverlay} ${
                isClosing ? "opacity-0" : "opacity-100"
              }`}
              aria-hidden
              role="dialog"
              onClick={closeMenu}
            />
            <nav
              id="mobile-menu"
              role="navigation"
              aria-label="Mobile navigation"
              className={`fixed left-0 right-0 top-12 z-110 max-h-[min(100dvh-3rem,calc(100vh-3rem))] overflow-y-auto sm:top-14 lg:hidden ${burgerDrawer} ${
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
                        className={burgerNavItem}
                      >
                        {tHeader(link.labelKey)}
                      </Link>
                    </li>
                  ))}
                  <li className="pt-2">
                    <p className="px-0 py-2 text-xs font-semibold uppercase tracking-wide text-fg-faint">
                      {tHeader("navMoreInfo")}
                    </p>
                    <ul className="flex flex-col">
                      {moreInfoLinks.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            onClick={closeMenu}
                            className={burgerNavItem}
                          >
                            {tHeader(link.labelKey)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>

                <div className={burgerDivider}>
                  {user ? (
                    <Link
                      href="/profile"
                      onClick={closeMenu}
                      className={burgerAccountLink}
                    >
                      <span className="text-left">{tAuth("profile")}</span>
                    </Link>
                  ) : (
                    <Link
                      href="/auth"
                      onClick={closeMenu}
                      className={burgerAccountLink}
                    >
                      {tAuth("login")}
                    </Link>
                  )}
                  <div className="mt-2">
                    <InstallAppItem
                      canInstall={canInstall}
                      guide={guide}
                      onInstall={() => {
                        closeMenu();
                        void install();
                      }}
                    />
                  </div>
                </div>
              </div>
            </nav>
          </>,
          document.body,
        )}
    </>
  );
}
