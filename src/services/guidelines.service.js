import { getDestinationDoc } from './destination.service.js';

// Curated general guidance. Each item is kept short and tied to a source the team has checked.
export const GENERAL_GUIDELINES = [
  {
    title: 'Emergencies',
    items: ['Dial 112 for police, fire or ambulance anywhere in India.'],
    source: { label: 'Emergency Response Support System (112 India)', url: 'https://112.gov.in/' },
  },
  {
    title: 'Tourist helpline',
    items: ['The Ministry of Tourism runs a multilingual tourist helpline on 1800-11-1363 (toll free) or 1363.'],
    source: { label: 'Ministry of Tourism, Government of India', url: 'https://tourism.gov.in/' },
  },
  {
    title: 'Visiting temples',
    items: [
      'Remove footwear before entering temple premises; most large temples have a paid or free shoe stand.',
      'Wear clothing that covers shoulders and knees.',
      'Leather items, cameras and phones are not permitted inside several major temples, including the Jagannath Temple in Puri. Look for the deposit counter near the entrance.',
      'Entry to the Jagannath Temple in Puri is restricted to Hindus. Check the guidance for each temple before you go.',
    ],
    source: { label: 'Shree Jagannath Temple Administration', url: 'https://shreejagannatha.in/' },
  },
  {
    title: 'Climate',
    items: [
      'October to March is the most comfortable season for sightseeing along the coast.',
      'The monsoon usually runs from June to September; coastal Odisha can be affected by cyclones in May and from October to November. Check advisories before travelling.',
    ],
    source: { label: 'India Meteorological Department', url: 'https://mausam.imd.gov.in/' },
  },
];

export async function getGuidelines(slug) {
  if (!slug) return { destination: null, sections: GENERAL_GUIDELINES };
  const d = await getDestinationDoc(slug);
  return {
    destination: { name: d.name, slug: d.slug },
    sections: [
      {
        title: `At ${d.name}`,
        items: d.visitorInfo.guidelines,
        source: d.sources[0] ?? null,
      },
      ...GENERAL_GUIDELINES.filter((g) => g.title === 'Emergencies'),
    ].filter((s) => s.items.length),
    visitorInfo: d.visitorInfo,
  };
}
