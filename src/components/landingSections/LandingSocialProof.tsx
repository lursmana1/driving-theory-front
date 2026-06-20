import { getTranslations } from "next-intl/server";
import { LandingLeaderboardPreview } from "./LandingLeaderboardPreview";

export async function LandingSocialProof() {
  const t = await getTranslations("Home");

  return (
    <section
      className="relative overflow-hidden border-b border-white/5 bg-[#060b14] py-16 md:py-24"
      aria-label={t("socialProofAriaLabel")}
    >
      <div className="section">
        <div className=" w-full">
          <LandingLeaderboardPreview
            badge={t("leaderboardPreviewBadge")}
            title={t("leaderboardPreviewTitle")}
            subtitle={t("leaderboardPreviewSubtitle")}
            viewAll={t("leaderboardFull")}
          />
        </div>
      </div>
    </section>
  );
}
