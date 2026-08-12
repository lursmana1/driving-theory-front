"use client";

import { useEffect } from "react";
import Header from "@/layoutComponents/Header/Header";
import { usePathname } from "@/i18n/navigation";

export function AppShell({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const pathname = usePathname();
  const isMinimalChrome =
    pathname === "/exam" ||
    pathname.startsWith("/exam/") ||
    pathname === "/auth" ||
    pathname.startsWith("/auth/");

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  if (isMinimalChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}
