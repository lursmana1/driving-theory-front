import { getTranslations } from "next-intl/server";
import landingStats from "@/data/landingStats.json";

export async function LandingStatsBand() {
  const t = await getTranslations("Home");

  const stats = landingStats.map((stat) => ({
    key: t(stat.keyName),
    val: t(stat.valName),
    colorClass: stat.colorClass,
  }));

  return (
    <section
      className="border-b border-slate-200 bg-slate-50 py-14 md:py-20"
      aria-label={t("statsSectionLabel")}
    >
      <div className="section">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.val}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm"
            >
              <span
                className={`block text-2xl font-bold md:text-3xl ${stat.colorClass}`}
              >
                {stat.key}
              </span>
              <span className="mt-2 block text-sm text-slate-600">{stat.val}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
