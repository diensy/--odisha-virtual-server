import { Destination } from '../models/Destination.js';
import { DestinationImage } from '../models/DestinationImage.js';
import { AppError } from '../utils/AppError.js';

const HERO_FIELDS = 'url thumbUrl alt creator license licenseUrl sourceUrl width height';

export const LANGUAGES = ['en', 'hi', 'or'];

/**
 * The destination's text fields in `lang`, falling back field by field to English
 * wherever a translation is missing.
 */
function localized(d, lang = 'en') {
  const tr = lang !== 'en' ? d.translations?.[lang] : null;
  const pick = (value, fallback) => (Array.isArray(fallback) ? (value?.length ? value : fallback) : (value ?? fallback));
  const vi = d.visitorInfo ?? {};
  return {
    name: pick(tr?.name, d.name),
    tagline: pick(tr?.tagline, d.tagline),
    summary: pick(tr?.summary, d.summary),
    description: pick(tr?.description, d.description?.en ?? []),
    highlights: pick(tr?.highlights, d.highlights ?? []),
    address: pick(tr?.address, d.location.address),
    district: pick(tr?.district, d.location.district),
    visitorPointNote: pick(tr?.visitorPointNote, d.location.visitorPointNote ?? null),
    visitorInfo: {
      ...vi,
      openingHours: pick(tr?.visitorInfo?.openingHours, vi.openingHours ?? null),
      entryFee: pick(tr?.visitorInfo?.entryFee, vi.entryFee ?? null),
      bestTimeToVisit: pick(tr?.visitorInfo?.bestTimeToVisit, vi.bestTimeToVisit ?? null),
      suggestedDuration: pick(tr?.visitorInfo?.suggestedDuration, vi.suggestedDuration ?? null),
      guidelines: pick(tr?.visitorInfo?.guidelines, vi.guidelines ?? []),
      accessibility: pick(tr?.visitorInfo?.accessibility, vi.accessibility ?? []),
    },
    story: d.story?.[lang]?.length ? d.story[lang] : (d.story?.en ?? []),
    translated: Boolean(tr),
  };
}

export function toCard(d, lang = 'en') {
  const l = localized(d, lang);
  return {
    id: String(d._id),
    name: l.name,
    slug: d.slug,
    category: d.category,
    tagline: l.tagline,
    summary: l.summary,
    district: l.district,
    lat: d.location.latitude,
    lng: d.location.longitude,
    suggestedDuration: l.visitorInfo.suggestedDuration,
    heroImage: d.heroImage && typeof d.heroImage === 'object' ? toImage(d.heroImage) : null,
  };
}

export function toImage(img) {
  return {
    id: String(img._id),
    url: img.url,
    thumbUrl: img.thumbUrl,
    width: img.width,
    height: img.height,
    alt: img.alt,
    caption: img.caption ?? null,
    notes: img.notes ?? [],
    creator: img.creator,
    license: img.license,
    licenseUrl: img.licenseUrl ?? null,
    sourceUrl: img.sourceUrl,
    provider: img.provider,
  };
}

// Destination content only changes when the seed script runs, so answers are kept in memory
// for a few minutes instead of reading the full records from the database on every request.
const MEMO_MS = 5 * 60 * 1000;
const memo = new Map();
function remember(key, load) {
  const hit = memo.get(key);
  if (hit && hit.until > Date.now()) return hit.value;
  const value = load().catch((err) => {
    memo.delete(key); // never keep a failure
    throw err;
  });
  memo.set(key, { value, until: Date.now() + MEMO_MS });
  return value;
}

// What a destination card needs, in every language; stories and long text are left out.
const CARD_FIELDS = ['name', 'slug', 'category', 'tagline', 'summary', 'location', 'visitorInfo.suggestedDuration', 'heroImage', 'order', 'keywords']
  .concat(...['hi', 'or'].map((l) => ['name', 'tagline', 'summary', 'district', 'visitorInfo.suggestedDuration'].map((k) => `translations.${l}.${k}`)))
  .join(' ');

export function listDestinations({ category, q, featured, lang = 'en' } = {}) {
  return remember(`list:${lang}:${category ?? ''}:${q ?? ''}:${featured ? 1 : 0}`, () => loadDestinations({ category, q, featured, lang }));
}

async function loadDestinations({ category, q, featured, lang }) {
  const filter = { published: true };
  if (category) filter.category = category;
  if (featured) filter.featured = true;
  if (q) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [
      { name: rx },
      { keywords: rx },
      { 'location.district': rx },
      { tagline: rx },
      // Visitors may type the Hindi or Odia name.
      { 'translations.hi.name': rx },
      { 'translations.or.name': rx },
    ];
  }
  const docs = await Destination.find(filter).select(CARD_FIELDS).sort({ order: 1, name: 1 }).populate('heroImage', HERO_FIELDS).lean();
  return docs.map((d) => toCard(d, lang));
}

export async function getDestinationDoc(slug) {
  const doc = await Destination.findOne({ slug, published: true }).populate('heroImage', HERO_FIELDS).lean();
  if (!doc) throw AppError.notFound(`No destination found for "${slug}"`);
  return doc;
}

export function getDestinationDetail(slug, lang = 'en') {
  return remember(`detail:${slug}:${lang}`, () => loadDestinationDetail(slug, lang));
}

async function loadDestinationDetail(slug, lang) {
  const doc = await getDestinationDoc(slug);
  const [images, related] = await Promise.all([getImages(doc._id), getRelated(doc, 4, lang)]);
  const l = localized(doc, lang);
  return {
    ...toCard(doc, lang),
    description: l.description,
    highlights: l.highlights,
    address: l.address,
    visitorPointNote: l.visitorPointNote,
    visitorInfo: l.visitorInfo,
    story: l.story,
    contentLanguage: l.translated ? lang : 'en',
    sources: doc.sources,
    lastVerifiedAt: doc.lastVerifiedAt,
    images,
    related,
  };
}

export async function getImages(destinationId, limit = 24) {
  const imgs = await DestinationImage.find({ destination: destinationId }).sort({ order: 1 }).limit(limit).lean();
  return imgs.map(toImage);
}

export function getImagesBySlug(slug, limit, lang = 'en') {
  return remember(`images:${slug}:${limit}:${lang}`, async () => {
    const doc = await getDestinationDoc(slug);
    return { destination: toCard(doc, lang), images: await getImages(doc._id, limit) };
  });
}

/** Other published destinations ordered by straight-line distance. */
export async function getRelated(doc, limit = 4, lang = 'en') {
  const rows = await Destination.aggregate([
    {
      $geoNear: {
        near: doc.geo,
        distanceField: 'distanceMeters',
        query: { published: true, _id: { $ne: doc._id } },
        spherical: true,
      },
    },
    { $limit: limit },
    { $lookup: { from: 'destinationimages', localField: 'heroImage', foreignField: '_id', as: 'heroImage' } },
    { $set: { heroImage: { $first: '$heroImage' } } },
  ]);
  return rows.map((r) => ({ ...toCard(r, lang), distanceKm: Math.round(r.distanceMeters / 100) / 10 }));
}

/**
 * Resolves free text such as "konark", "Lingaraj temple" or "puri jagannath" to a destination.
 * Returns null when nothing matches confidently.
 */
export async function findDestinationByText(text) {
  if (!text) return null;
  const cleaned = text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return null;

  const bySlug = await Destination.findOne({ slug: cleaned.replace(/\s/g, '-'), published: true })
    .populate('heroImage', HERO_FIELDS)
    .lean();
  if (bySlug) return bySlug;

  const all = await Destination.find({ published: true }).populate('heroImage', HERO_FIELDS).lean();
  let best = null;
  let bestScore = 0;
  for (const d of all) {
    const score = matchScore(cleaned, d);
    if (score > bestScore) {
      best = d;
      bestScore = score;
    }
  }
  return bestScore >= 1 ? best : null;
}

/** Every destination mentioned anywhere in a piece of text, in order of appearance. */
export async function findDestinationsInText(text) {
  const lower = ` ${text.toLowerCase()} `;
  const all = await Destination.find({ published: true }).populate('heroImage', HERO_FIELDS).lean();
  const hits = [];
  for (const d of all) {
    const terms = [d.name.toLowerCase(), ...d.keywords.map((k) => k.toLowerCase())];
    const positions = terms.map((t) => lower.indexOf(t)).filter((i) => i >= 0);
    if (positions.length) hits.push({ doc: d, at: Math.min(...positions) });
  }
  return hits.sort((a, b) => a.at - b.at).map((h) => h.doc);
}

function matchScore(text, d) {
  const name = d.name.toLowerCase();
  if (text === name) return 10;
  if (text.includes(name) || name.includes(text)) return 5;
  let score = 0;
  for (const k of d.keywords) {
    const kw = k.toLowerCase();
    if (text === kw) score += 4;
    else if (text.includes(kw)) score += 2;
  }
  return score;
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
