"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/LocaleSwitcher/LocaleSwitcher";
import { useUser } from "@/contexts/UserContext";
import { headerAuthLink, headerAuthLogin } from "./headerStyles";

export default function HeaderAuth() {
  const user = useUser();
  const t = useTranslations("Auth");

  return (
    <>
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
