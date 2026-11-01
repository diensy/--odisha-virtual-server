// Gopalpur Beach. Facts checked against: https://en.wikipedia.org/wiki/Gopalpur,_Odisha,
// https://odishatourism.gov.in/en/w/gopalpur-sea-beach,
// https://apps.odishatourism.gov.in/blog-detail/the-british-isque-idyllic-town-of-gopalpur-on-sea,
// https://ganjam.odisha.gov.in/en/tourism/tourist-places/gopalpur-sea,
// https://dgll.nic.in/DGLL-light-house-location/about-kolkata/gopalpur-lighthouse
const wiki = (title) => ({ label: 'Wikipedia', url: `https://en.wikipedia.org/wiki/${title}` });

export default {
  name: 'Gopalpur Beach',
  slug: 'gopalpur-beach',
  category: 'beach',
  tagline: 'A quiet beach in an old port town, with a lighthouse',
  summary:
    'The beach of Gopalpur-on-Sea in Ganjam district, a former colonial port about 15 km from Brahmapur, with golden sand, a historic lighthouse and the ruins of old warehouses.',
  description: [
    'Gopalpur, often called Gopalpur-on-Sea, is a small town on the Bay of Bengal in Ganjam district, about 15 km from Brahmapur. Its long, quiet beach is backed by coconut groves, casuarina trees and sand dunes.',
    'The town has a long maritime past. Wikipedia notes a seaport here in the days of maritime Kalinga, used by travellers to South-East Asia, and in colonial times it became a trading port: the East India Company built warehouses as the rice trade with Rangoon grew. The ruins of some of these buildings still stand near the shore.',
    'The lighthouse is the town\'s best-known landmark; according to the Directorate General of Lighthouses and Lightships, its first light was commissioned in 1871. The old jetty is now a spot for visitors, and the Gopalpur Beach Festival was first held in 1996.',
  ],
  highlights: [
    'The long, quiet beach with dunes and casuarina groves',
    'The lighthouse, first lit in 1871',
    'Ruins of colonial-era port warehouses',
    'The old jetty',
    'Fresh seafood and seashell crafts sold near the beach',
  ],
  location: {
    address: 'Gopalpur, Ganjam district, Odisha 761002',
    district: 'Ganjam',
    latitude: 19.27,
    longitude: 84.92,
  },
  visitorInfo: {
    openingHours: 'Open 24 hours',
    entryFee: 'No entry fee',
    bestTimeToVisit: 'October to February.',
    suggestedDuration: '2–3 hours',
    visitMinutes: 150,
    guidelines: [
      'Swim only where local lifeguards or signs indicate it is safe.',
      'The old warehouses are ruins; view them from outside.',
      'Keep the beach clean and carry your litter back with you.',
    ],
    accessibility: [],
  },
  keywords: ['gopalpur', 'gopalpur-on-sea', 'gopalpur on sea', 'ganjam', 'brahmapur', 'berhampur', 'lighthouse'],
  sources: [
    wiki('Gopalpur,_Odisha'),
    { label: 'Odisha Tourism', url: 'https://odishatourism.gov.in/en/w/gopalpur-sea-beach' },
    { label: 'Directorate General of Lighthouses and Lightships', url: 'https://dgll.nic.in/DGLL-light-house-location/about-kolkata/gopalpur-lighthouse' },
  ],
  featured: false,
  order: 31,
  wikiTitle: 'Gopalpur,_Odisha',
};
