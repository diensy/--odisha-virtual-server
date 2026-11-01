import { env } from '../config/env.js';
import { bookingAction, getSessionMessages, handleChat } from '../services/chat.service.js';

export async function send(req, res) {
  res.json(await handleChat({ ...req.valid.body, user: req.user }));
}

export async function history(req, res) {
  res.json(await getSessionMessages(req.params.sessionId, req.user));
}

export async function booking(req, res) {
  res.json(await bookingAction(req.params.sessionId, req.valid.body.action, req.user));
}

export function status(_req, res) {
  res.json({ engine: env.aiEnabled ? 'groq' : 'rules' });
}
