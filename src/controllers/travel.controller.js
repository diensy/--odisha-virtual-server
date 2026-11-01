import { getGuidelines } from '../services/guidelines.service.js';
import { getRoute } from '../services/routing.service.js';

export async function route(req, res) {
  const { origin, destination } = req.valid.query;
  res.json(await getRoute(origin, destination));
}

export async function guidelines(_req, res) {
  res.json(await getGuidelines(null));
}
