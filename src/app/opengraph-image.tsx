import { ogImageResponse } from "@/lib/ogImage";

export const alt = "prava.ge — პრავა, თეორიული გამოცდის ბილეთები";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Bare-host share preview (`https://prava.ge`) — same logo card as locale routes. */
export default async function Image() {
  return ogImageResponse("პრავა — თეორიული გამოცდის ბილეთები");
}
