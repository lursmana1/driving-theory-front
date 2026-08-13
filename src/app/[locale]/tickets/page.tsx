import { redirectTo } from "@/i18n/redirectTo";
import { DEFAULT_CATEGORY_ID } from "@/CONSTS/categories";

export default async function TicketsIndexPage() {
  await redirectTo(`/tickets/${DEFAULT_CATEGORY_ID}`);
}
