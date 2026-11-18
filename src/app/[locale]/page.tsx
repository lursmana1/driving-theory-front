import LandingHero from "@/components/landingSections/LandingHero";
import { LandingHowSteps } from "@/components/landingSections/LandingHowSteps";
import LandingWhy from "@/components/landingSections/LandingWhy";
import LandingExamRulesSection from "@/components/landingSections/LandingExamRulesSection";
import LandingRoute from "@/components/landingSections/LandingRoute";
import LandingFaqSection from "@/components/landingSections/LandingFaqSection";
import LandingCta from "@/components/landingSections/LandingCta";
import LandingFooter from "@/components/landingSections/LandingFooter";
import { JsonLd } from "@/components/JsonLd";
import { LANDING } from "@/CONSTS/landing";
import { pageMeta } from "@/lib/pageMeta";
import { websiteJsonLd } from "@/lib/seo";
import { setRequestLocale } from "next-intl/server";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return pageMeta("home", { locale, path: "/" });
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className={LANDING.page}>
      <JsonLd data={websiteJsonLd(locale)} />
      <LandingHero />
      <LandingHowSteps />
      <LandingWhy />
      <LandingExamRulesSection />
      <LandingRoute />
      <LandingFaqSection />
      <LandingCta />
      <LandingFooter />
    </main>
  );
}
