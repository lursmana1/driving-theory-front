"use client";

import Header from "@/layoutComponents/Header/Header";
import { usePathname } from "@/i18n/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isExam =
    pathname === "/exam" || pathname.startsWith("/exam/");

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
