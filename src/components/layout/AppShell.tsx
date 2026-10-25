"use client";

import { useEffect } from "react";
import { ConfigProvider } from "antd";
import Header from "@/layoutComponents/Header/Header";
import { ServiceWorkerRegister } from "@/components/Pwa/ServiceWorkerRegister";
import { usePathname } from "@/i18n/navigation";
import type { ThemeConfig } from "antd";
import { color, fontFamily, radius } from "@/styles/tokens";

/** Ant Design reads the same design tokens as Tailwind (see src/styles/tokens.ts). */
const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: color.accent,
    colorLink: color.accent,
    colorLinkHover: color.accentStrong,
    colorInfo: color.accent,
    colorSuccess: color.success,
    colorError: color.danger,
    colorWarning: color.warning,
    colorText: color.fg,
    colorTextSecondary: color.fgMuted,
    colorTextTertiary: color.fgSubtle,
    colorTextQuaternary: color.fgFaint,
    colorBorder: color.line,
    colorBorderSecondary: color.lineSubtle,
    colorBgContainer: color.surface,
    colorBgElevated: color.surface,
    colorBgLayout: color.canvas,
    colorFillAlter: color.surfaceMuted,
    colorFillSecondary: color.surfaceSunken,
    fontFamily,
    borderRadius: radius.control,
    borderRadiusLG: radius.card,
    borderRadiusSM: radius.xs,
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
      <ServiceWorkerRegister />
    </ConfigProvider>
  );
}
