// Copies the crawled sign reference (Desktop/pravage-signs, from crawl.mjs) into the app:
//   src/data/signs/signs.json           Georgian data + structure (server only, read by the /signs pages)
//   src/data/signs/i18n/<lang>.json     English / Russian names + explanations by slug (server only)
//   src/data/signs/lookup.<lang>.json   slim number → sign map: sign-number links in explanations + search across groups
//                                       (client, loaded lazily, one language at a time)
//   public/images/signs/<group>/*.svg
//   node scripts/signs/import.mjs
// Translations come from Desktop/pravage-signs/i18n/<lang>.json ({ "<crawl id>": { name, description } }).
// Slugs have no dots: src/proxy.ts skips every path with a dot.
/* eslint-disable no-console -- CLI script */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SRC = process.env.SIGNS_OUT || path.join(os.homedir(), 'Desktop', 'pravage-signs');
const DATA = path.join(ROOT, 'src/data/signs');
const IMG = path.join(ROOT, 'public/images/signs');
const LANGS = ['en', 'ru'];

const raw = JSON.parse(fs.readFileSync(path.join(SRC, 'signs.json'), 'utf8'));

// "3.32" → "3-32"; "1.4.1–1.4.6" → "1-4-1--1-4-6"; markings get a "marking-" prefix (their numbers overlap signs)
const slugOf = (s) => (s.kind === 'marking' ? 'marking-' : '') + s.from.replaceAll('.', '-') + (s.to !== s.from ? '--' + s.to.replaceAll('.', '-') : '');

// "1.4.1"–"1.4.6" → every number in between, when only the last part changes
function expandRange(from, to) {
  const a = from.split('.'), b = to.split('.');
  if (from === to || a.length !== b.length || a.slice(0, -1).join('.') !== b.slice(0, -1).join('.')) return [...new Set([from, to])];
  const head = a.slice(0, -1).join('.'), lo = +a.at(-1), hi = +b.at(-1);
  return Array.from({ length: hi - lo + 1 }, (_, i) => `${head}.${lo + i}`);
}

const groups = raw.groups.map(({ id, name, kind, count }) => ({ id, name, kind, count, icon: `/images/signs/groups/${id}.svg` }));
const signs = raw.signs.map((s, order) => ({
  slug: slugOf(s),
  kind: s.kind,
  group: s.group,
  order,
  number: s.number,
  numbers: expandRange(s.from, s.to),
  name: s.name,
  description: s.description,
  image: `/images/signs/${s.group}/${path.basename(s.image)}`,
  wide: s.wide,
}));

const slugs = signs.map((s) => s.slug);
const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
if (dupes.length) throw new Error('duplicate slugs: ' + dupes.join(', '));

// translations: crawl id → slug
const translations = {};
for (const lang of LANGS) {
  const file = path.join(SRC, 'i18n', `${lang}.json`);
  if (!fs.existsSync(file)) throw new Error(`missing ${file}`);
  const byId = JSON.parse(fs.readFileSync(file, 'utf8'));
  const missing = raw.signs.filter((s) => !byId[s.id]);
  if (missing.length) throw new Error(`${lang}: ${missing.length} untranslated (${missing.slice(0, 5).map((s) => s.id).join(', ')}…)`);
  translations[lang] = Object.fromEntries(raw.signs.map((s, i) => [signs[i].slug, byId[s.id]]));
}

// lookup: "sign:3.32" / "marking:1.1" → [slug, number, name, image, group, wide (1/0)]
function lookupFor(nameOf) {
  const out = {};
  for (const s of signs) for (const n of s.numbers) out[`${s.kind}:${n}`] ??= [s.slug, s.number, nameOf(s), s.image, s.group, s.wide ? 1 : 0];
  return out;
}

fs.rmSync(DATA, { recursive: true, force: true });
fs.mkdirSync(path.join(DATA, 'i18n'), { recursive: true });
fs.writeFileSync(path.join(DATA, 'signs.json'), JSON.stringify({ source: raw.source, crawledAt: raw.crawledAt, groups, signs }, null, 2) + '\n');
fs.writeFileSync(path.join(DATA, 'lookup.ka.json'), JSON.stringify(lookupFor((s) => s.name)) + '\n');
for (const lang of LANGS) {
  fs.writeFileSync(path.join(DATA, 'i18n', `${lang}.json`), JSON.stringify(translations[lang], null, 2) + '\n');
  fs.writeFileSync(path.join(DATA, `lookup.${lang}.json`), JSON.stringify(lookupFor((s) => translations[lang][s.slug].name)) + '\n');
}

fs.rmSync(IMG, { recursive: true, force: true });
fs.cpSync(path.join(SRC, 'images'), IMG, { recursive: true });

console.log(`imported ${signs.length} entries (ka + ${LANGS.join(', ')}), ${groups.length} groups`);
