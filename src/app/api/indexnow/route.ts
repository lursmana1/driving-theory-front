import { NextResponse, type NextRequest } from "next/server";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { absoluteUrl } from "@/lib/seo";
import { routing } from "@/i18n/routing";
import { submitToIndexNow } from "@/lib/indexNow";

/** Paths an admin may push to IndexNow after publishing (blog posts and the blog list). */
const ALLOWED_PATH = /^\/blogs(\/\d+)?$/;

async function isAdmin(request: NextRequest): Promise<boolean> {
  const base = getApiBaseUrl();
  const cookie = request.headers.get("cookie");
  if (!base || !cookie) return false;
  try {
    const res = await fetch(`${base}/auth/me`, {
      headers: { Cookie: cookie, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return false;
    const me = (await res.json()) as { type?: string } | null;
    return me?.type === "admin";
  } catch {
    return false;
  }
}

/** POST { paths: ["/blogs/24", "/blogs"] } — called by /createblog after a post is created. */
export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { paths?: unknown } | null;
  const paths = Array.isArray(body?.paths)
    ? body.paths.filter((p): p is string => typeof p === "string" && ALLOWED_PATH.test(p))
    : [];
  if (paths.length === 0) {
    return NextResponse.json({ error: "no valid paths" }, { status: 400 });
  }

  // Blog posts are Georgian only, so only the default-locale URLs are submitted.
  const urls = paths.map((p) => absoluteUrl(p, routing.defaultLocale));
  try {
    const status = await submitToIndexNow(urls);
    return NextResponse.json({ status, urls }, { status: status < 400 ? 200 : 502 });
  } catch {
    return NextResponse.json({ error: "indexnow unreachable" }, { status: 502 });
  }
}
