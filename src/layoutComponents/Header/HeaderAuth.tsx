"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/LocaleSwitcher/LocaleSwitcher";
import { useUser } from "@/contexts/UserContext";
import type { HeaderVariant } from "./headerVariants";
import { headerAuthLink, headerAuthLogin } from "./headerVariants";

type HeaderAuthProps = {
  variant?: HeaderVariant;
};

export default function HeaderAuth({ variant = "default" }: HeaderAuthProps) {
  const user = useUser();
  const t = useTranslations("Auth");
  const linkClass = headerAuthLink[variant];
  const loginClass = headerAuthLogin[variant];

  return (
    <>
      <div className="flex shrink-0 items-center">
        <LocaleSwitcher variant={variant} />
      </div>
      <div className="hidden shrink-0 items-center lg:flex lg:gap-2">
        {user ? (
          <Link href="/profile" className={linkClass}>
            {t("profile")}
          </Link>
        ) : (
          <Link href="/auth" className={loginClass}>
            {t("login")}
          </Link>
        )}
      </div>
    </>
  );
}
