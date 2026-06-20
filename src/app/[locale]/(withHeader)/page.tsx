import LandingHero from "@/components/landingSections/LandingHero";
import LandingWhy from "@/components/landingSections/LandingWhy";
import LandingHow from "@/components/landingSections/LandingHow";
import LandingFaqSection from "@/components/landingSections/LandingFaqSection";
import LandingCta from "@/components/landingSections/LandingCta";
import LandingFooter from "@/components/landingSections/LandingFooter";

export const metadata = {
  title: "prava.ge",
  description: "პრავა.გე - სასწავლო პლატფორმა საქართველოში",
  
};

export default function HomePage() {
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
