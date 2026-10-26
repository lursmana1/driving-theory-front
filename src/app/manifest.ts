import type { MetadataRoute } from "next";
import { siteMetadata } from "@/lib/site-metadata";
import { color } from "@/styles/tokens";
import ka from "../../messages/ka.json";

/** Installable app (PWA). The service worker is `public/sw.js`. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: ka.Pwa.appName,
    short_name: siteMetadata.shortTitle ?? siteMetadata.name,
    description: siteMetadata.description,
    lang: "ka",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: color.canvas,
    theme_color: color.canvas,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // the logo sits inside the maskable safe zone, so the same file works
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: ka.Header.navTickets, url: "/tickets" },
      { name: ka.Header.navExam, url: "/subjectpicker" },
      { name: ka.Header.navSigns, url: "/signs" },
    ],
  };
}
