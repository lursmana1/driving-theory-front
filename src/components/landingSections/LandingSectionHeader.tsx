import type { ReactNode } from "react";
import { LANDING } from "@/CONSTS/landing";

type Props = {
  /** id of the h2, referenced by the section's aria-labelledby */
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** optional action shown to the right on desktop (e.g. a CTA) */
  action?: ReactNode;
};

/** Eyebrow + h2 + subtitle used at the top of every landing section. */
export function LandingSectionHeader({ id, eyebrow, title, subtitle, action }: Props) {
  const text = (
    <div>
      <p className={LANDING.eyebrow}>{eyebrow}</p>
      <h2 id={id} className={`mt-4 max-w-2xl ${LANDING.headingSection}`}>
        {title}
      </h2>
      {subtitle ? (
        <p className={`mt-4 max-w-2xl ${LANDING.body}`}>{subtitle}</p>
      ) : null}
    </div>
  );

  if (!action) return text;

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      {text}
      {action}
    </div>
  );
}
