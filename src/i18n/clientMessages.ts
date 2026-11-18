import type { AbstractIntlMessages } from "next-intl";

/**
 * Namespaces that client components read with `useTranslations` on any page.
 * Everything else (Meta, Home, Blogs, CityExamPage, YardExamPage, …) is only
 * used by server components, so it is not serialized into every page's HTML.
 * Page-specific client namespaces are added by that route's layout
 * (e.g. `StudyPlan` in `app/[locale]/plan/layout.tsx`).
 *
 * Adding `useTranslations("X")` to a client component? Add "X" here
 * (or to the route layout), otherwise it renders the raw key.
 */
export const CLIENT_NAMESPACES = [
  "Auth",
  "Exam",
  "Header",
  "Notifications",
  "Profile",
  "Pwa",
  "SignsPage",
  "SubjectPicker",
  "Tickets",
  "Trainer",
] as const;

export function pickClientMessages(
  messages: AbstractIntlMessages,
  extra: readonly string[] = [],
): AbstractIntlMessages {
  const out: AbstractIntlMessages = {};
  for (const ns of [...CLIENT_NAMESPACES, ...extra]) {
    if (ns in messages) out[ns] = messages[ns];
  }
  return out;
}
