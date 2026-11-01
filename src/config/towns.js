// Town centres. When someone names a town ("from Puri") they mean the town, not a landmark in it.
export const TOWNS = {
  bhubaneswar: { name: 'Bhubaneswar', lat: 20.2961, lng: 85.8245 },
  puri: { name: 'Puri', lat: 19.8135, lng: 85.8312 },
  konark: { name: 'Konark', lat: 19.8877, lng: 86.0945 },
  cuttack: { name: 'Cuttack', lat: 20.4625, lng: 85.883 },
};

export const findTown = (text) => TOWNS[text?.trim().toLowerCase().replace(/^(the )?(city|town) of /, '')] ?? null;
