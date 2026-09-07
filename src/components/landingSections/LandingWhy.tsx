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
      className="border-t border-hairline py-16 md:py-24"
      aria-labelledby="why-title"
    >
      <div className="section">
        <p className={LANDING.eyebrow}>{t("whySectionLabel")}</p>
        <h2 id="why-title" className={`mt-4 max-w-2xl ${LANDING.headingSection}`}>
          {t("whyTitle")}
        </h2>

        <div className="mt-12 grid border-t border-hairline md:grid-cols-3">
          {features.map((feat, i) => (
            <article
              key={feat.key}
              className={`px-0 py-8 md:px-8 md:py-10 ${
                i < features.length - 1
                  ? "border-b border-hairline md:border-b-0 md:border-r"
                  : ""
              } ${i === 0 ? "md:pl-0" : ""}`}
            >
              <div className={featureIconClass(feat.tone)} aria-hidden>
                {featureEmoji(feat.tone)}
              </div>
              <h3 className={LANDING.headingCard}>{feat.title}</h3>
              <p className={`mt-3 ${LANDING.body}`}>{feat.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
