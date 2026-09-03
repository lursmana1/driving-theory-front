import { getCategoryById } from "@/CONSTS/categories";
import { ogImageResponse } from "@/lib/ogImage";

export const alt = "prava.ge practice tickets";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { category } = await params;
  const cat = getCategoryById(Number(category));
  const label = cat?.name ?? category;
  return ogImageResponse("PRACTICE TICKETS", `Category ${label}`);
}
