import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Georgian } from "next/font/google";
import Script from "next/script";
import { preconnect } from "react-dom";
import { getLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getMetadataBaseUrl, siteMetadata } from "@/lib/site-metadata";
import { color, darkColor } from "@/styles/tokens";
import { THEME_INIT_SCRIPT } from "@/utills/helpers/theme";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansGeorgian = Noto_Sans_Georgian({
  variable: "--font-georgian",
  subsets: ["georgian", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getMetadataBaseUrl()),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.shortTitle ?? siteMetadata.name}`,
  },
  description: siteMetadata.description,
  keywords: siteMetadata.keywords,
  applicationName: siteMetadata.name,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: color.canvas },
    { media: "(prefers-color-scheme: dark)", color: darkColor.canvas },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = (await getLocale().catch(() => routing.defaultLocale)) as string;
  if (process.env.NODE_ENV === "production") {
    // analytics: open the connections early, the script itself loads when the page is idle
    preconnect("https://cloud.umami.is");
    preconnect("https://gateway.umami.is");
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Before the first paint: the saved theme, else the system one (no
            white flash). next/script, not <script>: React doesn't run plain
            script tags on pages it renders on the client (e.g. not-found). */}
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansGeorgian.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        {process.env.NODE_ENV === "production" ? (
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id="057369d0-1bed-428b-9e09-f25863e52de4"
            // after the page is idle, so it does not compete with React on slow phones
            strategy="lazyOnload"
          />
        ) : null}
      </body>
    </html>
  );
}
