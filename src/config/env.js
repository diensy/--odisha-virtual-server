import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/odishavirtual'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  GROQ_API_KEY: z.string().optional().default(''),
  GROQ_MODEL: z.string().default('openai/gpt-oss-120b'),
  // Signs login cookies. Required in production; a fixed development value is used otherwise.
  JWT_SECRET: z.string().optional().default(''),
  JWT_EXPIRES_DAYS: z.coerce.number().int().min(1).max(90).default(7),
  // Comma-separated emails allowed to hold the admin role (via the staff page).
  ADMIN_EMAILS: z.string().default(''),
  // Optional extra secret for the staff sign-up page; when empty, ADMIN_EMAILS alone decides.
  ADMIN_SIGNUP_CODE: z.string().optional().default(''),
  PROVIDER_CONTACT: z.string().default('dev@odishavirtual.local'),
  OSRM_URL: z.string().default('https://router.project-osrm.org'),
  OVERPASS_URLS: z
    .string()
    .default(
      'https://overpass-api.de/api/interpreter,https://maps.mail.ru/osm/tools/overpass/api/interpreter,https://overpass.kumi.systems/api/interpreter,https://overpass.private.coffee/api/interpreter',
    ),
  NOMINATIM_URL: z.string().default('https://nominatim.openstreetmap.org'),
  CHAT_RATE_LIMIT_PER_15_MIN: z.coerce.number().default(30),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration', z.flattenError(parsed.error).fieldErrors);
  process.exit(1);
}

const raw = parsed.data;

export const env = {
  ...raw,
  isProd: raw.NODE_ENV === 'production',
  overpassUrls: raw.OVERPASS_URLS.split(',').map((u) => u.trim()).filter(Boolean),
  userAgent: `OdishaVirtual/1.0 (${raw.PROVIDER_CONTACT})`,
  aiEnabled: Boolean(raw.GROQ_API_KEY),
  jwtSecret: raw.JWT_SECRET || 'dev-only-insecure-secret-change-me',
  adminEmails: raw.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean),
};

if (env.isProd && raw.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be set to at least 32 characters in production');
  process.exit(1);
}
