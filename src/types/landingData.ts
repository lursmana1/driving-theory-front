export type FeatureTone = "blue" | "violet" | "emerald" | "amber";

export type Medal = "gold" | "silver" | "bronze";

export type LandingLeaderboardRow = {
  rank: number;
  user: string;
  sub: string;
  pct: string;
  medal: Medal;
};
