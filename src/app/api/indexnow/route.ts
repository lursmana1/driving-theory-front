import { NextResponse, type NextRequest } from "next/server";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { absoluteUrl } from "@/lib/seo";
import { routing } from "@/i18n/routing";
import { submitToIndexNow } from "@/lib/indexNow";

const POST_PATH = /^\/blogs\/(\d+)$/;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * The login cookie belongs to api.prava.ge, so this route can't see who is signed in.
 * Instead it only accepts a post that really exists and was created in the last 24 h:
 * the worst a stranger can do is announce a real, new prava.ge post again.
 */
async function isNewPost(id: string): Promise<boolean> {
  const base = getApiBaseUrl();
  if (!base) return false;
  try {
    const res = await fetch(`${base}/blogs/${id}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return false;
    const blog = (await res.json()) as { createdAt?: string } | null;
    const created = blog?.createdAt ? Date.parse(blog.createdAt) : NaN;
    return Number.isFinite(created) && Date.now() - created < MAX_AGE_MS;
  } catch {
    return false;
  }
}

/** POST { id: 24 } — called by /createblog right after a post is created. */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
  const id = String(body?.id ?? "");
  const path = `/blogs/${id}`;
  if (!POST_PATH.test(path) || !(await isNewPost(id))) {
    return NextResponse.json({ error: "not a new post" }, { status: 400 });
  }

  // Blog posts are Georgian only, so only the default-locale URLs are submitted.
  const urls = [path, "/blogs"].map((p) => absoluteUrl(p, routing.defaultLocale));
  try {
    const status = await submitToIndexNow(urls);
    return NextResponse.json({ status, urls }, { status: status < 400 ? 200 : 502 });
  } catch {
    return NextResponse.json({ error: "indexnow unreachable" }, { status: 502 });
  }
}
