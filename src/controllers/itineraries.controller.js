import { BASES, createItinerary, getItinerary } from '../services/itinerary.service.js';

export async function create(req, res) {
  res.status(201).json(await createItinerary(req.valid.body));
}

export async function show(req, res) {
  res.json(await getItinerary(req.params.id));
}

export function bases(_req, res) {
  res.json({ bases: Object.entries(BASES).map(([key, b]) => ({ key, name: b.name })) });
}
