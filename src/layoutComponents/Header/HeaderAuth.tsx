"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/LocaleSwitcher/LocaleSwitcher";
import { useUser } from "@/contexts/UserContext";
import FireImage from "../../../public/images/jpg/fire.webp";
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
      {user?.streak && user.streak.current > 0 && (
        <Link
          href="/profile"
          aria-label={t("streakLabel", { count: user.streak.current })}
          className={headerStreak}
        >
          <Image src={FireImage} alt="" aria-hidden className="h-4 w-auto" />
          {user.streak.current}
        </Link>
      )}
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
