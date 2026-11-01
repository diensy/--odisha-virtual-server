// Opening hours and entry fees, checked against official sources on 2026-11-01.
// Values are null where no reliable source states them.
const NO_FEE = { en: 'No entry fee', hi: 'कोई प्रवेश शुल्क नहीं', or: 'ପ୍ରବେଶ ଶୁଳ୍କ ନାହିଁ' };

export const VISITOR_FACTS = {
  'konark-sun-temple': {
    openingHours: {
      en: 'Sunrise to sunset',
      hi: 'सूर्योदय से सूर्यास्त तक',
      or: 'ସୂର୍ଯ୍ୟୋଦୟରୁ ସୂର୍ଯ୍ୟାସ୍ତ ପର୍ଯ୍ୟନ୍ତ',
    },
    entryFee: {
      en: 'Indian, SAARC and BIMSTEC visitors ₹40 (₹35 online); other foreign visitors ₹600 (₹550 online); children under 15 free',
      hi: 'भारतीय, सार्क और बिम्सटेक देशों के आगंतुक ₹40 (ऑनलाइन ₹35); अन्य विदेशी आगंतुक ₹600 (ऑनलाइन ₹550); 15 वर्ष से कम आयु के बच्चे निःशुल्क',
      or: 'ଭାରତୀୟ, ସାର୍କ ଓ ବିମ୍ସଟେକ୍ ଦେଶର ପର୍ଯ୍ୟଟକ ₹40 (ଅନଲାଇନ୍ ₹35); ଅନ୍ୟ ବିଦେଶୀ ପର୍ଯ୍ୟଟକ ₹600 (ଅନଲାଇନ୍ ₹550); 15 ବର୍ଷରୁ କମ୍ ବୟସର ପିଲା ମାଗଣା',
    },
    sources: [
      {
        label: 'Archaeological Survey of India – Sun Temple, Konarak (hours and fees as listed by ASI)',
        url: 'https://asi.nic.in/pages/WorldHeritageKonarak',
      },
    ],
  },

  'jagannath-temple-puri': {
    openingHours: {
      en: 'Darshan from about 5:30 am (after Mangala Arati) until about 9 pm, with breaks for rituals; timings vary on festival days',
      hi: 'लगभग सुबह 5:30 बजे (मंगल आरती के बाद) से रात लगभग 9 बजे तक दर्शन, अनुष्ठानों के लिए बीच में विराम; पर्व के दिनों में समय बदलता है',
      or: 'ପ୍ରାୟ ସକାଳ 5:30 (ମଙ୍ଗଳ ଆରତି ପରେ)ରୁ ରାତି ପ୍ରାୟ 9 ପର୍ଯ୍ୟନ୍ତ ଦର୍ଶନ, ନୀତି ପାଇଁ ମଝିରେ ବିରତି; ପର୍ବ ଦିନରେ ସମୟ ବଦଳେ',
    },
    entryFee: NO_FEE,
    sources: [
      {
        label: 'Shree Jagannath Temple Administration – Darshan facilities (darshan timings as listed by SJTA)',
        url: 'https://www.shreejagannatha.in/darsan-facilities/',
      },
      {
        label: 'Odisha Tourism – Shree Jagannath Temple (entry fee as listed by Odisha Tourism)',
        url: 'https://odishatourism.gov.in/en/places/shree-jagannath-temple',
      },
    ],
  },

  'lingaraja-temple': {
    openingHours: {
      en: '5:00 am – 9:00 pm; closed 12:30 pm – 3:30 pm',
      hi: 'सुबह 5:00 – रात 9:00; दोपहर 12:30 – 3:30 बंद',
      or: 'ସକାଳ 5:00 – ରାତି 9:00; ଦିନ 12:30 – 3:30 ବନ୍ଦ',
    },
    entryFee: NO_FEE,
    sources: [
      {
        label: 'Odisha Tourism – Lingaraj Temple (hours and fee as listed by Odisha Tourism)',
        url: 'https://odishatourism.gov.in/en/places/lingaraj-temple',
      },
    ],
  },

  'chilika-lake': {
    openingHours: {
      en: '6:00 am – 6:00 pm',
      hi: 'सुबह 6:00 – शाम 6:00',
      or: 'ସକାଳ 6:00 – ସନ୍ଧ୍ୟା 6:00',
    },
    entryFee: {
      en: 'No entry fee; boat rides charged separately',
      hi: 'कोई प्रवेश शुल्क नहीं; नौका-विहार का शुल्क अलग',
      or: 'ପ୍ରବେଶ ଶୁଳ୍କ ନାହିଁ; ଡଙ୍ଗା ଯାତ୍ରା ପାଇଁ ଅଲଗା ଶୁଳ୍କ',
    },
    sources: [
      {
        label: 'Odisha Tourism – Chilika Lake (hours and fee as listed by Odisha Tourism)',
        url: 'https://odishatourism.gov.in/en/places/chilika-lake',
      },
    ],
  },

  dhauli: {
    openingHours: {
      en: '6:00 am – 6:00 pm',
      hi: 'सुबह 6:00 – शाम 6:00',
      or: 'ସକାଳ 6:00 – ସନ୍ଧ୍ୟା 6:00',
    },
    entryFee: NO_FEE,
    sources: [
      {
        label: 'Odisha Tourism – Dhauli Shanti Stupa & Ashokan Rock Edicts (hours and fee as listed by Odisha Tourism)',
        url: 'https://odishatourism.gov.in/w/dhauli-shanti-stupa-dhauli-hills',
      },
    ],
  },

  'udayagiri-khandagiri-caves': {
    openingHours: {
      en: '8:00 am – 5:00 pm',
      hi: 'सुबह 8:00 – शाम 5:00',
      or: 'ସକାଳ 8:00 – ସନ୍ଧ୍ୟା 5:00',
    },
    entryFee: {
      en: 'Ticketed; charged at ASI rates',
      hi: 'टिकट आवश्यक; शुल्क एएसआई दरों के अनुसार',
      or: 'ଟିକେଟ୍ ଆବଶ୍ୟକ; ଶୁଳ୍କ ଏଏସ୍ଆଇ ହାର ଅନୁସାରେ',
    },
    sources: [
      {
        label: 'Odisha Tourism – Udayagiri & Khandagiri Caves (hours and fee as listed by Odisha Tourism)',
        url: 'https://odishatourism.gov.in/en/places/udayagiri-khandagiri-caves',
      },
    ],
  },

  'mukteshvara-temple': {
    openingHours: {
      en: '6:00 am – 7:00 pm',
      hi: 'सुबह 6:00 – शाम 7:00',
      or: 'ସକାଳ 6:00 – ସନ୍ଧ୍ୟା 7:00',
    },
    entryFee: NO_FEE,
    sources: [
      {
        label: 'Odisha Tourism – Mukteswara Temple (hours and fee as listed by Odisha Tourism)',
        url: 'https://odishatourism.gov.in/en/places/mukteswara-temple',
      },
    ],
  },

  'golden-beach-puri': {
    openingHours: {
      en: 'Blue Flag Golden Beach: 5:30 am – 8:30 pm; the rest of Puri Beach is open 24 hours',
      hi: 'ब्लू फ्लैग गोल्डन बीच: सुबह 5:30 – रात 8:30; पुरी बीच का बाकी हिस्सा 24 घंटे खुला',
      or: 'ବ୍ଲୁ ଫ୍ଲାଗ୍ ଗୋଲ୍ଡେନ୍ ବିଚ୍: ସକାଳ 5:30 – ରାତି 8:30; ପୁରୀ ବେଳାଭୂମିର ବାକି ଅଂଶ 24 ଘଣ୍ଟା ଖୋଲା',
    },
    entryFee: {
      en: 'Blue Flag Golden Beach: ₹20 per person; no fee for the rest of Puri Beach',
      hi: 'ब्लू फ्लैग गोल्डन बीच: ₹20 प्रति व्यक्ति; पुरी बीच के बाकी हिस्से में कोई शुल्क नहीं',
      or: 'ବ୍ଲୁ ଫ୍ଲାଗ୍ ଗୋଲ୍ଡେନ୍ ବିଚ୍: ଜଣପିଛା ₹20; ପୁରୀ ବେଳାଭୂମିର ବାକି ଅଂଶରେ ଶୁଳ୍କ ନାହିଁ',
    },
    sources: [
      {
        label: 'Odisha Tourism – Puri Blue Flag Beach (Golden Beach hours and fee as listed by Odisha Tourism)',
        url: 'https://odishatourism.gov.in/en/places/puri-blue-flag-beach',
      },
      {
        label: 'Odisha Tourism – Puri Beach & Golden Beach (Puri Beach hours and fee as listed by Odisha Tourism)',
        url: 'https://odishatourism.gov.in/en/places/puri-beach-golden-beach',
      },
    ],
  },

  'chandrabhaga-beach': {
    openingHours: {
      en: 'Open 24 hours',
      hi: '24 घंटे खुला',
      or: '24 ଘଣ୍ଟା ଖୋଲା',
    },
    entryFee: NO_FEE,
    sources: [
      {
        label: 'Odisha Tourism – Chandrabhaga Beach (hours and fee as listed by Odisha Tourism)',
        url: 'https://odishatourism.gov.in/en/places/chandrabhaga-beach',
      },
    ],
  },

  raghurajpur: {
    openingHours: {
      en: '9:00 am – 6:00 pm',
      hi: 'सुबह 9:00 – शाम 6:00',
      or: 'ସକାଳ 9:00 – ସନ୍ଧ୍ୟା 6:00',
    },
    entryFee: NO_FEE,
    sources: [
      {
        label: 'Odisha Tourism – Raghurajpur Craft Village (hours and fee as listed by Odisha Tourism)',
        url: 'https://odishatourism.gov.in/en/places/raghurajpur-craft-village',
      },
    ],
  },

  nandankanan: {
    openingHours: {
      en: '7:30 am – 5:30 pm (April–September); 8:00 am – 5:00 pm (October–March); closed on Mondays',
      hi: 'सुबह 7:30 – शाम 5:30 (अप्रैल–सितंबर); सुबह 8:00 – शाम 5:00 (अक्टूबर–मार्च); सोमवार को बंद',
      or: 'ସକାଳ 7:30 – ସନ୍ଧ୍ୟା 5:30 (ଏପ୍ରିଲ୍–ସେପ୍ଟେମ୍ବର); ସକାଳ 8:00 – ସନ୍ଧ୍ୟା 5:00 (ଅକ୍ଟୋବର–ମାର୍ଚ୍ଚ); ସୋମବାର ବନ୍ଦ',
    },
    entryFee: {
      en: 'Adults (over 12) ₹50; children 3–12 ₹10; foreign nationals ₹100; children under 3 and differently abled visitors free',
      hi: 'वयस्क (12 वर्ष से अधिक) ₹50; बच्चे (3–12 वर्ष) ₹10; विदेशी नागरिक ₹100; 3 वर्ष से कम आयु के बच्चे और दिव्यांगजन निःशुल्क',
      or: 'ବୟସ୍କ (12 ବର୍ଷରୁ ଅଧିକ) ₹50; ପିଲା (3–12 ବର୍ଷ) ₹10; ବିଦେଶୀ ନାଗରିକ ₹100; 3 ବର୍ଷରୁ କମ୍ ପିଲା ଓ ଭିନ୍ନକ୍ଷମ ବ୍ୟକ୍ତି ମାଗଣା',
    },
    sources: [
      {
        label: 'Nandankanan Zoological Park – Visiting hours (as listed by Nandankanan)',
        url: 'https://nandankanan.org/visiting-hours.php',
      },
      {
        label: 'Nandankanan Zoological Park – Tickets & pricing (as listed by Nandankanan)',
        url: 'https://nandankanan.org/ticket.php',
      },
    ],
  },
};
