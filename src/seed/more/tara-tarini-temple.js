// Tara Tarini Temple. Facts checked against: https://en.wikipedia.org/wiki/Tara_Tarini_Mandir,
// https://taratarini.nic.in/tt/history.htm, https://taratarini.nic.in/tt/festi.htm,
// https://taratarini.nic.in/tt/getting.htm, https://taratarini.nic.in/tt/ropeway.htm
const wiki = (title) => ({ label: 'Wikipedia', url: `https://en.wikipedia.org/wiki/${title}` });

export default {
  name: 'Tara Tarini Temple',
  slug: 'tara-tarini-temple',
  category: 'temple',
  tagline: 'A hilltop Shakti shrine above the Rushikulya river',
  summary:
    'A revered hilltop shrine to the twin goddesses Tara and Tarini near Berhampur, regarded by devotees as one of the oldest Shakti pithas of Odisha.',
  description: [
    'The Tara Tarini temple crowns the Kumari hills on the bank of the Rushikulya river, near Purushottampur in Ganjam district, about 30 km from Berhampur. The twin goddesses Tara and Tarini, worshipped as forms of Adi Shakti, are regarded as the presiding deities of almost every home in southern Odisha.',
    'In the sanctum, the goddesses are two stones shaped like human faces and adorned with gold and silver; between them are two brass heads used as their movable images. According to Puranic legend, this is where the breasts of Sati fell, and the temple is counted among the Adi Shakti pithas. A small image of the Buddha in meditation also sits in the sanctum, and some have linked the name Tara to Buddhist worship in ancient Kalinga.',
    'Pilgrims climb 999 steps up the front of the hill, drive up a road at the back, or ride the ropeway from the foothill. The biggest gathering is the Chaitra Parba, held on the Tuesdays of the month of Chaitra (March–April), when many families bring children for their first tonsure.',
  ],
  highlights: [
    'Hilltop views over the Rushikulya river',
    'The twin goddesses Tara and Tarini in the sanctum',
    'The 999-step climb, or the ropeway from the foothill',
    'Chaitra Parba on the Tuesdays of Chaitra',
  ],
  location: {
    address: 'Kumari hills, near Purushottampur, Ganjam district, Odisha 761018',
    district: 'Ganjam',
    latitude: 19.4897,
    longitude: 84.8998,
  },
  visitorInfo: {
    openingHours: null,
    entryFee: null,
    bestTimeToVisit:
      'October to March for pleasant weather. The Chaitra Parba (Tuesdays in March–April) is the main festival and draws very large crowds.',
    suggestedDuration: '2–3 hours',
    visitMinutes: 150,
    guidelines: [
      'The nearest railway station is Berhampur, about 32 km away; taxis and buses run from Berhampur.',
      'The climb is 999 steps; there is also a road at the back of the hill and a ropeway from the foothill.',
      'Remove footwear before entering the shrine and dress modestly.',
      'On Sankranti days the deities\' images are placed near the gate and offerings are made there, not in the sanctum; follow the temple staff\'s directions.',
    ],
    accessibility: ['The hilltop can be reached by road or by ropeway instead of the steps.'],
  },
  keywords: ['tara tarini', 'taratarini', 'tara tarini mandir', 'shakti peeth', 'shakti pitha', 'kumari hills', 'rushikulya', 'berhampur', 'brahmapur', 'ganjam', 'chaitra parba'],
  sources: [
    wiki('Tara_Tarini_Mandir'),
    { label: 'Taratarini Development Board: history', url: 'https://taratarini.nic.in/tt/history.htm' },
    { label: 'Taratarini Development Board: festivals', url: 'https://taratarini.nic.in/tt/festi.htm' },
  ],
  featured: false,
  order: 23,
  wikiTitle: 'Tara_Tarini_Mandir',
};
