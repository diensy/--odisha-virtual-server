// Editorial picks after reviewing the imported photos: "prefer" files lead the gallery
// (the first becomes the hero image) and "exclude" files are dropped, usually because the
// article illustrates a different place or the file is not a photograph of the site.
const f = (names) => names.map((n) => `File:${n}`);

export const IMAGE_OVERRIDES = {
  'konark-sun-temple': {
    prefer: f(['Konarka Temple.jpg', 'Konarak Temple 02.jpg', 'Closeup of the center of a stone wheel - Konark Sun Temple, Orissa, India.jpg']),
    exclude: f(['India1961-238 hg.jpg', 'Konarak, Orissa, British Museum.jpg', 'Iron pillar used in temple.jpg']),
  },
  'jagannath-temple-puri': {
    prefer: f(['ABX SHRI PURUSHOTTAMA KSHETRA PURI.jpg', 'Bird view of Jagannath Temple, Puri.jpg', 'Rath Yatra Puri 07-11027.jpg']),
    exclude: f([
      'Badrinath Temple - OCT 2014.jpg',
      'East Gopura of Rameswaram Temple.jpg',
      'Sri Mariamman Temple Singapore 2 amk.jpg',
      'Gajapati Maharaja Dibyasingha Deb 2.jpg',
      'Shri Jagannath Temple,Puri.jpg',
    ]),
  },
  'lingaraja-temple': {
    prefer: f(['Lingaraj Temple Complex.jpg', 'Lingaraj Temple complex at dusk during Shivratri 2020.jpg', 'Bhuvanesvar1016.jpg']),
    exclude: f(['India statue of nataraja.jpg', 'Bhubaneswar, India, ca. 1906 (IMP-CSCNWW33-OS14-56).jpg']),
  },
  'chilika-lake': {
    prefer: f(['Chilika Bhubaneswar.me.jpg', 'Birds eyeview of Chilika Lake.jpg']),
    exclude: f([
      'Konark Sun Temple Wheel.jpg',
      'Chilka Rail Station.jpg',
      'Chilka-North-c.jpg',
      'Chilka-S-c.jpg',
      'Aerial satellite imagery of Chilika lake, Odisha.JPG',
      'Parikuda Iseland Chilika.jpg',
      'Chilika Lake 4.jpg',
    ]),
  },
  dhauli: { prefer: f(['ShantiSthupa Dhauli.jpg', 'Elephant-sculpture-dhauli.JPG', 'Rock edicts of Ashoka at Dhauli.jpg']) },
  'udayagiri-khandagiri-caves': { prefer: f(['Khandagari and Udaygiri featured image.jpg']) },
  'mukteshvara-temple': {
    prefer: f(['Mukteshwar torana.jpg', 'Muktesvar Temple.jpg', 'Mukteswar Temple 01.jpg']),
    exclude: f(['India statue of nataraja.jpg']),
  },
  'golden-beach-puri': { prefer: f(['At Puri beach 05.jpg', 'Puri Sea Beach viewed from the light house.jpg']) },
  'chandrabhaga-beach': {
    prefer: f(['Chandrabhaga Sea Beach, Konark.jpg', 'Beach of Konark 01.jpg', 'Beach of Konark 02.jpg', 'Chandrabhaga beach.jpg']),
  },
  raghurajpur: {
    prefer: f([
      'Raghurajpur - Decorated Village House.jpg',
      'Raghurajpur Tales.jpg',
      'Raghurajpur 7.jpg',
      'Raghurajpur Village.JPG',
      'Raghurajpur Art.jpg',
      'Raghurajpur 1.jpg',
    ]),
    exclude: f(['Entrance of Raghurajpur.jpg']),
  },
  nandankanan: {
    prefer: f([
      'Royal Bengal Tiger at Nandankanan.jpg',
      'Leopard at Nandankanan Zoological Park.jpg',
      'Nandankanan Wildlife - 1.jpg',
      'Deer Park Nandankanan Zoological Park.jpg',
      'Nandankanan Wildlife - 5.jpg',
    ]),
    exclude: f(['Wapiti from Wagon Trails.jpg', 'Nandankanan, Bhubaneswar, Odisha.jpg']),
  },
};
