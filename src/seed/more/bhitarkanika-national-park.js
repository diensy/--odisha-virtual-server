// Bhitarkanika National Park. Facts checked against: https://en.wikipedia.org/wiki/Bhitarkanika_National_Park,
// https://odishatourism.gov.in/en/w/bhitarkanika-national-park,
// https://apps.odishatourism.gov.in/forest-wildlife,
// https://roundglasssustain.com/species/saltwater-crocodile-bhitarkanika
const wiki = (title) => ({ label: 'Wikipedia', url: `https://en.wikipedia.org/wiki/${title}` });

export default {
  name: 'Bhitarkanika National Park',
  slug: 'bhitarkanika-national-park',
  category: 'nature',
  tagline: 'Mangrove creeks ruled by saltwater crocodiles',
  summary:
    'A maze of mangrove forests and tidal creeks in the delta of the Brahmani, Baitarani and Dhamra rivers, home to India\'s largest population of saltwater crocodiles and a Ramsar wetland since 2002.',
  description: [
    'Bhitarkanika lies in north-eastern Kendrapara district, where the Brahmani, Baitarani, Dhamra and Pathsala rivers spread into a web of creeks, mudflats and floodplains before reaching the Bay of Bengal. Its mangroves form the second-largest mangrove ecosystem in India.',
    'The area was declared a wildlife sanctuary of about 672 km² in 1975, and its 145 km² core became a national park in 1998. In 2002 it was designated a Ramsar site, the second in Odisha after Chilika. A crocodile conservation project begun at Dangmal in 1975 helped saltwater crocodile numbers recover; a January 2022 census counted 1,784.',
    'Besides crocodiles, the creeks shelter water monitors, spotted deer, otters and fishing cats, and about 320 bird species have been recorded, including eight kinds of kingfisher. Odisha Tourism describes the park as having India\'s largest heronry. Most visits are by boat along the creeks.',
  ],
  highlights: [
    'Boat rides through mangrove creeks',
    'Saltwater crocodiles basking on the mudbanks',
    'The crocodile conservation centre at Dangmal',
    'Kingfishers, herons and winter migratory birds',
  ],
  location: {
    address: 'Rajnagar, Kendrapara district, Odisha 754225',
    district: 'Kendrapara',
    latitude: 20.75,
    longitude: 87.0,
    visitorPointNote:
      'Map and weather use the park coordinates given on Wikipedia, not a specific gate. Odisha Tourism lists the park as accessible via Rajnagar.',
  },
  visitorInfo: {
    openingHours: '8:00 AM to 5:00 PM. Closed to visitors from 1 May to 31 July for the crocodile breeding season.',
    entryFee: 'Entry fee applicable as per forest department norms.',
    bestTimeToVisit: 'October to March.',
    suggestedDuration: '1–2 days',
    visitMinutes: 480,
    guidelines: [
      'Stay inside the boat and keep hands out of the water; the creeks hold large saltwater crocodiles.',
      'Do not feed or disturb wildlife, and do not leave plastic or litter.',
      'Check the closure dates with the forest department before planning a trip in May, June or July.',
    ],
    accessibility: [],
  },
  keywords: ['bhitarkanika', 'bhitarkanika national park', 'kendrapara', 'dangmal', 'mangroves', 'saltwater crocodile', 'crocodile', 'ramsar', 'rajnagar'],
  sources: [
    wiki('Bhitarkanika_National_Park'),
    { label: 'Odisha Tourism', url: 'https://odishatourism.gov.in/en/w/bhitarkanika-national-park' },
    { label: 'Roundglass Sustain: Saltwater crocodiles in Bhitarkanika', url: 'https://roundglasssustain.com/species/saltwater-crocodile-bhitarkanika' },
  ],
  featured: false,
  order: 32,
  wikiTitle: 'Bhitarkanika_National_Park',
};
