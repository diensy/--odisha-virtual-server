// Satkosia Gorge / Satkosia Tiger Reserve. Facts checked against: https://en.wikipedia.org/wiki/Satkosia_Tiger_Reserve,
// https://odishatourism.gov.in/en/w/satkosia-gorge-tiger-reserve,
// https://apps.odishatourism.gov.in/forest-wildlife, https://www.satkosia.org/
const wiki = (title) => ({ label: 'Wikipedia', url: `https://en.wikipedia.org/wiki/${title}` });

export default {
  name: 'Satkosia Gorge',
  slug: 'satkosia-gorge',
  category: 'nature',
  tagline: 'Where the Mahanadi cuts a 22 km gorge through the Eastern Ghats',
  summary:
    'A tiger reserve built around the Satkosia gorge of the Mahanadi, with sal forest, elephants, and sandbanks where gharials and mugger crocodiles bask.',
  description: [
    'At Satkosia the Mahanadi, Odisha\'s longest river, forces its way through the Eastern Ghats in a gorge about 22 km long. The name is usually explained as "seven kos", an old measure of distance. The reserve sits where the Eastern Ghats meet the Deccan plateau and spreads across Angul and Nayagarh districts.',
    'The forests around the gorge were notified as the Satkosia Gorge Sanctuary in 1976, and the neighbouring Baisipalli Sanctuary followed in 1981. The two were combined as Satkosia Tiger Reserve in 2007. Wikipedia gives its area as about 964 km²; the reserve\'s own site gives about 1,137 km² after a 2018 boundary change.',
    'Mixed deciduous sal forest and riverside woodland shelter elephants, leopards, sloth bears, sambar and spotted deer, while gharials and mugger crocodiles bask on the river\'s sandbars. Odisha Tourism calls it the only place in the state where both can be seen. Eco-camps at Tikarpada, Chhotkei and Baghamunda, and river cruises at Badmul, are the usual ways to explore.',
  ],
  highlights: [
    'The 22 km Mahanadi gorge',
    'Gharials and mugger crocodiles on the sandbars',
    'River cruises at Badmul',
    'Eco-camps at Tikarpada, Chhotkei and Baghamunda',
    'Elephants and birdlife in sal forest',
  ],
  location: {
    address: 'Tikarpada, Angul district, Odisha 759132',
    district: 'Angul',
    latitude: 20.5401,
    longitude: 84.8316,
    visitorPointNote:
      'Map and weather use the reserve coordinates given on Wikipedia, not a specific camp or gate. The reserve also extends into Nayagarh district; Tikarpada on the Mahanadi is one of the main eco-camps.',
  },
  visitorInfo: {
    openingHours: '9:00 AM to 6:00 PM; closed every Tuesday.',
    entryFee: 'Nominal entry fee; safari, boating and eco-camps are charged separately.',
    bestTimeToVisit: 'November to March.',
    suggestedDuration: '1–2 days',
    visitMinutes: 480,
    guidelines: [
      'The reserve is closed to visitors every Tuesday.',
      'Book eco-camps and river cruises in advance through the reserve or the state eco-tourism service.',
      'Keep a safe distance from elephants and from crocodiles on the river banks.',
      'Do not leave plastic or litter in the forest or on the sandbars.',
    ],
    accessibility: [],
  },
  keywords: ['satkosia', 'satkosia gorge', 'satkosia tiger reserve', 'mahanadi', 'tikarpada', 'gharial', 'baisipalli', 'angul', 'nayagarh', 'badmul'],
  sources: [
    wiki('Satkosia_Tiger_Reserve'),
    { label: 'Odisha Tourism', url: 'https://odishatourism.gov.in/en/w/satkosia-gorge-tiger-reserve' },
    { label: 'Satkosia Tiger Reserve', url: 'https://www.satkosia.org/' },
  ],
  featured: false,
  order: 34,
  wikiTitle: 'Satkosia_Tiger_Reserve',
};
