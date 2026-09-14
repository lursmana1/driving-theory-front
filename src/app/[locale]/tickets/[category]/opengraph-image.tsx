import { DEFAULT_OG_HEADLINE, ogImageResponse } from "@/lib/ogImage";

export const alt = DEFAULT_OG_HEADLINE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return ogImageResponse(DEFAULT_OG_HEADLINE);
}
