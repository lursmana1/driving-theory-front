// Official exam-route maps (sa.gov.ge, order №598 annexes) → public/images/city-routes + src/data/cityRoutes/official.json
// 1) Extract the map images from the PDFs into .cache/sa-routes/raw (python + pymupdf, see plans/city-routes-data.md).
// 2) node scripts/city-routes/publish-official.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const RAW = path.join(ROOT, "scripts/city-routes/.cache/sa-routes/raw");
const OUT_IMG = path.join(ROOT, "public/images/city-routes");
const OUT_JSON = path.join(ROOT, "src/data/cityRoutes/official.json");

/** Georgian name in the PDF captions → URL slug. Order = page order. */
const CITIES = {
  რუსთავი: "rustavi",
  თელავი: "telavi",
  გორი: "gori",
  ახალციხე: "akhaltsikhe",
  საჩხერე: "sachkhere",
  ქუთაისი: "kutaisi",
  ოზურგეთი: "ozurgeti",
  ფოთი: "poti",
  ბათუმი: "batumi",
  ზუგდიდი: "zugdidi",
};

/** Categories per route number, from the index page of each PDF. */
const CD = {
  rustavi: { 9: ["C", "C1", "D1", "D"], 10: ["C", "C1", "D1", "D", "CE", "DE", "C1E", "D1E"] },
  telavi: { 6: ["C", "C1", "D1"], 7: ["C", "C1", "D1"] },
  kutaisi: {
    5: ["C", "C1", "D1", "D", "CE", "DE", "C1E", "D1E"],
    6: ["C", "C1", "D1", "D", "CE", "DE", "C1E", "D1E"],
  },
  poti: { 4: ["C", "C1", "D1"], 5: ["C", "C1", "D1"], 11: ["C", "C1", "D1"] },
};

const SOURCES = {
  b: { date: "2026-07-21", doc: "b-be" },
  cd: { date: "2026-07-21", doc: "c-d" },
  gori2026: { date: "2026-10-27", doc: "gori-2026-10", inForce: "2026-11-02" },
};

const index = JSON.parse(fs.readFileSync(path.join(RAW, "index.json"), "utf8"));
const goriNew = new Set(index.filter((e) => e.file.startsWith("gori2026-")).map((e) => e.no));

const cities = Object.fromEntries(Object.values(CITIES).map((s) => [s, []]));
for (const e of index) {
  const slug = CITIES[e.city];
  if (!slug) throw new Error(`unknown city ${e.city}`);
  const tag = e.file.split("-")[0];
  // The October Gori file replaces Gori №1 and №2 of the July file.
  if (tag === "b" && slug === "gori" && goriNew.has(e.no)) continue;
  const categories = tag === "cd" ? CD[slug]?.[e.no] : ["B", "BE"];
  if (!categories) throw new Error(`no categories for ${slug} №${e.no}`);

  fs.mkdirSync(path.join(OUT_IMG, slug), { recursive: true });
  const name = `route-${e.no}.webp`;
  const img = sharp(path.join(RAW, e.file)).flatten({ background: "#ffffff" });
  const meta = await img
    .clone()
    .resize({ width: 1400, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(OUT_IMG, slug, name));
  cities[slug].push({
    no: e.no,
    categories,
    image: `/images/city-routes/${slug}/${name}`,
    width: meta.width,
    height: meta.height,
    source: SOURCES[tag],
  });
}
for (const list of Object.values(cities)) list.sort((a, b) => a.no - b.no);
fs.writeFileSync(OUT_JSON, JSON.stringify(cities, null, 1) + "\n");
console.log(Object.entries(cities).map(([s, l]) => `${s}: ${l.map((r) => r.no).join(",")}`).join("\n"));
