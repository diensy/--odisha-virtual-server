// Pipili applique village. Facts checked against: https://en.wikipedia.org/wiki/Pipili,
// https://en.wikipedia.org/wiki/Pipili_appliqu%C3%A9_work, https://puri.odisha.gov.in/en/tourism/tourist-places
const wiki = (title) => ({ label: 'Wikipedia', url: `https://en.wikipedia.org/wiki/${title}` });

export default {
  name: 'Pipili',
  slug: 'pipili',
  category: 'culture',
  tagline: 'The applique town that dresses the chariots of the Rath Yatra',
  summary:
    'A small town between Bhubaneswar and Puri whose artisans make chandua, the bright applique cloth used for the Rath Yatra chariots and sold in its shops.',
  description: [
    'Pipili sits on the road between Bhubaneswar and Puri, where the road to Konark branches off. The Puri district administration describes it as a town famous for applique work, a traditional craft of the local people, and the craft is the town\'s main source of income.',
    'Known in Odia as chandua, Pipili applique is said to owe its origin to the culture of Lord Jagannath in the 12th century. Its best-known use is the colourful cloth covers for the three chariots of the Rath Yatra in Puri, and it is also made into canopies, umbrellas, pillows, seats and ritual dresses for the deities.',
    'Pieces of coloured cloth are cut into shapes such as peacocks, ducks, parrots, elephants, trees, lotus and jasmine flowers, the sun and the half-moon, and stitched onto a base cloth. Today the artisans make both traditional and contemporary items, and the craft is protected by a Geographical Indication.',
  ],
  highlights: [
    "Applique shops and artisans' workshops",
    'Chandua canopies and umbrellas in the Rath Yatra style',
    'Traditional motifs: peacocks, elephants, lotuses, sun and moon',
    'An easy stop on the Bhubaneswar–Puri–Konark route',
  ],
  location: {
    address: 'Pipili, Puri district, Odisha 752104',
    district: 'Puri',
    latitude: 20.12,
    longitude: 85.83,
  },
  visitorInfo: {
    openingHours: null,
    entryFee: null,
    bestTimeToVisit: 'October to March, for comfortable weather.',
    suggestedDuration: '1 hour',
    visitMinutes: 60,
    guidelines: [
      'Workshops are private businesses; ask before photographing artisans at work.',
      'Look for hand-stitched pieces and ask the seller how a piece was made.',
      'Buying directly from the artisans\' shops supports the craft.',
    ],
    accessibility: [],
  },
  keywords: ['pipili', 'pipli', 'applique', 'appliqué', 'chandua', 'chandua work', 'rath yatra', 'handicraft', 'puri'],
  sources: [
    wiki('Pipili'),
    wiki('Pipili_appliqu%C3%A9_work'),
    { label: 'Puri district administration: tourist places', url: 'https://puri.odisha.gov.in/en/tourism/tourist-places' },
  ],
  featured: false,
  order: 22,
  wikiTitle: 'Pipili',
};
