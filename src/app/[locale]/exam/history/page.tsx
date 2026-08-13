import { redirectTo } from "@/i18n/redirectTo";

export default async function ExamHistoryPage() {
  await redirectTo("/profile");
}
