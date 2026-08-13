import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

/** Server-only locale-aware redirect. Always pass locale — next-intl needs it. */
export async function redirectTo(href: string): Promise<never> {
  const locale = await getLocale();
  return redirect({ href, locale }) as never;
}
