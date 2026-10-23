// Downloads the road-sign reference from https://teoria.on.ge/info/signs (robots.txt: Allow /):
// every sign + road marking with its number, name, explanation and SVG image.
//   node scripts/signs/crawl.mjs
// Output: Desktop/pravage-signs/signs.json + images/<group>/<file>.svg + images/groups/<group>.svg (SIGNS_OUT to override)
// The site sits behind a Cloudflare check, so the page is opened once in the installed Chrome (a visible window)
// and the SVGs are fetched through that same page. Uses puppeteer-core from scripts/tiktok (no extra install).
/* eslint-disable no-console -- CLI script */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(__dirname, '../tiktok/package.json'));
const puppeteer = require('puppeteer-core');

const SITE = 'https://teoria.on.ge';
const PAGE = SITE + '/info/signs';
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = process.env.SIGNS_OUT || path.join(os.homedir(), 'Desktop', 'pravage-signs');
const DELAY_MS = 150; // between image requests
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// "1.4.1.-1.4.6. რკინიგზის …" → { number: '1.4.1–1.4.6', from: '1.4.1', to: '1.4.6', name: 'რკინიგზის …' }
// "მონიშვნა 1.1." → { number: '1.1', name: '' }
function parseTitle(title) {
  const t = title.replace(/^მონიშვნა\s+/, '');
  const m = t.match(/^((?:\d+\.)*\d+)\.?(?:\s*[-–−]\s*((?:\d+\.)*\d+)\.?)?\s*(.*)$/);
  if (!m) return { number: null, from: null, to: null, name: title };
  return { number: m[2] ? `${m[1]}–${m[2]}` : m[1], from: m[1], to: m[2] ?? m[1], name: m[3].trim() };
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: false, defaultViewport: { width: 1280, height: 900 } });
try {
  const page = await browser.newPage();
  await page.goto(PAGE, { waitUntil: 'networkidle2', timeout: 60000 });
  for (let i = 0; i < 30 && /Just a moment/.test(await page.title()); i++) await sleep(1000);
  if (/Just a moment/.test(await page.title())) throw new Error('Cloudflare check did not pass — open the page once in Chrome and retry');

  const { groups, items } = await page.evaluate(() => {
    const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
    const groups = [...document.querySelectorAll('a[href^="#signs-"]')].map((a) => ({
      id: Number(a.getAttribute('href').replace('#signs-', '')),
      name: text(a),
      icon: a.querySelector('img')?.getAttribute('src') ?? null,
    }));
    const items = [];
    document.querySelectorAll('.tab-pane[id^="signs-"]').forEach((pane) => {
      const group = Number(pane.id.replace('signs-', ''));
      pane.querySelectorAll('li.sign-item, li.road-mark-item').forEach((li, order) => {
        const desc = li.querySelector('.desc');
        // keep <br> as line breaks, drop any other markup
        const html = desc ? desc.innerHTML.replace(/<br\s*\/?>/gi, '\n') : '';
        const tmp = document.createElement('div'); tmp.innerHTML = html;
        items.push({
          group,
          order,
          kind: li.classList.contains('road-mark-item') ? 'marking' : 'sign',
          cssId: [...li.classList].find((c) => /^(sign|road-mark)-\d/.test(c)) ?? null,
          wide: li.classList.contains('colspan-2'),
          title: text(li.querySelector('.title')),
          description: tmp.textContent.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n'),
          image: li.querySelector('img')?.getAttribute('src') ?? null,
        });
      });
    });
    return { groups, items };
  });

  // one SVG per path, fetched through the page so the Cloudflare session applies
  const download = async (src, file) => {
    const svg = await page.evaluate(async (u) => {
      const r = await fetch(u);
      if (!r.ok) throw new Error(`${u}: HTTP ${r.status}`);
      return r.text();
    }, src);
    if (!svg.includes('<svg')) throw new Error(`${src}: not an SVG`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, svg);
    await sleep(DELAY_MS);
  };

  // replace only what this script writes; anything else in the folder stays
  fs.rmSync(path.join(OUT, 'images'), { recursive: true, force: true });
  fs.rmSync(path.join(OUT, 'signs.json'), { force: true });
  const outGroups = [];
  for (const g of groups) {
    const icon = g.icon ? `images/groups/${g.id}.svg` : null;
    if (g.icon) await download(g.icon, path.join(OUT, icon));
    outGroups.push({ id: g.id, name: g.name, kind: g.id === 101 ? 'marking' : 'sign', icon, count: items.filter((i) => i.group === g.id).length });
  }

  const signs = [];
  for (const [n, it] of items.entries()) {
    const parsed = parseTitle(it.title);
    const image = it.image ? `images/${it.group}/${path.basename(it.image)}` : null;
    if (it.image) await download(it.image, path.join(OUT, image));
    signs.push({
      id: `${it.kind === 'marking' ? 'm' : 's'}${parsed.number ?? it.cssId}`,
      kind: it.kind,
      group: it.group,
      number: parsed.number,
      from: parsed.from,
      to: parsed.to,
      name: parsed.name,
      title: it.title,
      description: it.description,
      image,
      wide: it.wide,
      sourceImage: it.image ? SITE + it.image : null,
    });
    if ((n + 1) % 25 === 0) console.log(`  ${n + 1}/${items.length}`);
  }

  const data = { source: PAGE, crawledAt: new Date().toISOString(), groups: outGroups, signs };
  fs.writeFileSync(path.join(OUT, 'signs.json'), JSON.stringify(data, null, 2) + '\n');

  const noNumber = signs.filter((s) => !s.number);
  const dupes = signs.map((s) => s.id).filter((id, i, a) => a.indexOf(id) !== i);
  console.log(`done: ${signs.length} entries (${signs.filter((s) => s.kind === 'sign').length} signs, ${signs.filter((s) => s.kind === 'marking').length} markings) in ${outGroups.length} groups → ${OUT}`);
  if (noNumber.length) console.warn('  WARNING: no number parsed for: ' + noNumber.map((s) => s.title).join(' | '));
  if (dupes.length) console.warn('  WARNING: duplicate ids: ' + dupes.join(', '));
} finally {
  await browser.close();
}
