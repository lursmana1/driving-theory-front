import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { getMetadataBaseUrl, siteMetadata } from "@/lib/site-metadata";

const handleI18nRouting = createMiddleware(routing);

function canonicalHostname(): string {
  try {
    return new URL(getMetadataBaseUrl()).hostname.toLowerCase();
  } catch {
    return new URL(siteMetadata.url).hostname.toLowerCase();
  }
}

/** www.prava.ge → prava.ge (308). Canonicals already use the apex host. */
function apexHostRedirect(request: NextRequest): NextResponse | null {
  const hostname = (request.headers.get("host") ?? "").split(":")[0]?.toLowerCase() ?? "";
  const apex = canonicalHostname();
  if (!apex || hostname !== `www.${apex}`) return null;
  return NextResponse.redirect(
    `${getMetadataBaseUrl()}${request.nextUrl.pathname}${request.nextUrl.search}`,
    308,
  );
}

/** 308 so Google consolidates `/ka` onto the unprefixed Georgian homepage. */
function proxy(request: NextRequest) {
  const hostRedirect = apexHostRedirect(request);
  if (hostRedirect) return hostRedirect;

  const response = handleI18nRouting(request);
  if (response.status !== 307) return response;

  return new NextResponse(response.body, {
    status: 308,
    headers: response.headers,
  });
}

export default proxy;
export { proxy };

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|CONSTS|.*\\..*).*)",
};
