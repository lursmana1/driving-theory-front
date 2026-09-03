import { ogImageResponse } from "@/lib/ogImage";

export const alt = "prava.ge — Georgian driving theory exam prep";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HEADLINE: Record<string, string> = {
  ka: "Driving theory tickets and mock exams",
  en: "Driving theory tickets and mock exams",
  ru: "Билеты и пробный экзамен по теории",
};

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return ogImageResponse("GEORGIA DRIVING THEORY", HEADLINE[locale] ?? HEADLINE.en);
}
