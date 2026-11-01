import { existsSync, readdirSync } from 'node:fs';
import { connectDb, disconnectDb } from '../config/db.js';
import { env } from '../config/env.js';
import { Destination } from '../models/Destination.js';
import { DestinationImage } from '../models/DestinationImage.js';
import { DESTINATIONS } from './destinations.data.js';
import { IMAGE_OVERRIDES } from './imageOverrides.js';
import { IMAGE_NOTES } from './imageNotes.js';

const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const MAX_IMAGES = 16;
// Tours need at least this many photos; places with fewer get extra photos from a Commons search.
const MIN_IMAGES = 12;
const FREE_LICENSE = /^(cc[ -]by|cc0|public domain|pd)/i;
const NOT_A_PHOTO = /(map|locator|logo|plan|diagram|flag|icon|seal|emblem|coin|stamp|chart|sketch|drawing|lithograph|engraving|commons-logo|svg)/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Extra destinations, one file per place in seed/more/, after the core list. */
async function loadAllDestinations() {
  const dir = new URL('./more/', import.meta.url);
  const extra = existsSync(dir)
    ? await Promise.all(readdirSync(dir).filter((f) => f.endsWith('.js')).map(async (f) => (await import(new URL(f, dir).href)).default))
    : [];
  return [...DESTINATIONS, ...extra.sort((a, b) => a.order - b.order)];
}

/** Verified opening hours and fees (seed/visitorFacts.js), if that file exists. */
async function loadVisitorFacts() {
  const url = new URL('./visitorFacts.js', import.meta.url);
  return existsSync(url) ? (await import(url.href)).VISITOR_FACTS : {};
}

/** Puts verified hours and fees into the English fields, translations and source list. */
function applyVisitorFacts(data, translations, facts) {
  if (!facts) return { data, translations };
  const visitorInfo = { ...data.visitorInfo };
  for (const field of ['openingHours', 'entryFee']) if (facts[field]?.en) visitorInfo[field] = facts[field].en;
  const known = new Set(data.sources.map((s) => s.url));
  const sources = [...data.sources, ...(facts.sources ?? []).filter((s) => !known.has(s.url))];
  const tr = translations ? { ...translations } : null;
  for (const lang of ['hi', 'or']) {
    if (!tr?.[lang]) continue;
    tr[lang] = { ...tr[lang], visitorInfo: { ...tr[lang].visitorInfo } };
    for (const field of ['openingHours', 'entryFee']) if (facts[field]?.[lang]) tr[lang].visitorInfo[field] = facts[field][lang];
  }
  return { data: { ...data, visitorInfo, sources }, translations: tr };
}

/** Story and Hindi/Odia text from seed/content/<slug>.js, if that file exists. */
async function loadContent(slug) {
  const url = new URL(`./content/${slug}.js`, import.meta.url);
  if (!existsSync(url)) return null;
  return (await import(url.href)).default;
}

async function api(base, params) {
  const url = `${base}?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const res = await fetch(url, { headers: { 'User-Agent': env.userAgent } });
    if (res.ok) return res.json();
    await sleep(1500 * (attempt + 1));
  }
  throw new Error(`Wikimedia request failed: ${url}`);
}

const stripHtml = (s = '') => s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

async function articleImageTitles(wikiTitle) {
  const json = await api(WIKI_API, { action: 'query', titles: wikiTitle, prop: 'images|pageimages', imlimit: '60', redirects: '1' });
  const page = json.query.pages[0];
  const lead = page.pageimage ? [`File:${page.pageimage.replace(/_/g, ' ')}`] : [];
  const rest = (page.images ?? []).map((i) => i.title);
  return [...new Set([...lead, ...rest])];
}

/** More photos of a place from a Wikimedia Commons file search, for places whose article has few. */
async function commonsSearchTitles(name, variants = []) {
  const clean = name.replace(/[,()]/g, ' ').replace(/s+/g, ' ').trim();
  const titles = [];
  // Full name first, then the first word alone ("Satkosia" finds more than "Satkosia Gorge").
  const short = clean.split(' ')[0];
  const queries = [`${clean} Odisha`, clean, ...(short.length > 4 && short !== clean ? [`${short} Odisha`, short] : []), ...variants.map((v) => `${v} Odisha`)];
  for (const query of queries) {
    const json = await api(COMMONS_API, { action: 'query', list: 'search', srsearch: `${query} filetype:bitmap`, srnamespace: '6', srlimit: '50' });
    titles.push(...(json.query?.search ?? []).map((r) => r.title));
    if (titles.length >= 40) break;
    await sleep(300);
  }
  return [...new Set(titles)];
}

async function imageInfo(titles) {
  const out = [];
  for (let i = 0; i < titles.length; i += 40) {
    const json = await api(COMMONS_API, {
      action: 'query',
      titles: titles.slice(i, i + 40).join('|'),
      prop: 'imageinfo',
      iiprop: 'url|size|mime|extmetadata',
      iiurlwidth: '1920',
    });
    for (const page of json.query.pages) {
      const info = page.imageinfo?.[0];
      if (info) out.push({ title: page.title, ...info });
    }
  }
  return out;
}

function toImageDoc(info, destination, order) {
  const meta = info.extmetadata ?? {};
  const license = meta.LicenseShortName?.value ?? '';
  const creator = stripHtml(meta.Artist?.value) || 'Unknown creator';
  const description = stripHtml(meta.ImageDescription?.value);
  const fileName = info.title.replace(/^File:/, '').replace(/\.[a-z]+$/i, '').replace(/[_-]+/g, ' ');
  const full = info.thumburl ?? info.url;
  return {
    destination: destination._id,
    url: full,
    // Wikimedia serves a fixed set of thumbnail widths; 960 is one of them.
    thumbUrl: full.includes('/1920px-') ? full.replace('/1920px-', '/960px-') : full,
    width: info.thumbwidth ?? info.width,
    height: info.thumbheight ?? info.height,
    alt: description && description.length < 160 ? description : `${destination.name}: ${fileName}`,
    caption: description ? description.slice(0, 220) : null,
    creator: creator.slice(0, 160),
    license,
    licenseUrl: meta.LicenseUrl?.value ?? null,
    sourceUrl: info.descriptionurl,
    provider: 'Wikimedia Commons',
    order,
  };
}

function isUsable(info, exclude) {
  const license = info.extmetadata?.LicenseShortName?.value ?? '';
  return (
    info.mime === 'image/jpeg' &&
    info.width >= 1200 &&
    info.width >= info.height * 0.6 &&
    FREE_LICENSE.test(license) &&
    !NOT_A_PHOTO.test(info.title) &&
    !exclude.includes(info.title)
  );
}

async function importImages(destination, wikiTitle) {
  const override = IMAGE_OVERRIDES[destination.slug] ?? {};
  const discovered = await articleImageTitles(wikiTitle);
  const titles = [...new Set([...(override.prefer ?? []), ...discovered])];
  const infos = await imageInfo(titles);
  const byTitle = new Map(infos.map((i) => [i.title, i]));

  const seen = new Set();
  const pick = (list) => list.filter((i) => i && isUsable(i, override.exclude ?? [])).filter((i) => !seen.has(i.descriptionurl) && seen.add(i.descriptionurl));
  let usable = pick(titles.map((t) => byTitle.get(t)));
  // Article photos first (they are the most on-topic); top up from a Commons search if short.
  if (usable.length < MIN_IMAGES) {
    const words = destination.name.toLowerCase().split(/[s,]+/).filter(Boolean);
    // Other spellings of the name from the keywords ("simlipal", "pipli"): one word, same start.
    const variants = (destination.keywords ?? []).filter((k) => !/s/.test(k) && k !== words[0] && k.slice(0, 3) === words[0].slice(0, 3));
    const extra = (await commonsSearchTitles(destination.name, variants)).filter((t) => !byTitle.has(t));
    // Search is fuzzy ("Pipili" also finds the plant "Bidens pilosa", whose Hawaiian name is
    // pipili): keep a file only if its name carries the place's first word, or its Commons
    // categories carry the place's full name.
    const fileName = (i) => i.title.toLowerCase().replace(/[_]/g, ' ');
    const mentionsPlace = (i) =>
      [words[0], ...variants].some((w) => fileName(i).includes(w)) || (i.extmetadata?.Categories?.value ?? '').toLowerCase().includes(words.join(' '));
    usable = [...usable, ...pick((await imageInfo(extra)).filter(mentionsPlace))];
  }
  usable = usable.slice(0, MAX_IMAGES);

  await DestinationImage.deleteMany({ destination: destination._id });
  const docs = await DestinationImage.insertMany(usable.map((info, i) => toImageDoc(info, destination, i)));
  destination.heroImage = docs[0]?._id ?? null;
  await destination.save();
  return docs.length;
}

async function run() {
  await connectDb();
  const skipImages = process.argv.includes('--no-images');
  // Only fetch photos for places that have none yet (e.g. newly added ones).
  const onlyMissingImages = process.argv.includes('--missing-images');
  // Re-import photos only for places with fewer than MIN_IMAGES (keeps the others as they are).
  const topUpImages = process.argv.includes('--more-images');
  // --only=slug1,slug2 limits the run to those places.
  const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',') ?? null;

  const facts = await loadVisitorFacts();
  for (const { wikiTitle, description, ...entry } of await loadAllDestinations()) {
    if (only && !only.includes(entry.slug)) continue;
    const doc = (await Destination.findOne({ slug: entry.slug })) ?? new Destination();
    const content = await loadContent(entry.slug);
    const { data, translations } = applyVisitorFacts(entry, content ? { hi: content.hi ?? null, or: content.or ?? null } : null, facts[entry.slug]);
    doc.set({
      ...data,
      description: { en: description },
      story: content?.story ?? null,
      translations,
      lastVerifiedAt: new Date(),
      published: true,
    });
    await doc.save();

    const imageCount = topUpImages ? await DestinationImage.countDocuments({ destination: doc._id }) : 0;
    if (skipImages || (onlyMissingImages && doc.heroImage) || (topUpImages && imageCount >= MIN_IMAGES)) {
      console.log(`✓ ${data.name}`);
      continue;
    }
    try {
      const count = await importImages(doc, wikiTitle);
      console.log(`✓ ${data.name} — ${count} images`);
    } catch (err) {
      console.warn(`! ${data.name} — images skipped: ${err.message}`);
    }
    await sleep(500);
  }

  // Points of interest go onto the stored photos, whether or not photos were re-imported.
  for (const [file, notes] of Object.entries(IMAGE_NOTES)) {
    const { matchedCount } = await DestinationImage.updateMany({ sourceUrl: `https://commons.wikimedia.org/wiki/File:${file}` }, { notes });
    if (!matchedCount) console.warn(`! image notes: no stored photo matches ${file}`);
  }

  await Destination.syncIndexes();
  await disconnectDb();
}

run().catch(async (err) => {
  console.error(err);
  await disconnectDb();
  process.exit(1);
});
