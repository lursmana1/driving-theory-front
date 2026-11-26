"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "@/layoutComponents/Header/Header";
import { ServiceWorkerRegister } from "@/components/Pwa/ServiceWorkerRegister";
import { usePathname } from "@/i18n/navigation";
import { ensureTheme } from "@/utills/helpers/theme";

/** antd theme provider in its own chunk: pages without antd never download antd's runtime. */
const AntdTheme = dynamic(() => import("./AntdTheme"));

/** Routes that render no antd component. */
const NO_ANTD_PATHS = new Set(["/"]);

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

  useEffect(ensureTheme, []);

  return (
    <>
      {!isMinimalChrome && <Header />}
      {NO_ANTD_PATHS.has(pathname) ? (
        children
      ) : (
        <AntdTheme>{children}</AntdTheme>
      )}
      <ServiceWorkerRegister />
    </>
  );
}
