import { redirect } from "next/navigation";

// Leaderboard temporarily disabled site-wide.
export default function LeaderboardPage() {
  redirect("/");
}
