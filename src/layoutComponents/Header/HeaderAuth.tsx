"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/LocaleSwitcher/LocaleSwitcher";
import { useUser } from "@/contexts/UserContext";
import type { HeaderVariant } from "./headerVariants";
import { headerAuthLink } from "./headerVariants";

type HeaderAuthProps = {
  variant?: HeaderVariant;
};

export default function HeaderAuth({ variant = "default" }: HeaderAuthProps) {
  const user = useUser();
  const t = useTranslations("Auth");
  const linkClass = headerAuthLink[variant];

  return (
    <>
      <div className="flex shrink-0 items-center">
        <LocaleSwitcher variant={variant} />
      </div>
      <div className="hidden shrink-0 items-center md:flex md:gap-2">
        {user ? (
          <Link href="/profile" className={linkClass}>
            {user.name || user.email}
          </Link>
        ) : (
          <Link href="/auth" className={linkClass}>
            {t("login")}
          </Link>
        )}
      </div>
    </>
  );
}
