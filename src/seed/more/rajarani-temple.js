// Rajarani Temple. Facts checked against: https://en.wikipedia.org/wiki/Rajarani_Temple,
// https://www.incredibleindia.gov.in/en/odisha/bhubaneswar/rajarani-temple
const wiki = (title) => ({ label: 'Wikipedia', url: `https://en.wikipedia.org/wiki/${title}` });

export default {
  name: 'Rajarani Temple',
  slug: 'rajarani-temple',
  category: 'temple',
  tagline: 'A sandstone temple famed for its graceful carved figures',
  summary:
    'An 11th-century temple in Bhubaneswar, named after the red and yellow sandstone it is built from and admired for its sculpted guardians and nayikas.',
  description: [
    'The Rajarani Temple stands in Bhubaneswar\'s Old Town. The Archaeological Survey of India dates it on stylistic grounds to the mid-11th century CE, and scholars suggest it may have been built under the Somavamshi kings. Its name comes from the dull red and yellow sandstone used to build it, which is known locally as "rajarani". It is believed to have originally been called Indreshvara.',
    'Built in the Kalinga style on a raised platform, it has two parts: a vimana (sanctum) with a curving spire about 18 metres high, ringed by miniature turrets that give it a rounded look, and a jagamohana (assembly hall) with a pyramidal roof. The sanctum holds no image of a deity, though its features are generally read as Shaiva.',
    'The temple is best known for its sculpture: the guardians of the eight directions around the base, and tall, slender female figures on the walls of the sanctum, shown looking into a mirror, tending a child or caressing a pet bird. It is a ticketed monument protected by the ASI, and every January Odisha Tourism holds the Rajarani Music Festival here.',
  ],
  highlights: [
    'The rounded spire ringed by miniature turrets',
    'Carved guardians of the eight directions (ashtadikpalas)',
    'Graceful nayika figures on the sanctum walls',
    'The Rajarani Music Festival every January',
  ],
  location: {
    address: 'Tankapani Road, Bhubaneswar, Khordha district, Odisha',
    district: 'Khordha',
    latitude: 20.2434,
    longitude: 85.8435,
  },
  visitorInfo: {
    openingHours: '6:00 am to 7:00 pm (as listed by Incredible India, Ministry of Tourism)',
    entryFee: null,
    bestTimeToVisit: 'October to March. The Rajarani Music Festival is held here in January.',
    suggestedDuration: '1 hour',
    visitMinutes: 60,
    guidelines: [
      'This is a ticketed ASI monument; buy tickets at the counter or through the ASI online booking.',
      'Climbing on the temple and touching the carvings is not permitted.',
      'Combine the visit with the nearby Mukteshvara and Lingaraja temples in the Old Town.',
    ],
    accessibility: [],
  },
  keywords: ['rajarani', 'raja rani', 'rajarani temple', 'indreshvara', 'love temple', 'bhubaneswar', 'rajarani music festival'],
  sources: [
    wiki('Rajarani_Temple'),
    { label: 'Incredible India (Ministry of Tourism)', url: 'https://www.incredibleindia.gov.in/en/odisha/bhubaneswar/rajarani-temple' },
  ],
  featured: false,
  order: 20,
  wikiTitle: 'Rajarani_Temple',
};
