import * as bookings from '../services/booking.service.js';

export async function create(req, res) {
  res.status(201).json(await bookings.createBooking(req.user.id, req.valid.body, { source: 'form' }));
}

export async function mine(req, res) {
  res.json({ items: await bookings.listUserBookings(req.user.id) });
}

export async function show(req, res) {
  res.json(await bookings.getBooking(req.params.id, req.user));
}

export async function cancel(req, res) {
  res.json(await bookings.cancelBooking(req.params.id, req.user));
}

export async function adminList(req, res) {
  res.json({ items: await bookings.adminListBookings(req.valid.query) });
}

export async function adminUpdate(req, res) {
  res.json(await bookings.adminUpdateStatus(req.params.id, req.valid.body));
}

export async function adminStats(_req, res) {
  res.json(await bookings.adminStats());
}
