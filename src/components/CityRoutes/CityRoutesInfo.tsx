import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { infoCardClass } from "./classes";

const CHECK_KEYS = ["check1", "check2", "check3", "check4", "check5"] as const;

type Props = {
  /** "B, BE: №1–№4" rows, from `routesByCategory` */
  byCategory: { label: string; numbers: string }[];
};

/** Text under the map: routes by category, what the examiner checks (art. 32), where to prepare. Server component. */
export default async function CityRoutesInfo({ byCategory }: Props) {
  const t = await getTranslations("CityRoutes");
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className={infoCardClass}>
        <h2 className="text-lg font-bold text-fg">{t("byCategoryTitle")}</h2>
        <dl className="mt-3 flex flex-col gap-2 text-sm leading-6">
          {byCategory.map((row) => (
            <div key={row.label} className="flex flex-wrap gap-x-2">
              <dt className="font-semibold text-fg">{row.label}:</dt>
              <dd className="text-fg-muted">{row.numbers}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={infoCardClass}>
        <h2 className="text-lg font-bold text-fg">{t("checksTitle")}</h2>
        <p className="mt-2 text-sm leading-6 text-fg-muted">{t("checksText")}</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-fg">
          {CHECK_KEYS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </div>

      <div className={`${infoCardClass} flex flex-col gap-3`}>
        <h2 className="text-lg font-bold text-fg">{t("prepTitle")}</h2>
        <Link
          href="/city-exam"
          className="rounded-control bg-accent px-4 py-2 text-center text-sm font-semibold text-on-accent"
        >
          {t("questionsLink")}
        </Link>
        <Link
          href="/yard-exam"
          className="rounded-control border border-line px-4 py-2 text-center text-sm font-semibold text-fg hover:border-accent"
        >
          {t("yardLink")}
        </Link>
        <p className="text-sm leading-6 text-fg-muted">
          <span className="font-semibold text-fg">{t("tbilisiTitle")}</span> {t("tbilisiText")}
        </p>
      </div>
    </div>
  );
}
