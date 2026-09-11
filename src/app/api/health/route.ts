export const dynamic = "force-dynamic";

/** Container health probe. Outside the locale proxy, so no redirect. */
export function GET() {
  return new Response("ok", {
    status: 200,
    headers: { "cache-control": "no-store" },
  });
}
