import LandingHero from "@/components/landingSections/LandingHero";
import LandingWhy from "@/components/landingSections/LandingWhy";
import LandingHow from "@/components/landingSections/LandingHow";
import LandingFaqSection from "@/components/landingSections/LandingFaqSection";
import LandingCta from "@/components/landingSections/LandingCta";
import LandingFooter from "@/components/landingSections/LandingFooter";
import { pageMeta } from "@/lib/pageMeta";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return pageMeta("home", { locale });
}


export default function HomePage() {
  console.log("HomePage");
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-georgian antialiased">
      <LandingHero />
      <LandingWhy />
      <LandingHow />
      <LandingFaqSection />
      <LandingCta />
      <LandingFooter />
    </main>
  );
}
