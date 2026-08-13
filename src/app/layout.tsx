import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Georgian } from "next/font/google";
import { siteMetadata } from "@/lib/site-metadata";
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
  metadataBase: new URL(siteMetadata.url),
  title: {
    default: siteMetadata.name,
    template: `%s | ${siteMetadata.shortTitle ?? siteMetadata.name}`,
  },
  description: siteMetadata.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030712",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansGeorgian.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
