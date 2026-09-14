import { getCategoryById } from "@/CONSTS/categories";
import { ogImageResponse } from "@/lib/ogImage";

export const alt = "prava.ge — თეორიული გამოცდის ბილეთები";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  const cat = getCategoryById(Number(category));
  const label = cat?.name ?? category;
  const headline =
    locale === "ru"
      ? `Билеты категории ${label}`
      : locale === "en"
        ? `Category ${label} theory tickets`
        : `${label} — თეორიული გამოცდის ბილეთები`;
  return ogImageResponse(headline);
}
