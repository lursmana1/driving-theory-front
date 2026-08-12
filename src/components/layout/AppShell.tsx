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
  const isExam = pathname === "/exam" || pathname.startsWith("/exam/");

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  if (isExam) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}
