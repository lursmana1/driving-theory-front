"use client";

import { useEffect } from "react";
import { ConfigProvider } from "antd";
import Header from "@/layoutComponents/Header/Header";
import { usePathname } from "@/i18n/navigation";
import { BRAND_ACCENT, BRAND_ACCENT_STRONG } from "@/CONSTS/landing";

const antdTheme = {
  token: {
    colorPrimary: BRAND_ACCENT,
    colorLink: BRAND_ACCENT,
    colorLinkHover: BRAND_ACCENT_STRONG,
    colorInfo: BRAND_ACCENT,
  },
};

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

  return (
    <ConfigProvider theme={antdTheme}>
      {!isMinimalChrome && <Header />}
      {children}
    </ConfigProvider>
  );
}
