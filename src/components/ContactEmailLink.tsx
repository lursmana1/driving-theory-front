import type { ReactNode } from "react";
import { CONTACT_EMAIL } from "@/CONSTS/contact";

/** `<mail>…</mail>` tag renderer for next-intl `t.rich`: a mailto link to the contact email. */
export const contactEmailLink = (chunks: ReactNode) => (
  <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-accent underline-offset-2 hover:underline">
    {chunks}
  </a>
);
