"use client";

import { useMemo } from "react";
import { ConfigProvider, theme as antdThemes } from "antd";
import type { ThemeConfig } from "antd";
import { color, darkColor, fontFamily, radius } from "@/styles/tokens";
import { useTheme } from "@/utills/helpers/hooks/useTheme";

/** The colours antd needs; both palettes have them. */
type Palette = Record<keyof typeof darkColor, string>;

/** Ant Design reads the same design tokens as Tailwind (see src/styles/tokens.ts). */
function antdTheme(dark: boolean): ThemeConfig {
  const c: Palette = dark ? darkColor : color;
  return {
    algorithm: dark ? antdThemes.darkAlgorithm : antdThemes.defaultAlgorithm,
    token: {
      colorPrimary: c.accent,
      colorLink: c.accent,
      colorLinkHover: c.accentStrong,
      colorInfo: c.accent,
      colorSuccess: c.success,
      colorError: c.danger,
      colorWarning: c.warning,
      colorText: c.fg,
      colorTextSecondary: c.fgMuted,
      colorTextTertiary: c.fgSubtle,
      colorTextQuaternary: c.fgFaint,
      colorBorder: c.line,
      colorBorderSecondary: c.lineSubtle,
      colorBgContainer: c.surface,
      colorBgElevated: c.surface,
      colorBgLayout: c.canvas,
      colorFillAlter: c.surfaceMuted,
      colorFillSecondary: c.surfaceSunken,
      fontFamily,
      borderRadius: radius.control,
      borderRadiusLG: radius.card,
      borderRadiusSM: radius.xs,
    },
  };
}

/** Loaded lazily by `AppShell`, so pages without antd (the landing page) skip antd's runtime. */
export default function AntdTheme({ children }: { children: React.ReactNode }) {
  const dark = useTheme() === "dark";
  const config = useMemo(() => antdTheme(dark), [dark]);
  return <ConfigProvider theme={config}>{children}</ConfigProvider>;
}
