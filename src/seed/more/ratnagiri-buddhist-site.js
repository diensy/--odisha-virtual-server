// Ratnagiri Buddhist site. Facts checked against: https://en.wikipedia.org/wiki/Ratnagiri,_Odisha,
// https://www.buddhistdoor.net/news/new-treasures-unearthed-at-ongoing-ratnagiri-archaeological-excavation-in-odisha-india/
const wiki = (title) => ({ label: 'Wikipedia', url: `https://en.wikipedia.org/wiki/${title}` });

export default {
  name: 'Ratnagiri Buddhist Site',
  slug: 'ratnagiri-buddhist-site',
  category: 'heritage',
  tagline: 'The ruined "hill of jewels", once Odisha\'s great Buddhist monastery',
  summary:
    'The excavated ruins of a mahavihara that flourished from about the 7th to the 10th centuries, with a great stupa, carved monasteries and a site museum.',
  description: [
    'Ratnagiri, the "hill of jewels", rises between the Brahmani and Birupa rivers in Jajpur district. It was likely founded no later than the first half of the 6th century and was once the major Buddhist monastery in what is now Odisha. Building went on from around the 5th to the 13th century, with its peak between roughly the 7th and 10th centuries.',
    'The largest monastery, built in at least two phases, had at least two storeys and a courtyard ringed by cells. Its shrine holds a colossal seated Buddha about 3.7 metres high, and its carved doorway is counted among the finest in India. Nearby stands the main stupa, surrounded by more than 700 smaller votive stupas. A Tibetan history names Ratnagiri as an important centre of the Kalachakra tradition in the 10th century.',
    'The Archaeological Survey of India excavated the site between 1958 and 1961, with reports by the archaeologist Debala Mitra, and digging resumed in December 2024. Ratnagiri forms the "Diamond Triangle" with the nearby Buddhist sites of Lalitgiri and Udayagiri, and the site museum displays sculptures, bronzes and clay seals found here.',
  ],
  highlights: [
    'Monastery 1, with its colossal seated Buddha and carved doorway',
    'The main stupa ringed by hundreds of votive stupas',
    'Colossal Buddha heads and sculpture in the site museum',
    'Part of the Diamond Triangle with Lalitgiri and Udayagiri',
  ],
  location: {
    address: 'Ratnagiri, Jajpur district, Odisha',
    district: 'Jajpur',
    latitude: 20.6412,
    longitude: 86.3353,
  },
  visitorInfo: {
    openingHours: null,
    entryFee: null,
    bestTimeToVisit: 'October to March, when the open site is most comfortable to walk.',
    suggestedDuration: '2–3 hours, including the museum',
    visitMinutes: 150,
    guidelines: [
      'The site is about 100 km from Bhubaneswar; plan a full day to combine it with Lalitgiri and Udayagiri.',
      'Do not climb on the stupas or monastery walls.',
      'The site is open and exposed; carry water and sun protection.',
      'Check the museum\'s weekly closing day and current ticketing with the ASI before you travel.',
    ],
    accessibility: [],
  },
  keywords: ['ratnagiri', 'ratnagiri odisha', 'ratnagiri monastery', 'mahavihara', 'buddhist', 'stupa', 'diamond triangle', 'jajpur'],
  sources: [
    wiki('Ratnagiri,_Odisha'),
    {
      label: 'Buddhistdoor Global (2025 excavation report)',
      url: 'https://www.buddhistdoor.net/news/new-treasures-unearthed-at-ongoing-ratnagiri-archaeological-excavation-in-odisha-india/',
    },
  ],
  featured: false,
  order: 21,
  wikiTitle: 'Ratnagiri,_Odisha',
};
