// Points of interest marked on specific photographs, shown in the virtual tour. Each point is
// a fraction of the photo's width (x) and height (y), placed by looking at the photo, and its
// label repeats a fact from that destination's sourced description. Photos not listed here
// show no markers. Keys are Wikimedia Commons file names (as in the photo's source URL).
const note = (x, y, en, hi, or) => ({ x, y, label: { en, hi, or } });

export const IMAGE_NOTES = {
  'Konarka_Temple.jpg': [
    note(0.45, 0.42, 'The jagamohana (assembly hall), the part that still stands', 'जगमोहन (सभा मंडप), जो आज भी खड़ा है', 'ଜଗମୋହନ (ସଭା ମଣ୍ଡପ), ଯାହା ଆଜି ବି ଠିଆ ହୋଇଛି'),
    note(0.58, 0.745, 'One of the 24 carved stone wheels', '24 नक्काशीदार पत्थर के पहियों में से एक', '24ଟି ଖୋଦିତ ପଥର ଚକ ମଧ୍ୟରୁ ଗୋଟିଏ'),
  ],
  'Closeup_of_the_center_of_a_stone_wheel_-_Konark_Sun_Temple,_Orissa,_India.jpg': [
    note(0.505, 0.49, 'The carved hub of a chariot wheel', 'रथ के पहिये की नक्काशीदार धुरी', 'ରଥ ଚକର ଖୋଦିତ ମଝି ଭାଗ'),
    note(0.27, 0.17, 'A spoke: each wheel has eight major spokes', 'एक आरा: हर पहिये में आठ मुख्य आरे हैं', 'ଗୋଟିଏ ଅର: ପ୍ରତି ଚକରେ ଆଠଟି ମୁଖ୍ୟ ଅର ଅଛି'),
  ],
  'ShantiSthupa_Dhauli.jpg': [
    note(0.523, 0.5, 'Shanti Stupa, the white Peace Pagoda', 'शांति स्तूप, सफ़ेद पीस पगोडा', 'ଶାନ୍ତି ସ୍ତୂପ, ଧଳା ଶାନ୍ତି ପାଗୋଡ଼ା'),
    note(0.32, 0.47, 'The Daya river', 'दया नदी', 'ଦୟା ନଦୀ'),
  ],
  'Elephant-sculpture-dhauli.JPG': [
    note(0.555, 0.3, 'The elephant emerging from the rock, among the earliest rock-cut sculptures in India', 'चट्टान से उभरता हाथी, भारत की सबसे पुरानी चट्टान-मूर्तियों में से एक', 'ପଥରରୁ ବାହାରୁଥିବା ହାତୀ, ଭାରତର ସବୁଠାରୁ ପୁରୁଣା ପଥର-ଖୋଦିତ ମୂର୍ତ୍ତି ମଧ୍ୟରୁ ଗୋଟିଏ'),
  ],
  'Mukteshwar_torana.jpg': [
    note(0.5, 0.12, 'The torana, a sculpted arched gateway', 'तोरण, नक्काशीदार मेहराबदार द्वार', 'ତୋରଣ, ଖୋଦିତ ଧନୁଆକାର ଦ୍ୱାର'),
    note(0.5, 0.64, 'The Mukteshvara Temple behind the arch', 'मेहराब के पीछे मुक्तेश्वर मंदिर', 'ତୋରଣ ପଛରେ ମୁକ୍ତେଶ୍ୱର ମନ୍ଦିର'),
  ],
  'Lingaraj_Temple_Complex.jpg': [
    note(0.3, 0.25, 'The 55-metre deula tower over the sanctum', 'गर्भगृह के ऊपर 55 मीटर ऊँचा देउल शिखर', 'ଗର୍ଭଗୃହ ଉପରେ 55 ମିଟର ଉଚ୍ଚ ଦେଉଳ'),
    note(0.75, 0.47, 'One of the many smaller shrines in the complex', 'परिसर के कई छोटे मंदिरों में से एक', 'ପରିସରର ଅନେକ ଛୋଟ ମନ୍ଦିର ମଧ୍ୟରୁ ଗୋଟିଏ'),
  ],
  'Bird_view_of_Jagannath_Temple,_Puri.jpg': [
    note(0.483, 0.3, 'The main temple of Lord Jagannath', 'भगवान जगन्नाथ का मुख्य मंदिर', 'ମହାପ୍ରଭୁ ଜଗନ୍ନାଥଙ୍କ ମୁଖ୍ୟ ମନ୍ଦିର'),
  ],
};
