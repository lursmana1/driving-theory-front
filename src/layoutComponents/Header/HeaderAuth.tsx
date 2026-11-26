"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/LocaleSwitcher/LocaleSwitcher";
import { useUser } from "@/contexts/UserContext";
import FireImage from "../../../public/images/jpg/fire.webp";
import HeaderNotifications from "./HeaderNotifications";
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";
import {
  headerAuthLink,
  headerAuthLogin,
  headerStreak,
} from "./headerStyles";

export default function HeaderAuth() {
  const user = useUser();
  const t = useTranslations("Auth");

  return (
    <>
      <HeaderNotifications />
      {/* Phones: the streak is a row in the menu (BurgerMenu), the theme button stays here. */}
      {user?.streak && user.streak.current > 0 && (
        <Link
          href="/profile"
          aria-label={t("streakLabel", { count: user.streak.current })}
          title={t("streakDayHint")}
          className={`${headerStreak} max-sm:hidden`}
        >
          <Image src={FireImage} alt="" aria-hidden className="h-4 w-auto" />
          {user.streak.current}
        </Link>
      )}
      <ThemeToggle />
      <div className="flex shrink-0 items-center">
        <LocaleSwitcher />
      </div>
      <div className="hidden shrink-0 items-center lg:flex lg:gap-2">
        {user ? (
          <Link href="/profile" className={headerAuthLink}>
            {t("profile")}
          </Link>
        ) : (
          <Link href="/auth" className={headerAuthLogin}>
            {t("login")}
          </Link>
        )}
      </div>
    </>
  );
}
