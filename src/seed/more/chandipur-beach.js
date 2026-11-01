// Chandipur Beach. Facts checked against: https://en.wikipedia.org/wiki/Chandipur,_Odisha,
// https://odishatourism.gov.in/en/w/chandipur-beach
const wiki = (title) => ({ label: 'Wikipedia', url: `https://en.wikipedia.org/wiki/${title}` });

export default {
  name: 'Chandipur Beach',
  slug: 'chandipur-beach',
  category: 'beach',
  tagline: 'The beach where the sea walks away and comes back',
  summary:
    'A quiet beach in Balasore district known for its "vanishing sea": at low tide the water draws back by up to about 5 km, leaving a wide, rippled seabed to walk on.',
  description: [
    'Chandipur is a small resort town on the Bay of Bengal, about 16 km from Balasore railway station. Its beach is unusual: at low tide the sea recedes by as much as 5 kilometres, and at high tide the water returns and can cover the beach again.',
    'When the sea is out, the exposed seabed shows rippled sand, shallow pools, red crabs and shells. Horseshoe crabs are found on the stretch towards Mirzapur, near the fishing market and the fishing community at the mouth of the Budhabalanga river (Balaramgadi).',
    'Chandipur is also home to the Integrated Test Range of the DRDO, where missiles such as Prithvi, Agni and Akash have been tested. Seafood is plentiful in the town, and the Panchalingeswar temple and Kuldiha Wildlife Sanctuary are within about 30 km.',
  ],
  highlights: [
    'Walking out on the seabed when the tide is low',
    'The sea returning at high tide',
    'Red crabs and shells on the exposed sand',
    'The Budhabalanga river mouth and fishing harbour at Balaramgadi',
  ],
  location: {
    address: 'Chandipur, Balasore district, Odisha 756025',
    district: 'Balasore',
    latitude: 21.47,
    longitude: 87.02,
  },
  visitorInfo: {
    openingHours: 'Open 24 hours',
    entryFee: 'No entry fee',
    bestTimeToVisit: 'October to March. Check local tide times to see the sea draw back and return.',
    suggestedDuration: '2–3 hours',
    visitMinutes: 150,
    guidelines: [
      'Ask locally about tide times before walking far out; the water returns at high tide and can submerge the beach.',
      'Leave crabs, shells and other creatures where you find them.',
      'Carry water and sun protection; there is little shade on the open sand.',
    ],
    accessibility: [],
  },
  keywords: ['chandipur', 'chandipur beach', 'balasore', 'baleswar', 'vanishing sea', 'hide and seek beach', 'balaramgadi'],
  sources: [
    wiki('Chandipur,_Odisha'),
    { label: 'Odisha Tourism', url: 'https://odishatourism.gov.in/en/w/chandipur-beach' },
  ],
  featured: false,
  order: 30,
  wikiTitle: 'Chandipur,_Odisha',
};
