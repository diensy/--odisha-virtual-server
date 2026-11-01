import {
  getDestinationDetail,
  getDestinationDoc,
  getImagesBySlug,
  listDestinations,
} from '../services/destination.service.js';
import { getNearby } from '../services/nearby.service.js';
import { getWeather } from '../services/weather.service.js';

const pointOf = (d) => ({ lat: d.location.latitude, lng: d.location.longitude });

export async function list(req, res) {
  const items = await listDestinations({ ...req.valid.query, lang: req.lang });
  res.json({ items });
}

export async function detail(req, res) {
  res.json(await getDestinationDetail(req.params.slug, req.lang));
}

export async function images(req, res) {
  res.json(await getImagesBySlug(req.params.slug, 48, req.lang));
}

export async function nearby(req, res) {
  const d = await getDestinationDoc(req.params.slug);
  const { categories, radius } = req.valid.query;
  res.json(await getNearby(pointOf(d), categories, { radius, limit: 10 }));
}

export async function weather(req, res) {
  const d = await getDestinationDoc(req.params.slug);
  res.json(await getWeather(pointOf(d)));
}
