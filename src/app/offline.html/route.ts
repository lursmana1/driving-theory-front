import { color, fontFamily, radius } from "@/styles/tokens";
import ka from "../../../messages/ka.json";
import en from "../../../messages/en.json";
import ru from "../../../messages/ru.json";

/**
 * Offline fallback served by `public/sw.js`. Plain HTML with no Next.js
 * scripts: a Next page shown under another URL tries to load its chunks and
 * crashes when there is no network. Language comes from the URL it's shown at.
 */
export const dynamic = "force-static";

const copy = { ka: ka.Pwa, en: en.Pwa, ru: ru.Pwa };

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`);
}

export function GET() {
  const strings = Object.fromEntries(
    Object.entries(copy).map(([locale, t]) => [
      locale,
      { title: t.offlineTitle, text: t.offlineText, retry: t.offlineRetry },
    ]),
  );
  const ka = strings.ka;

  const html = `<!doctype html>
<html lang="ka">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="theme-color" content="${color.canvas}">
<title>${escapeHtml(ka.title)}</title>
<style>
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 24px; box-sizing: border-box; background: ${color.canvas}; color: ${color.fg};
    font-family: ${fontFamily.replace(/var\([^)]*\),\s*/g, "")}; text-align: center; }
  main { max-width: 28rem; }
  img { width: 64px; height: 64px; border-radius: ${radius.card}px; }
  h1 { margin: 24px 0 0; font-size: 1.5rem; font-weight: 600; }
  p { margin: 12px 0 0; color: ${color.fgMuted}; line-height: 1.5; }
  button { margin-top: 32px; height: 48px; padding: 0 24px; border: 0; border-radius: ${radius.control}px;
    background: ${color.accent}; color: ${color.canvas}; font: inherit; font-weight: 600; cursor: pointer; }
  button:hover { background: ${color.accentStrong}; }
</style>
</head>
<body>
<main>
  <img src="/icons/icon-192.png" alt="prava.ge" width="64" height="64">
  <h1 id="t">${escapeHtml(ka.title)}</h1>
  <p id="x">${escapeHtml(ka.text)}</p>
  <button type="button" id="r" onclick="location.reload()">${escapeHtml(ka.retry)}</button>
</main>
<script>
  (function () {
    var all = ${JSON.stringify(strings).replace(/</g, "\\u003c")};
    var m = location.pathname.match(/^\\/(en|ru)(?=\\/|$)/);
    var s = m && all[m[1]];
    if (!s) return;
    document.documentElement.lang = m[1];
    document.title = s.title;
    document.getElementById("t").textContent = s.title;
    document.getElementById("x").textContent = s.text;
    document.getElementById("r").textContent = s.retry;
  })();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
