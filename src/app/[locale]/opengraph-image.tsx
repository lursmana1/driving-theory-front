import { ogImageResponse } from "@/lib/ogImage";

export const alt = "prava.ge — პრავა, თეორიული გამოცდის ბილეთები";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HEADLINE: Record<string, string> = {
  ka: "პრავა — თეორიული გამოცდის ბილეთები",
  en: "prava — Georgian driving theory tickets",
  ru: "prava — билеты теоретического экзамена",
};

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return ogImageResponse(HEADLINE[locale] ?? HEADLINE.ka);
}
