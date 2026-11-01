// Similipal National Park. Facts checked against: https://en.wikipedia.org/wiki/Simlipal_National_Park,
// https://odishatourism.gov.in/en/w/similipal-national-park, https://similipal.org/,
// https://similipal.org/how-to-reach/, https://similipal.org/faq/,
// https://www.orissapost.com/similipal-tiger-reserve-to-reopen-for-tourists-november-1/ (PTI, 15 Oct 2026)
const wiki = (title) => ({ label: 'Wikipedia', url: `https://en.wikipedia.org/wiki/${title}` });

export default {
  name: 'Similipal National Park',
  slug: 'similipal-national-park',
  category: 'nature',
  tagline: 'Sal forests, high waterfalls and Odisha\'s dark-striped tigers',
  summary:
    'A tiger reserve, national park and UNESCO biosphere reserve in Mayurbhanj, with dense sal forest, the Barehipani and Joranda waterfalls, and a tiger population known for its unusually dark coats.',
  description: [
    'Similipal spreads across about 2,750 km² of hills, plateaus and river valleys in Mayurbhanj district and is Odisha\'s largest protected area. It takes its name from the simul, or red silk cotton tree, which grows here in abundance. Peaks such as Khairiburu and Meghasani rise above 1,100 metres, and at least twelve rivers, including the Budhabalanga, flow out of the forest.',
    'Once a royal hunting ground of the Mayurbhanj rulers, it became one of India\'s first tiger reserves under Project Tiger in 1973. It was declared a biosphere reserve in 1994 and joined UNESCO\'s World Network of Biosphere Reserves in 2009.',
    'Its tigers are isolated from other populations, and many of them show pseudo-melanism, with broad dark stripes that make them look almost black. Elephants, gaur, leopards, sambar and more than 240 bird species also live here, along with over 90 species of orchid. Barehipani Falls drops about 217 metres and Joranda about 181 metres; both are at their best after the monsoon.',
  ],
  highlights: [
    'Barehipani Falls, about 217 m high',
    'Joranda Falls, about 181 m high',
    'Pseudo-melanistic (dark-coated) tigers',
    'Elephants, gaur and rich birdlife in the sal forest',
    'More than 90 species of orchid',
  ],
  location: {
    address: 'Similipal Tiger Reserve, Baripada, Mayurbhanj district, Odisha 757001',
    district: 'Mayurbhanj',
    latitude: 21.8333,
    longitude: 86.3333,
    visitorPointNote:
      'Map and weather use the park coordinates given on Wikipedia, not a gate. Visitors enter through the Jashipur-side (Kaliani) gate or the Pithabata gate on the Baripada side; Jashipur is about 20 km away and Baripada is the reserve\'s postal address.',
  },
  visitorInfo: {
    openingHours:
      '6:00 AM to 6:00 PM, as per forest department norms. Closed to tourists during the monsoon; in 2026 it closed on 29 June and reopens on 1 November.',
    entryFee: 'Entry fee applicable as per forest department norms.',
    bestTimeToVisit: 'November to June. The waterfalls are at their best soon after the monsoon.',
    suggestedDuration: '1–2 days',
    visitMinutes: 600,
    guidelines: [
      'Every visitor needs an entry permit; book online through similipal.org or the state eco-tourism portal before you travel.',
      'Carry valid government photo ID matching your booking; a written undertaking to follow the rules is collected at the gate.',
      'Each tourist vehicle must take a guide. Leave the waterfalls by 4 pm and exit the reserve by 6 pm the same day (2026 rules).',
      'Campfires are not allowed; avoid plastic and littering.',
      'The area is a high-risk zone for malaria; take precautions against mosquito bites.',
    ],
    accessibility: [],
  },
  keywords: ['similipal', 'simlipal', 'mayurbhanj', 'tiger reserve', 'black tiger', 'melanistic tiger', 'barehipani', 'joranda', 'jashipur', 'baripada'],
  sources: [
    wiki('Simlipal_National_Park'),
    { label: 'Odisha Tourism', url: 'https://odishatourism.gov.in/en/w/similipal-national-park' },
    { label: 'Similipal Tiger Reserve', url: 'https://similipal.org/' },
    { label: 'OrissaPOST (PTI), reopening notice, Oct 2026', url: 'https://www.orissapost.com/similipal-tiger-reserve-to-reopen-for-tourists-november-1/' },
  ],
  featured: false,
  order: 33,
  wikiTitle: 'Simlipal_National_Park',
};
