import "server-only";

/**
 * IndexNow: tells Bing, Yandex, Seznam, Naver… that pages changed (one request reaches all of them).
 * The key is public by design and is served from public/<key>.txt.
 * Keep it in sync with scripts/indexnow.mjs.
 */
export const INDEXNOW_KEY = "543db3f83322498a845684115ad56772";
const HOST = "prava.ge";
const ENDPOINT = "https://api.indexnow.org/indexnow";

export async function submitToIndexNow(urls: string[]): Promise<number> {
  const urlList = [...new Set(urls)].filter((url) => new URL(url).host === HOST);
  if (urlList.length === 0) return 204;
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
    signal: AbortSignal.timeout(8000),
  });
  return res.status;
}
