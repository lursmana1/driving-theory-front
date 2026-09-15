import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

/** 308 so Google consolidates `/ka` onto the unprefixed Georgian homepage. */
function proxy(request: NextRequest) {
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
