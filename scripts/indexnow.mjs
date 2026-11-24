#!/usr/bin/env node
/* eslint-disable no-console -- CLI script, output is the point */
/**
 * IndexNow: tell Bing, Yandex, Seznam, Naver… that pages changed, so they recrawl within hours.
 * One request to api.indexnow.org is shared with every participating engine.
 *
 *   node scripts/indexnow.mjs https://prava.ge/blogs/24 /en/blogs/24   # specific pages (paths are fine)
 *   node scripts/indexnow.mjs --all                                     # every URL in the live sitemap
 *   node scripts/indexnow.mjs --all --dry                               # print, send nothing
 *
 * Send only pages that are new or changed (a new blog post, a page whose text changed).
 * `--all` is for after a deploy that changed many pages, not for every deploy.
 * The key is public by design: it is served at https://prava.ge/<key>.txt (public/<key>.txt).
 */

const HOST = "prava.ge";
const ORIGIN = `https://${HOST}`;
const KEY = "543db3f83322498a845684115ad56772";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_PER_REQUEST = 10_000;

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const all = args.includes("--all");
const inputs = args.filter((a) => !a.startsWith("--"));

function toUrl(value) {
  const url = new URL(value, ORIGIN);
  if (url.host !== HOST) throw new Error(`Not a ${HOST} URL: ${value}`);
  return url.href;
}

async function sitemapUrls() {
  const res = await fetch(`${ORIGIN}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml: HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, "&"));
}

async function checkKey() {
  const res = await fetch(`${ORIGIN}/${KEY}.txt`);
  const body = res.ok ? (await res.text()).trim() : "";
  if (body !== KEY) {
    throw new Error(`${ORIGIN}/${KEY}.txt does not serve the key (HTTP ${res.status}). Deploy public/${KEY}.txt first.`);
  }
}

async function main() {
  if (!all && inputs.length === 0) {
    console.error("Usage: node scripts/indexnow.mjs <url|path>... | --all [--dry]");
    process.exit(1);
  }
  const urls = [...new Set(all ? await sitemapUrls() : inputs.map(toUrl))];
  console.log(`${urls.length} URL(s)`);
  if (dry) {
    urls.forEach((u) => console.log("  " + u));
    return;
  }
  await checkKey();

  for (let i = 0; i < urls.length; i += MAX_PER_REQUEST) {
    const urlList = urls.slice(i, i + MAX_PER_REQUEST);
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${ORIGIN}/${KEY}.txt`, urlList }),
    });
    // 200 = accepted, 202 = accepted, key check pending. 403/422 = key or URL problem, 429 = too often.
    const text = await res.text();
    console.log(`IndexNow: HTTP ${res.status}${text ? " " + text.slice(0, 300) : ""} (${urlList.length} URLs)`);
    if (res.status >= 400) process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
