import * as trips from '../services/trip.service.js';

export async function create(req, res) {
  res.status(201).json(await trips.saveTrip(req.user.id, req.valid.body));
}

export async function mine(req, res) {
  res.json({ items: await trips.listTrips(req.user.id) });
}

export async function show(req, res) {
  res.json(await trips.getTrip(req.params.id, req.user.id));
}

export async function update(req, res) {
  res.json(await trips.updateTrip(req.params.id, req.user.id, req.valid.body));
}

export async function remove(req, res) {
  await trips.deleteTrip(req.params.id, req.user.id);
  res.status(204).end();
}
