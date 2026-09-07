import LandingHero from "@/components/landingSections/LandingHero";
import LandingWhy from "@/components/landingSections/LandingWhy";
import LandingHow from "@/components/landingSections/LandingHow";
import LandingFaqSection from "@/components/landingSections/LandingFaqSection";
import LandingCta from "@/components/landingSections/LandingCta";
import LandingFooter from "@/components/landingSections/LandingFooter";
import { JsonLd } from "@/components/JsonLd";
import { LANDING } from "@/CONSTS/landing";
import { pageMeta } from "@/lib/pageMeta";
import { websiteJsonLd } from "@/lib/seo";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return pageMeta("home", { locale, path: "/" });
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <main className={LANDING.page}>
      <JsonLd data={websiteJsonLd(locale)} />
      <LandingHero />
      <LandingWhy />
      <LandingHow />
      <LandingFaqSection />
      <LandingCta />
      <LandingFooter />
    </main>
  );
}
