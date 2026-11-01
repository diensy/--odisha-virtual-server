# OdishaVirtual — API server

The Node.js / Express / MongoDB back end of **OdishaVirtual**, an AI-powered travel platform for Odisha. It serves 21 destinations with history stories and licensed photos (in English, Hindi and Odia), live weather, routes and nearby facilities, a trip planner with cost estimates, an AI travel guide with booking-request collection, accounts, and an admin review flow.

The web client lives in a separate repository: https://github.com/diensy/odisha-virtual-client

> OdishaVirtual takes booking **requests**. It makes no real reservations and takes no payments: staff arrange each booking by hand and update its status.

## Tech stack

Node.js 20+, Express 5, MongoDB with Mongoose 9, Zod validation, Helmet, express-rate-limit, bcryptjs, JSON Web Tokens (HttpOnly cookie), Groq SDK.

## Getting started

Requirements: Node.js 20+ and MongoDB (local or MongoDB Atlas).

```bash
npm install
cp .env.example .env     # then fill in the values below
npm run seed             # load destinations, stories, translations, hours and photos
npm run dev              # API on http://localhost:5000
```

Check it is running: `GET http://localhost:5000/api/health`.

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts the API with auto-restart on code changes |
| `npm start` | Starts the API (production) |
| `npm run seed` | Loads all destinations and re-imports their photos |
| `node src/seed/seed.js --no-images` | Reloads text only, keeps photos |
| `node src/seed/seed.js --missing-images` | Imports photos only for places with none |
| `node src/seed/seed.js --more-images` | Tops up places with fewer than 12 photos |
| `node src/seed/seed.js --only=slug1,slug2` | Limits a seed run to those places |
| `npm run warm` | Pre-fetches nearby places for every destination |

## Configuration (`.env`)

| Setting | Required | What it does |
| --- | --- | --- |
| `PORT` | No (5000) | API port |
| `MONGODB_URI` | Yes | Database connection |
| `CLIENT_ORIGIN` | Yes | Web app address(es) allowed to call the API, comma-separated |
| `GROQ_API_KEY` | No | Turns on the AI model; empty = rule-based guide |
| `GROQ_MODEL` | No | Groq model id (default `openai/gpt-oss-120b`) |
| `JWT_SECRET` | Yes in production (32+ chars) | Signs login cookies |
| `JWT_EXPIRES_DAYS` | No (7) | How long a sign-in lasts |
| `ADMIN_EMAILS` | For admins | Emails allowed to hold the admin role |
| `ADMIN_SIGNUP_CODE` | No | Extra secret for staff sign-up; empty = not asked |
| `PROVIDER_CONTACT` | Yes | Contact email sent to OpenStreetMap and Wikimedia, as their policies require |
| `OSRM_URL`, `OVERPASS_URLS`, `NOMINATIM_URL` | No | Self-hosted or paid map services |
| `CHAT_RATE_LIMIT_PER_15_MIN` | No (30) | Chat messages per visitor |

The server reads `.env` only when it starts.

## How it is organised

```
src/
  routes/        URL list (index.js) and Zod request schemas
  controllers/   thin HTTP handlers
  services/      business logic shared by the REST API and the AI tools
  providers/     one module per outside API (Open-Meteo, OSRM, Overpass, Nominatim)
  ai/            Groq engine, tool definitions and executors, rule-based engine,
                 booking-request rules, system prompt
  models/        Mongoose models
  middleware/    auth cookie, validation, rate limits, errors
  seed/          destination data, more/ (added places), content/ (stories and
                 Hindi/Odia text), visitorFacts.js (hours and fees),
                 imageOverrides.js (photo picks), imageNotes.js (points on photos)
```

## Key behaviour

- **AI travel guide:** with `GROQ_API_KEY`, Groq chooses from 11 tools (destinations, weather, routes, nearby places, itineraries, booking requests…). The server validates every tool call with Zod and runs it; map, weather and photo data reach the user straight from the providers, never through the model. Without a key, or if Groq fails, a rule-based engine uses the same tools. Each reply carries one of 13 intents.
- **Booking requests:** trip, hotel, flight or package. Details are collected step by step and validated (dates, travellers, budget). Only an explicit confirmation saves a request (reference `OV-XXXXXX`, status `pending`). Staff move it to under review, accepted or not possible with a note; travellers can cancel while it is open.
- **Trip planner:** picks places by interest, orders them from the base city, packs them into 8-hour days, measures real drive times with OSRM, and adds a rough cost estimate (rates in `src/services/estimate.service.js`).
- **Accounts:** bcrypt password hashes, JWT in the HttpOnly cookie `ov_session`. Admin accounts are created only through `/api/auth/staff/register` for emails in `ADMIN_EMAILS`.
- **Languages:** send `X-Lang: en | hi | or` to receive destination text and stories in that language, with English as the fallback.
- **Live data and caching:** results are cached in MongoDB (weather 30 minutes, nearby places 7 days, routes 7 days, place lookups 30 days) and the last good result is served if a provider is down. When every Overpass server fails, nearby places fall back to Nominatim search.

## API overview

All endpoints are under `/api`. Errors are `{ "error": { "code", "message", "details" } }`.

| Area | Endpoints |
| --- | --- |
| Accounts | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `PATCH /auth/preferences`, `GET /auth/staff/config`, `POST /auth/staff/register` |
| Destinations | `GET /destinations`, `GET /destinations/:slug`, `GET /destinations/:slug/images`, `GET /destinations/:slug/nearby`, `GET /destinations/:slug/weather` |
| Travel data | `GET /routes?origin=&destination=`, `GET /guidelines`, `GET /health` |
| AI guide | `GET /chat/status`, `POST /chat`, `GET /chat/:sessionId`, `POST /chat/:sessionId/booking` |
| Planner | `GET /itineraries/bases`, `POST /itineraries`, `GET /itineraries/:id` |
| Saved trips | `POST /trips`, `GET /trips/my-trips`, `GET /trips/:id`, `PATCH /trips/:id`, `DELETE /trips/:id` |
| Bookings | `POST /bookings`, `GET /bookings/my-bookings`, `GET /bookings/:idOrReference`, `PATCH /bookings/:id/cancel` |
| Admin | `GET /admin/stats`, `GET /admin/bookings`, `PATCH /admin/bookings/:id/status` |

## Data sources

Destination text and stories are written from the sources listed with each place (mainly Wikipedia and UNESCO). Opening hours and fees come from the Archaeological Survey of India, the Shree Jagannath Temple Administration, Nandankanan and Odisha Tourism. Photographs come from Wikimedia Commons under free licences, with creator and licence stored for every photo. Live data: Open-Meteo, OSRM, OpenStreetMap (Overpass, Nominatim), and Groq for AI replies.
