// Barabati Fort. Facts checked against: https://en.wikipedia.org/wiki/Barabati_fort,
// https://en.wikipedia.org/wiki/Cuttack, https://www.incredibleindia.gov.in/en/odisha/cuttack/barabati-fort,
// https://livehistoryindia.com/story/monuments/barabati-fort
const wiki = (title) => ({ label: 'Wikipedia', url: `https://en.wikipedia.org/wiki/${title}` });

export default {
  name: 'Barabati Fort',
  slug: 'barabati-fort',
  category: 'heritage',
  tagline: 'The moated fort at the heart of old Cuttack',
  summary:
    'The ruins of the medieval fort around which Cuttack grew, with a stone gateway, a wide moat and the mound of a vanished palace, protected by the ASI since 1915.',
  description: [
    'Barabati Fort stands where the Mahanadi and its branch, the Kathajodi, divide at the head of their delta. Sources differ on its beginnings: it is often credited to the Somavamshi king Marakata Keshari in the late 10th century, while the fort as it is known is linked to the Eastern Ganga kings in the 13th century. Cuttack itself first grew up around it.',
    'The fort passed to the Karranis of Bengal in 1568, to the Mughals in 1576 and to the Marathas in the mid-18th century, before the British took it in 1803. Its stone was carried away over the following decades, and little now stands above ground.',
    'What survives is a square site of about 102 acres: a stone-paved moat, a stone gateway, and a central earthen mound where excavations have revealed the remains of a palace. Popular belief holds that the palace had nine storeys, a claim historians still debate. The Shahi Mosque and the tomb of Hazrat Ali Bukhari stand within the grounds, and the Barabati cricket stadium, named after the fort, lies beside it.',
  ],
  highlights: [
    'The surviving gateway of the fort',
    'The wide moat around the site',
    'The central mound with excavated palace remains',
    'The Shahi Mosque within the fort grounds',
  ],
  location: {
    address: 'Barabati, Cuttack, Odisha',
    district: 'Cuttack',
    latitude: 20.4846,
    longitude: 85.8644,
  },
  visitorInfo: {
    openingHours: '6:00 am to 6:00 pm (as listed by Incredible India, Ministry of Tourism)',
    entryFee: null,
    bestTimeToVisit: 'October to February, when the weather is cooler. Cuttack\'s Bali Jatra fair is held on the Mahanadi bank every November.',
    suggestedDuration: '1 hour',
    visitMinutes: 60,
    guidelines: [
      'The fort is a protected monument; do not climb on or remove stone from the ruins.',
      'Much of the site is open ground with little shade; carry water in the warmer months.',
      'Combine the visit with other Cuttack sights such as the Cuttack Chandi Temple and the Netaji Birthplace Museum.',
    ],
    accessibility: [],
  },
  keywords: ['barabati', 'barabati fort', 'barabati killa', 'cuttack fort', 'cuttack', 'gadakhai', 'moat'],
  sources: [
    wiki('Barabati_fort'),
    wiki('Cuttack'),
    { label: 'Incredible India (Ministry of Tourism)', url: 'https://www.incredibleindia.gov.in/en/odisha/cuttack/barabati-fort' },
    { label: 'Live History India', url: 'https://livehistoryindia.com/story/monuments/barabati-fort' },
  ],
  featured: false,
  order: 24,
  wikiTitle: 'Barabati_fort',
};
