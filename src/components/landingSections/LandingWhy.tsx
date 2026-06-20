import { getTranslations } from "next-intl/server";
import landingFeatures from "@/data/landingFeatures.json";
import { LANDING, featureEmoji, featureIconClass } from "@/CONSTS/landing";
import { LandingEyebrow } from "./LandingEyebrow";

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
        <LandingEyebrow tone="light">{t("whySectionLabel")}</LandingEyebrow>
        <h2
          id="why-title"
          className={`mx-auto mt-3 max-w-3xl text-center ${LANDING.headingSection}`}
        >
          {t("whyTitle")}
        </h2>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat) => (
            <article
              key={feat.key}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={featureIconClass(feat.tone)} aria-hidden>
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
