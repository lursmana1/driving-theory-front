import { getTranslations } from "next-intl/server";
import landingFeatures from "@/data/landingFeatures.json";
import { LANDING, featureEmoji, featureIconClass } from "@/CONSTS/landing";

export default async function LandingWhy() {
  const t = await getTranslations("Home");

  const features = landingFeatures.map((item) => ({
    key: item.key,
    title: t(`${item.key}Title`),
    text: t(`${item.key}Text`),
    tone: item.tone,
  }));

  return (
    <section
      className="border-b border-slate-200/80 bg-slate-100/90 py-16 md:py-24"
      aria-labelledby="why-title"
    >
      <div className="section">
        <h2
          id="why-title"
          className={`mx-auto max-w-3xl text-center ${LANDING.headingSection}`}
        >
          {t("whyTitle")}
        </h2>
        <div className="mx-auto mt-14 grid max-w-md grid-cols-1 gap-6 sm:max-w-5xl sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feat) => (
            <article
              key={feat.key}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:text-left"
            >
              <div
                className={`${featureIconClass(feat.tone)} mx-auto sm:mx-0`}
                aria-hidden
              >
                {featureEmoji(feat.tone)}
              </div>
              <h3 className={LANDING.headingCard}>{feat.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{feat.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
