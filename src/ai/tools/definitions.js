import { z } from 'zod';
import { CATEGORIES } from '../../models/Destination.js';
import { NEARBY_CATEGORY_KEYS } from '../../services/nearby.service.js';
import { BASES } from '../../services/itinerary.service.js';
import { BOOKING_TYPES, TRAVEL_STYLES } from '../../models/Booking.js';

const nullableString = { type: ['string', 'null'] };

/**
 * Each tool: the JSON schema shown to the model (strict mode, so every property is listed
 * as required and optional values are nullable) plus a Zod schema that re-validates the
 * arguments on the server before anything executes.
 */
export const TOOL_DEFINITIONS = {
  search_destinations: {
    description:
      'Search the curated OdishaVirtual destination catalogue by free text and/or category. Use for open questions like "beaches in Odisha" or "what can I visit".',
    parameters: {
      query: { ...nullableString, description: 'Free text such as a place, district or theme.' },
      category: { type: ['string', 'null'], enum: [...CATEGORIES, null] },
    },
    zod: z.object({ query: z.string().max(100).nullable(), category: z.enum(CATEGORIES).nullable() }),
  },

  get_destination_details: {
    description:
      'Verified description, highlights, visitor information and sources for one destination. Always call this before describing a destination.',
    parameters: {
      destination: { type: 'string', description: 'Destination name or slug, e.g. "Konark Sun Temple".' },
    },
    zod: z.object({ destination: z.string().min(2).max(100) }),
  },

  get_destination_images: {
    description: 'Licensed photographs of a destination with creator and licence attribution.',
    parameters: {
      destination: { type: 'string' },
      limit: { type: ['integer', 'null'], description: 'Number of images, 1-12. Defaults to 8.' },
    },
    zod: z.object({ destination: z.string().min(2).max(100), limit: z.number().int().min(1).max(12).nullable() }),
  },

  get_weather: {
    description: 'Current conditions and a 5-day forecast for a destination, town, or the user\'s shared location.',
    parameters: {
      place: { ...nullableString, description: 'Destination or town name. Null when using the user location.' },
      use_user_location: { type: 'boolean' },
    },
    zod: z.object({ place: z.string().max(100).nullable(), use_user_location: z.boolean() }),
  },

  get_nearby_places: {
    description:
      'Amenities near a destination, town or the user\'s location, from OpenStreetMap: food, stays, washrooms, hospitals, pharmacies, ATMs and transport.',
    parameters: {
      place: { ...nullableString, description: 'Destination or town name. Null when using the user location.' },
      use_user_location: { type: 'boolean' },
      categories: { type: 'array', items: { type: 'string', enum: NEARBY_CATEGORY_KEYS } },
      radius_meters: { type: ['integer', 'null'], description: '200-5000. Defaults to 1500.' },
    },
    zod: z.object({
      place: z.string().max(100).nullable(),
      use_user_location: z.boolean(),
      categories: z.array(z.enum(NEARBY_CATEGORY_KEYS)).min(1).max(7),
      radius_meters: z.number().int().min(200).max(5000).nullable(),
    }),
  },

  get_route: {
    description:
      'Road route with distance and estimated driving time between two places in Odisha. Origin may be the user\'s shared location.',
    parameters: {
      origin: { ...nullableString, description: 'Origin place name. Null when origin is the user location.' },
      origin_is_user_location: { type: 'boolean' },
      destination: { type: 'string' },
    },
    zod: z.object({
      origin: z.string().max(100).nullable(),
      origin_is_user_location: z.boolean(),
      destination: z.string().min(2).max(100),
    }),
  },

  create_itinerary: {
    description:
      'Build a day-by-day plan from the destination catalogue with measured drive times and a rough cost estimate. Use for "plan a trip", "budget trip" and "travel package" requests within Odisha.',
    parameters: {
      days: { type: 'integer', description: '1-5' },
      base: { type: 'string', enum: Object.keys(BASES), description: 'Starting city.' },
      interests: { type: 'array', items: { type: 'string', enum: CATEGORIES } },
      include_destinations: {
        type: 'array',
        items: { type: 'string' },
        description: 'Destination names or slugs the user explicitly asked for.',
      },
      travelers: { type: ['integer', 'null'], description: '1-20. Defaults to 2.' },
      travel_style: { type: ['string', 'null'], enum: [...TRAVEL_STYLES, null] },
    },
    zod: z.object({
      days: z.number().int().min(1).max(5),
      base: z.enum(Object.keys(BASES)),
      interests: z.array(z.enum(CATEGORIES)).max(5),
      include_destinations: z.array(z.string().max(100)).max(12),
      travelers: z.number().int().min(1).max(20).nullable(),
      travel_style: z.enum(TRAVEL_STYLES).nullable(),
    }),
  },

  update_booking_request: {
    description:
      'Record details for a booking request (trip, hotel, flight or package) as the user gives them. Pass only values the user actually stated in this conversation; use null for everything else. Returns what is still missing and the next question to ask. Nothing is reserved: staff review submitted requests.',
    parameters: {
      type: { type: ['string', 'null'], enum: [...BOOKING_TYPES, null] },
      destination: { ...nullableString, description: 'City or place. May be anywhere in India.' },
      origin: { ...nullableString, description: 'Starting or departure city.' },
      start_date: { ...nullableString, description: 'YYYY-MM-DD. Check-in date for hotels, departure date for flights.' },
      end_date: { ...nullableString, description: 'YYYY-MM-DD. Check-out date for hotels, return date for round-trip flights.' },
      travelers: { type: ['integer', 'null'], description: 'Number of travellers, guests or passengers.' },
      budget_inr: { type: ['number', 'null'], description: 'Total budget in Indian rupees.' },
      travel_style: { type: ['string', 'null'], enum: [...TRAVEL_STYLES, null] },
      hotel_type: { ...nullableString, description: 'e.g. resort, homestay, business hotel.' },
      breakfast: { type: ['boolean', 'null'] },
      accessibility: { ...nullableString },
      trip_type: { type: ['string', 'null'], enum: ['one_way', 'round_trip', null] },
      cabin_class: { type: ['string', 'null'], enum: ['economy', 'premium_economy', 'business', 'first', null] },
      notes: { ...nullableString, description: 'Other preferences in the user\'s words.' },
    },
    zod: z.object({
      type: z.enum(BOOKING_TYPES).nullable(),
      destination: z.string().max(100).nullable(),
      origin: z.string().max(100).nullable(),
      start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
      end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
      travelers: z.number().int().nullable(),
      budget_inr: z.number().nullable(),
      travel_style: z.enum(TRAVEL_STYLES).nullable(),
      hotel_type: z.string().max(60).nullable(),
      breakfast: z.boolean().nullable(),
      accessibility: z.string().max(200).nullable(),
      trip_type: z.enum(['one_way', 'round_trip']).nullable(),
      cabin_class: z.enum(['economy', 'premium_economy', 'business', 'first']).nullable(),
      notes: z.string().max(500).nullable(),
    }),
  },

  discard_booking_request: {
    description: 'Throw away the booking request being collected in this conversation, when the user says they no longer want it.',
    parameters: {},
    zod: z.object({}),
  },

  get_my_booking_requests: {
    description:
      'Show the signed-in user\'s submitted booking requests and their status. Pass a reference such as "OV-1A2B3C" for one request (the card lets the user cancel it).',
    parameters: { reference: { ...nullableString } },
    zod: z.object({ reference: z.string().max(20).nullable() }),
  },

  get_visitor_guidelines: {
    description:
      'Curated visitor rules, etiquette, climate and emergency guidance. Pass a destination for place-specific rules, or null for general Odisha advice.',
    parameters: { destination: { ...nullableString } },
    zod: z.object({ destination: z.string().max(100).nullable() }),
  },
};

// Chat Completions tool format used by Groq.
export const groqTools = Object.entries(TOOL_DEFINITIONS).map(([name, def]) => ({
  type: 'function',
  function: {
    name,
    description: def.description,
    parameters: {
      type: 'object',
      properties: def.parameters,
      required: Object.keys(def.parameters),
      additionalProperties: false,
    },
  },
}));
