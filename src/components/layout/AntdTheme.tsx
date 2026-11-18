"use client";

import { ConfigProvider } from "antd";
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

/** Loaded lazily by `AppShell`, so pages without antd (the landing page) skip antd's runtime. */
export default function AntdTheme({ children }: { children: React.ReactNode }) {
  return <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>;
}
