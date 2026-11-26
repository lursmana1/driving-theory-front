/**
 * Raw hex mirror of the design tokens in `src/app/globals.css`.
 *
 * Components style with Tailwind token classes (`bg-surface`, `text-fg-muted`, …).
 * Use this file only where a class can't reach: Ant Design theme, SVG
 * gradients, `next/og` images. Keep both files in sync.
 */
export const palette = {
  neutral0: "#ffffff",
  neutral50: "#f8f9fb",
  neutral100: "#f2f4f7",
  neutral150: "#eceff3",
  neutral200: "#e3e7ec",
  neutral300: "#d3d9e0",
  neutral400: "#aeb6c1",
  neutral500: "#848d9a",
  neutral600: "#5f6875",
  neutral700: "#464e5a",
  neutral800: "#2d343e",
  neutral900: "#1a1f27",

  brand50: "#eef3f8",
  brand100: "#d9e4ef",
  brand500: "#2c5d8c",
  brand600: "#234c74",
  brand700: "#1c3c5c",

  olive100: "#e4e9d5",
  olive400: "#7f8c56",
  olive500: "#59663c",

  green500: "#3f8a4b",
  red500: "#c3394a",
  amber500: "#c48b1c",

  stage900: "#16202b",
} as const;

/** Semantic aliases — same names as the Tailwind color tokens. */
export const color = {
  canvas: palette.neutral0,
  surface: palette.neutral0,
  surfaceMuted: palette.neutral50,
  surfaceSunken: palette.neutral100,
  surfaceStrong: palette.neutral200,
  inverse: palette.neutral900,
  fg: palette.neutral900,
  fgMuted: palette.neutral700,
  fgSubtle: palette.neutral600,
  fgFaint: "#6a7381",
  fgInverse: palette.neutral50,
  line: palette.neutral300,
  lineSubtle: palette.neutral200,
  lineStrong: palette.neutral400,
  accent: palette.brand500,
  accentStrong: palette.brand600,
  accentSoft: palette.brand50,
  secondary: palette.neutral800,
  success: palette.green500,
  danger: palette.red500,
  warning: palette.amber500,
  stage: palette.stage900,
} as const;

/**
 * Dark theme values for the few places that can't read CSS variables (Ant
 * Design's algorithm input, `<meta name="theme-color">`). Same as
 * `:root[data-theme="dark"]` in globals.css. OG images and the manifest
 * stay light on purpose.
 */
export const darkColor = {
  canvas: "#0d1116",
  surface: "#131820",
  surfaceMuted: "#181e27",
  surfaceSunken: "#1e2530",
  fg: "#e6eaf0",
  fgMuted: "#b9c2cd",
  fgSubtle: "#96a1ae",
  fgFaint: "#8590a0",
  line: "#323c49",
  lineSubtle: "#27303c",
  accent: "#6ea0d2",
  accentStrong: "#8cb5de",
  success: "#5fb46b",
  danger: "#e8737b",
  warning: "#e0a93a",
} as const;

export const radius = {
  xs: 6,
  control: 12,
  card: 16,
  panel: 24,
} as const;

export const fontFamily =
  "var(--font-georgian), var(--font-geist-sans), system-ui, sans-serif";
