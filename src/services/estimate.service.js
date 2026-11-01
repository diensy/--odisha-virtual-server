/**
 * Rough trip cost estimates for planning. These are editorial planning rates, not quotes:
 * nothing here comes from a hotel, cab or airline. Adjust the figures below as you learn
 * local prices; every estimate shown to users lists the assumptions it used.
 */

// Per night, per room (2 guests).
const STAY_PER_ROOM_NIGHT = { budget: 1500, standard: 3500, luxury: 9000 };
// Per person, per day.
const FOOD_PER_PERSON_DAY = { budget: 600, standard: 1200, luxury: 2800 };
// Entry tickets, guides, tips and small purchases, per person per day.
const EXTRAS_PER_PERSON_DAY = { budget: 150, standard: 300, luxury: 600 };

// Chauffeur-driven hire, chosen by group size; charged per km with a daily minimum.
const VEHICLES = [
  { maxTravelers: 4, name: 'sedan', perKm: 13, minPerDay: 2800 },
  { maxTravelers: 7, name: 'SUV', perKm: 17, minPerDay: 3600 },
  { maxTravelers: 20, name: 'tempo traveller', perKm: 24, minPerDay: 5000 },
];

// Styles that describe who is travelling rather than how much they spend use standard rates.
const RATE_TIER = { budget: 'budget', standard: 'standard', luxury: 'luxury', adventure: 'standard', family: 'standard', couple: 'standard' };

const roundTo = (n, step = 100) => Math.round(n / step) * step;

/**
 * @param {{ days: number, totalDistanceKm: number | null, travelers: number, travelStyle?: string }} input
 */
export function estimateTripCost({ days, totalDistanceKm, travelers, travelStyle = 'standard' }) {
  const tier = RATE_TIER[travelStyle] ?? 'standard';
  const nights = Math.max(days - 1, 0);
  const rooms = Math.ceil(travelers / 2);
  const vehicle = VEHICLES.find((v) => travelers <= v.maxTravelers);
  const km = totalDistanceKm ?? null;

  const lines = [
    {
      key: 'stay',
      label: 'Stay',
      amount: roundTo(nights * rooms * STAY_PER_ROOM_NIGHT[tier]),
      basis: nights ? `${nights} night${nights > 1 ? 's' : ''} × ${rooms} room${rooms > 1 ? 's' : ''} × ₹${STAY_PER_ROOM_NIGHT[tier].toLocaleString('en-IN')}` : 'Day trip, no overnight stay',
    },
    {
      key: 'food',
      label: 'Food',
      amount: roundTo(travelers * days * FOOD_PER_PERSON_DAY[tier]),
      basis: `${travelers} × ${days} day${days > 1 ? 's' : ''} × ₹${FOOD_PER_PERSON_DAY[tier].toLocaleString('en-IN')}`,
    },
    {
      key: 'transport',
      label: `Local transport (${vehicle.name} with driver)`,
      amount: roundTo(Math.max((km ?? 0) * vehicle.perKm, days * vehicle.minPerDay)),
      basis:
        km != null
          ? `${Math.round(km)} km × ₹${vehicle.perKm}/km, minimum ₹${vehicle.minPerDay.toLocaleString('en-IN')}/day`
          : `Road distance unavailable; daily minimum of ₹${vehicle.minPerDay.toLocaleString('en-IN')} used`,
    },
    {
      key: 'extras',
      label: 'Entry fees, guides and extras',
      amount: roundTo(travelers * days * EXTRAS_PER_PERSON_DAY[tier]),
      basis: `Allowance of ₹${EXTRAS_PER_PERSON_DAY[tier]} per person per day`,
    },
  ];

  const total = lines.reduce((n, l) => n + l.amount, 0);
  return {
    currency: 'INR',
    travelers,
    travelStyle,
    lines,
    total,
    range: { low: roundTo(total * 0.85, 500), high: roundTo(total * 1.2, 500) },
    perPerson: roundTo(total / travelers),
    isEstimate: true,
    assumptions: [
      'Planning estimate only, not a quote. Real prices vary by season, festival dates and availability.',
      'Travel to and from Odisha (flights or trains) is not included.',
      `${tier[0].toUpperCase()}${tier.slice(1)} rates assumed for stays and food.`,
    ],
  };
}
