// Citizens who need the police: each stands where its level's cast puts
// it, asks for help when Blenke comes near, and thanks him once he has
// helped. Helping is worth less than an empty tin (score.js), which is the
// point. Pure: no DOM.

// What each citizen asks, and says once helped, in turn: the first citizen
// of a type in a level the first plea, and so on.
export const PLEAS = [
  { plea: 'MIN CYKEL ÄR STULEN!', thanks: 'ANMÄLAN MOTTAGEN. INGA SPÅR.' },
  { plea: 'DET HAR VARIT INBROTT!', thanks: 'VI ÅTERKOMMER. KANSKE.' },
  { plea: 'MIN KATT HAR FÖRSVUNNIT!', thanks: 'KATTEN LÄMNADE INGET PROV.' },
];

// Tungelsta IF's juniors on the pitch say this as Blenke comes, and this
// once he has tested them.
export const JUNIOR_LINES = [
  { plea: 'VI SKA BARA TRÄNA!', thanks: 'PROVET NEGATIVT. SOM ALLTID.' },
  { plea: 'JAG ÄR ELVA ÅR!', thanks: 'NEGATIVT. MISSTANKEN KVARSTÅR.' },
  { plea: 'MAMMA HÄMTAR KLOCKAN SEX!', thanks: 'NEGATIVT. VI SPARAR DET ÄNDÅ.' },
];

// Jordbro's children, class 1D at Lundaskolan, filmed from 1972 to 2014
// (the Jordbro films: En pizza i Jordbro won the Guldbagge in 1994, Alla
// mår bra found them at forty), say this as Blenke comes, and this once he
// has tested them.
export const JORDBRO_CHILD_LINES = [
  { plea: 'VI GÅR I KLASS 1D!', thanks: 'NEGATIVT. VI FÖLJER ER TILL 2014.' },
  { plea: 'FARBROR, ÄR DU OCKSÅ MED I FILMEN?', thanks: 'NEGATIVT. DET BLIR EN GULDBAGGE.' },
  { plea: 'JAG SKA HA EN PIZZERIA I JORDBRO!', thanks: 'NEGATIVT. PIZZAN PROVTAS 1994.' },
  { plea: 'ALLA MÅR BRA!', thanks: 'NEGATIVT. NYTT PROV NÄR NI ÄR FYRTIO.' },
];

// The pupils of Fredrika Bremergymnasiet in Handen, the school named after
// the writer whose Hertha (1856) set off the fight to make unmarried women
// of age, say this as Blenke comes, and this once he has tested them.
export const BREMER_PUPIL_LINES = [
  { plea: 'VI HAR HÅLTIMME!', thanks: 'NEGATIVT. HÅLTIMMEN NOTERAD.' },
  { plea: 'VI LÄSER HERTHA AV FREDRIKA BREMER!', thanks: 'NEGATIVT. BOKEN BESLAGTAGEN.' },
  { plea: 'JAG FYLLER ARTON PÅ FREDAG!', thanks: 'NEGATIVT. MYNDIG? VI ÄR MYNDIGHETEN.' },
  { plea: 'VI SKA PÅ ELEVRÅDSMÖTE!', thanks: 'NEGATIVT. ELEVRÅDET KARTLAGT.' },
];

// The youngsters hanging about Skogås centrum in the early 1980s, the
// years of the panic over sniffing thinner and over video nasties, say
// this as Blenke comes, and this once he has tested them.
export const SKOGAS_YOUTH_LINES = [
  { plea: 'VI HÄNGER BARA I CENTRUM!', thanks: 'NEGATIVT. HÄNGANDET NOTERAT.' },
  { plea: 'JAG SKA KÖPA PARFYM TILL MORSAN!', thanks: 'NEGATIVT. PARFYMEN SKICKAD PÅ ANALYS.' },
  { plea: 'VI HAR BARA SETT EN VIDEO!', thanks: 'NEGATIVT. VIDEON BESLAGTAGEN.' },
  { plea: 'MOPEDEN ÄR INTE TRIMMAD!', thanks: 'NEGATIVT. MOPEDEN ÄR TRIMMAD.' },
];

// The youngsters larping fantasy by the fields in Krigslida, in
// home-made costumes, say this as Blenke comes, and this once he has
// tested them: whatever they carry is sent for analysis, and it is all
// negative. (Role-playing games would have their own panic in Sweden, in
// the 1990s.) Each character has lines of its own.
export const LARP_LINES = {
  larpWizard: [
    { plea: 'DET ÄR BARA SAFT I FLASKAN!', thanks: 'NEGATIVT. TRYLLDRYCKEN ANALYSERAS.' },
    { plea: 'JAG KAN TROLLA BORT DIG!', thanks: 'NEGATIVT. TROLLSTAVEN BESLAGTAGEN.' },
  ],
  larpElf: [
    { plea: 'ÖRTERNA ÄR BARA KAMOMILL!', thanks: 'NEGATIVT. ÖRTERNA SKICKADE PÅ ANALYS.' },
    { plea: 'ALVER KISSAR INTE I MUGG!', thanks: 'NEGATIVT. ALVEN KISSADE ÄNDÅ.' },
  ],
  larpOrc: [
    { plea: 'KRIGSMÅLNINGEN ÄR MAMMAS SMINK!', thanks: 'NEGATIVT. SMINKET SKICKAT PÅ ANALYS.' },
    { plea: 'GRR! VI SPELAR BARA!', thanks: 'NEGATIVT. GRYMTANDET NOTERAT.' },
  ],
  larpThief: [
    { plea: 'JAG SPELAR BARA TJUV!', thanks: 'NEGATIVT. ROLLSPELET KARTLAGT.' },
    { plea: 'PUNGEN ÄR FULL AV PAPPMYNT!', thanks: 'NEGATIVT. PAPPMYNTEN BESLAGTAGNA.' },
  ],
  larpWarrior: [
    { plea: 'SVÄRDET ÄR AV SKUMGUMMI!', thanks: 'NEGATIVT. SVÄRDET BESLAGTAGET ÄNDÅ.' },
    { plea: 'JAG ÄR RIDDARE AV KRIGSLIDA!', thanks: 'NEGATIVT. KRIGET FÖR VI HÄR.' },
  ],
};

// The pupils of Ribbyskolan in Västerhaninge, at the end of the 1970s,
// sitting through the drug education lesson (the sign outside says all
// it taught), say this as Blenke comes, and this once he has tested them.
export const RIBBY_PUPIL_LINES = [
  { plea: 'VI HAR ANT-LEKTION!', thanks: 'NEGATIVT. LEKTIONEN GICK HEM.' },
  { plea: 'LÄRAREN SA ATT KNARK ÄR FARLIGT!', thanks: 'NEGATIVT. MER VET VI INTE.' },
  { plea: 'JAG HAR BARA MATSÄCK I VÄSKAN!', thanks: 'NEGATIVT. MACKAN SKICKAD PÅ ANALYS.' },
  { plea: 'VI SKA BARA TILL SKOLBUSSEN!', thanks: 'NEGATIVT. BUSSEN HAR GÅTT.' },
];

// Jehovah's Witnesses at Rikets sal, their Kingdom Hall in Farsta strand,
// who go from door to door as the police do, and keep from more than
// most, say this as Blenke comes, and this once he has tested them.
export const WITNESS_LINES = [
  { plea: 'VILL DU LÄSA VAKTTORNET?', thanks: 'NEGATIVT. VAKTTORNET SKICKAT PÅ ANALYS.' },
  { plea: 'VI DRICKER INTE ENS KAFFE PÅ MÖTET!', thanks: 'NEGATIVT. NYKTERHETEN ÄR MISSTÄNKT.' },
  { plea: 'VI KNACKAR BARA DÖRR!', thanks: 'NEGATIVT. DET GÖR VI OCKSÅ.' },
  { plea: 'HAR DU TÄNKT PÅ DIN FRAMTID?', thanks: 'NEGATIVT. VI HAR ETT REGISTER.' },
];

// The children out in the woods by Trångsund with Friluftsfrämjandet,
// five years old, waiting for Skogsmulle (who came to Trångsund in 1970),
// say this as Blenke comes, and this once he has tested them.
export const MULLE_CHILD_LINES = [
  { plea: 'HEJ KOLIKOK! VI SKA TRÄFFA SKOGSMULLE!', thanks: 'NEGATIVT. MULLE ÄR EFTERLYST.' },
  { plea: 'VI PLOCKAR SVAMP!', thanks: 'NEGATIVT. SVAMPEN SKICKAD PÅ ANALYS.' },
  { plea: 'JAG HAR BARA SAFT I TERMOSEN!', thanks: 'NEGATIVT. TERMOSEN BESLAGTAGEN.' },
  { plea: 'JAG ÄR FEM ÅR!', thanks: 'NEGATIVT. VI SPARAR PROVET TILL ARTON.' },
];

// The customers of Paus bagarstuga in Västerhaninge centrum, out for
// their fika with poppy-seed buns, which can make a urine test positive
// for opiates. So for once the test is positive, and as sure as ever.
export const PAUS_CUSTOMER_LINES = [
  { plea: 'JAG ÅT BARA EN VALLMOFRALLA!', thanks: 'POSITIVT! OPIATER. FRALLAN BESLAGTAGEN.' },
  { plea: 'VI SKA BARA FIKA!', thanks: 'POSITIVT! FIKAT ANMÄLT.' },
  { plea: 'JAG HAR KÖPT EN VALLMOLÄNGD!', thanks: 'POSITIVT! LÄNGDEN SKICKAD PÅ ANALYS.' },
  { plea: 'BAGAREN SA ATT DET ÄR FRÖN!', thanks: 'POSITIVT! BAGAREN HÄMTAS.' },
];

// The Latter-day Saints at their temple in Västerhaninge, dedicated in
// 1985, who keep the Word of Wisdom (no coffee, no tea, no alcohol) more
// strictly than any police canteen, say this as Blenke comes, and this
// once he has tested them. Each says it under his or her title and name:
// young elders on mission from Utah, often with Scandinavian names, as
// the church grew there from Scandinavian converts; a bishop and the
// temple's president; sisters on mission, who do baptisms for the dead
// and the genealogy behind them.
export const MORMON_LINES = {
  mormonElder: [
    { name: 'ÄLDSTE JOHNSON', plea: 'HAR DU HÖRT OM MORMONS BOK?', thanks: 'NEGATIVT. BOKEN LÄSES I HÄKTET.' },
    { name: 'ÄLDSTE CHRISTENSEN', plea: 'MIN FARFARS FAR VAR FRÅN SMÅLAND!', thanks: 'NEGATIVT. SLÄKTEN SAMKÖRS MED REGISTRET.' },
    { name: 'BISKOP LINDQVIST', plea: 'VI DRICKER INTE KAFFE!', thanks: 'NEGATIVT. MER POLISKAFFE ÅT OSS.' },
    { name: 'PRESIDENT NILSSON', plea: 'TEMPLET ÄR BARA FÖR MEDLEMMAR!', thanks: 'NEGATIVT. POLISEN ÄR MEDLEM ÖVERALLT.' },
  ],
  mormonSister: [
    { name: 'SYSTER LARSEN', plea: 'VI DÖPER VÅRA FÖRFÄDER!', thanks: 'NEGATIVT. FÖRFÄDERNA PROVTAS POSTUMT.' },
    { name: 'SYSTER YOUNG', plea: 'VI ÄR PÅ MISSION FRÅN UTAH!', thanks: 'NEGATIVT. MISSIONEN KARTLAGD.' },
  ],
};

// Three brothers outside the temple in Västerhaninge, in golden sneakers,
// singing the song that won the Eurovision Song Contest for Sweden in
// 1984, its refrain rhymed on the police's search: the dog, the stare,
// the sample. Each sings a line of his own, left to right, as Blenke
// comes, and says this once he has tested them.
export const SINGER_LINES = {
  singerNavy: [
    { plea: 'DIGGI-LOO DIGGI-LEY, HUNDEN SNIFFAR PÅ MEJ!', thanks: 'NEGATIVT. DJURVÄN? IN PÅ FÖRHÖR.' },
  ],
  singerRed: [
    { plea: 'DIGGI-LOO DIGGI-LEY, GLO EJ PÅ MIN GREJ!', thanks: 'NEGATIVT. JETESTOR! VAD GÖMMER SIG DÄR?' },
  ],
  singerTurquoise: [
    { plea: 'DIGGI-LOO DIGGI-LEY, JAG SKA PISSA PÅ DEJ!', thanks: 'NEGATIVT. TACK FÖR DUSCHEN!' },
  ],
};

// act is what the act key does to the citizen: helps, or tests; either is
// worth the same next to nothing. testLine, for one tested, is what the
// message line says instead of the usual negative.
// The chess players by Kulturhuset say this as Blenke comes, and this
// once he has tested them.
export const CHESS_PLAYER_LINES = [
  { plea: 'JAG SPELAR BARA SCHACK!', thanks: 'NEGATIVT. PJÄSERNA BESLAGTAGNA.' },
  { plea: 'LÖPAREN ÄR INGEN LANGARE!', thanks: 'NEGATIVT. LÖPAREN KARTLAGD.' },
  { plea: 'DET ÄR MITT DRAG!', thanks: 'NEGATIVT. DRAGET NOTERAT.' },
  { plea: 'SCHACK MATT, KONSTAPELN!', thanks: 'NEGATIVT. MATTEN SKICKAD PÅ ANALYS.' },
];

// The night walkers at Slussen, parents out in yellow vests to keep an eye
// on the young, say this as Blenke comes, and this once he has tested
// them.
export const NIGHT_WALKER_LINES = [
  { plea: 'VI NATTVANDRAR BARA!', thanks: 'NEGATIVT. VÄSTEN NOTERAD.' },
  { plea: 'JAG HAR EN TONÅRING HEMMA!', thanks: 'NEGATIVT. TONÅRINGEN KARTLAGD.' },
  { plea: 'VILL NI HA KAFFE?', thanks: 'NEGATIVT. KAFFET SKICKAT PÅ ANALYS.' },
];

// The clubbers in the queue at Stureplan, dressed up and waiting to be
// let in, say this as Blenke comes, and this once he has tested them.
export const CLUBBER_LINES = [
  { plea: 'VI STÅR PÅ LISTAN!', thanks: 'NEGATIVT. PLATSEN I KÖN FÖRLORAD.' },
  { plea: 'MIN KOMPIS KÄNNER DÖRREN!', thanks: 'NEGATIVT. KOMPISEN REGISTRERAD.' },
  { plea: 'JAG HAR KÖAT I EN TIMME!', thanks: 'NEGATIVT. KÖN BÖRJAR OM DÄR BORTA.' },
  { plea: 'VARFÖR INTE DE I VIP?', thanks: 'NEGATIVT. VIP TESTAS INTE.' },
];

// The dancers at the rave in the hall at Finnboda varv say this as Blenke
// comes, and this once he has tested them (the commission took them to
// the station for it).
export const DANCER_LINES = [
  { plea: 'VI DANSAR BARA!', thanks: 'NEGATIVT. TAGEN TILL STATIONEN ÄNDÅ.' },
  { plea: 'JAG HAR BARA DRUCKIT VATTEN!', thanks: 'NEGATIVT. VATTNET SKICKAT PÅ ANALYS.' },
  { plea: 'KLOCKAN ÄR HALV FEM!', thanks: 'NEGATIVT. FÖRÄLDRARNA UNDERRÄTTADE.' },
  { plea: 'MUSIKEN ÄR INTE OLAGLIG!', thanks: 'NEGATIVT. MUSIKSMAKEN NOTERAD.' },
];

// The tourists lost in Gamla stan's lanes late in the evening say this
// as Blenke comes, and this once he has tested them.
export const TOURIST_LINES = [
  { plea: 'WE ARE ONLY TOURISTS!', thanks: 'NEGATIVT. SEMESTERN NOTERAD I REGISTRET.' },
  { plea: 'WO IST DAS SCHLOSS?', thanks: 'NEGATIVT. SLOTTET ÄR STÄNGT. DU OCKSÅ.' },
  { plea: 'IS THIS THE ABBA MUSEUM?', thanks: 'NEGATIVT. FINNS INTE. INTE DU HELLER.' },
  { plea: 'I JUST WANTED A PHOTO!', thanks: 'NEGATIVT. KAMERAN BESLAGTAGEN. FÖR SÄKERHETS SKULL.' },
];

// The young waiting for the night bus on Medborgarplatsen say this as
// Blenke comes, and this once he has tested them.
export const NIGHT_BUS_LINES = [
  { plea: 'JAG SKA BARA HEM!', thanks: 'NEGATIVT. BUSSEN GICK MEDAN DU KISSADE.' },
  { plea: 'NATTBUSSEN KOMMER NU!', thanks: 'NEGATIVT. NÄSTA GÅR OM EN TIMME.' },
  { plea: 'JAG HAR BARA VARIT PÅ BIO!', thanks: 'NEGATIVT. FILMEN NOTERAD.' },
  { plea: 'MAMMA VÄNTAR PÅ MIG!', thanks: 'NEGATIVT. MAMMA UNDERRÄTTAD.' },
];

// The buskers playing for the last travellers in the tunnelbana say this
// as Blenke comes, and this once he has tested them.
export const BUSKER_LINES = [
  { plea: 'JAG SPELAR BARA VALS!', thanks: 'NEGATIVT. VALSEN NOTERAD.' },
  { plea: 'DET ÄR TILLSTÅND PÅ DET!', thanks: 'NEGATIVT. TILLSTÅNDET OCKSÅ PÅ ANALYS.' },
  { plea: 'EN SLANT TILL MUSIKEN?', thanks: 'NEGATIVT. SLANTARNA BESLAGTAGNA.' },
  { plea: 'SISTA TÅGET GÅR SNART!', thanks: 'NEGATIVT. TÅGET GICK.' },
];

// The young brought in to Polishuset at Kronoberg from the raves, waiting
// for their tests, say this as Blenke comes, and this once he has tested
// them.
export const DETAINEE_LINES = [
  { plea: 'JAG HAR INTE GJORT NÅGOT!', thanks: 'NEGATIVT. FÅR GÅ HEM OM SEX TIMMAR.' },
  { plea: 'FÅR JAG RINGA MAMMA?', thanks: 'NEGATIVT. MAMMA RINGD KLOCKAN TRE.' },
  { plea: 'JAG DANSADE BARA!', thanks: 'NEGATIVT. DANSEN ANTECKNAD.' },
  { plea: 'BLODPROV OCKSÅ?', thanks: 'NEGATIVT. BLODET SPARAS ÄNDÅ.' },
];

// The animals Blenke tests, one in each level, make their noise as he
// comes, and get the police's verdict once he has tested them. That birds
// pass no urine of their own stops nobody.
export const ANIMAL_LINES = {
  hedgehog: { plea: 'FNYS! FNYS!', thanks: 'NEGATIVT. GÅR I IDE UNDER UTREDNINGEN.' },
  hen: { plea: 'KO-KO-KO-KAKEL!', thanks: 'NEGATIVT. ÄGGEN TAS I BESLAG.' },
  hare: { plea: 'SKUTT! SKUTT!', thanks: 'NEGATIVT. FLYKTBENÄGEN. HÄKTAS.' },
  dog: { plea: 'VOFF! VOFF!', thanks: 'NEGATIVT. LYFTE PÅ BENET MOT KONSTAPELN.' },
  duck: { plea: 'KVACK! KVACK!', thanks: 'NEGATIVT. FÅGLAR KISSAR INTE. NOTERAT ÄNDÅ.' },
  fox: { plea: 'RÄVEN RASKAR ÖVER ISEN!', thanks: 'NEGATIVT. SLUG SOM EN RÄV. MISSTÄNKT.' },
  squirrel: { plea: 'TJICK-TJICK!', thanks: 'NEGATIVT. NÖTTERNA SKICKADE PÅ ANALYS.' },
  cat: { plea: 'MJAAAU!', thanks: 'NEGATIVT. KATTMYNTAN BESLAGTAGEN.' },
  gull: { plea: 'SKRAAA! SKRAAA!', thanks: 'NEGATIVT. TOG ÄNDÅ KONSTAPELNS KORV.' },
  pigeon: { plea: 'KUTTER-KUTTER!', thanks: 'NEGATIVT. SMULORNA SKICKADE PÅ ANALYS.' },
  poodle: { plea: 'VIFF! VIFF!', thanks: 'NEGATIVT. MATTE RINGER ADVOKATEN.' },
  heron: { plea: 'KRAAK!', thanks: 'NEGATIVT. STOD STILL HELA NATTEN. MISSTÄNKT.' },
  swan: { plea: 'FRÄÄÄS!', thanks: 'NEGATIVT. VÄSTE ÅT KONSTAPELN. NOTERAT.' },
  crow: { plea: 'KRA! KRA!', thanks: 'NEGATIVT. STAL KONSTAPELNS MUNK.' },
  mouse: { plea: 'PIIP!', thanks: 'NEGATIVT. ÅKTE UTAN BILJETT. BÖTFÄLLD.' },
  sniffer: { plea: 'VOFF! VOFF!', thanks: 'NEGATIVT. NOSEN DÄREMOT POSITIV FÖR ALLT.' },
  rat: { plea: 'PIP! PIP!', thanks: 'NEGATIVT. VÄRVAD SOM INFORMATÖR.' },
};

// An animal to test: its body's size, and what the message line says once
// it is tested.
function animal(type, width, height, testLine) {
  return { width, height, act: 'test', animal: true, testLine, lines: [ANIMAL_LINES[type]] };
}

const SINGER_TEST_LINE = 'SÅNGARE TESTAD. NEGATIVT. GULDSKORNA I REGISTRET.';

export const CITIZENS = {
  // A pensioner with a walking stick and a problem.
  pensioner: {
    width: 10,
    height: 24,
    act: 'help',
    lines: PLEAS,
  },
  // One of Tungelsta IF's juniors, in the club's orange and black, out to
  // train.
  junior: {
    width: 8,
    height: 19,
    act: 'test',
    lines: JUNIOR_LINES,
  },
  // One of Jordbro's children, seven years old in 1972, in a striped
  // jumper and flared jeans, on the way to school.
  jordbroChild: {
    width: 8,
    height: 17,
    act: 'test',
    lines: JORDBRO_CHILD_LINES,
  },
  // A pupil of Fredrika Bremergymnasiet in the early 1970s: long hair, an
  // army parka, bell-bottoms and clogs.
  bremerPupil: {
    width: 8,
    height: 22,
    act: 'test',
    lines: BREMER_PUPIL_LINES,
  },
  // A youngster in Skogås centrum in the early 1980s, in a denim jacket,
  // jeans and white trainers.
  skogasYouth: {
    width: 8,
    height: 22,
    act: 'test',
    lines: SKOGAS_YOUTH_LINES,
  },
  // The larpers by the fields in Krigslida: a wizard in a pointed hat and a
  // bedsheet robe, an elf with a bow, an orc in green war paint, a thief
  // in a hood, and a warrior in a cardboard helmet, his foam sword taller
  // than he is.
  larpWizard: {
    width: 8,
    height: 24,
    act: 'test',
    lines: LARP_LINES.larpWizard,
  },
  larpElf: {
    width: 8,
    height: 23,
    act: 'test',
    lines: LARP_LINES.larpElf,
  },
  larpOrc: {
    width: 8,
    height: 24,
    act: 'test',
    lines: LARP_LINES.larpOrc,
  },
  larpThief: {
    width: 8,
    height: 22,
    act: 'test',
    lines: LARP_LINES.larpThief,
  },
  larpWarrior: {
    width: 8,
    height: 22,
    act: 'test',
    lines: LARP_LINES.larpWarrior,
  },
  // A pupil of Ribbyskolan at the end of the 1970s, about thirteen, in a
  // college sweater and corduroys, a school backpack on his back.
  ribbyPupil: {
    width: 8,
    height: 20,
    act: 'test',
    lines: RIBBY_PUPIL_LINES,
  },
  // A Jehovah's Witness at Rikets sal in Farsta strand, in a dark suit and
  // tie, a briefcase in one hand and the Watchtower in the other.
  witness: {
    width: 8,
    height: 23,
    act: 'test',
    lines: WITNESS_LINES,
  },
  // A child of five out in the woods with Friluftsfrämjandet, in a bobble
  // hat, an anorak, rain trousers and rubber boots.
  mulleChild: {
    width: 8,
    height: 15,
    act: 'test',
    lines: MULLE_CHILD_LINES,
  },
  // A customer of Paus bagarstuga in a permanent wave and a beige coat,
  // a paper bag of poppy-seed buns in her hand.
  pausCustomer: {
    width: 8,
    height: 23,
    act: 'test',
    testLine: 'KUND TESTAD. POSITIVT. FÖRS IN I REGISTRET.',
    lines: PAUS_CUSTOMER_LINES,
  },
  // A Latter-day Saint at the temple in Västerhaninge: an elder in a white
  // short-sleeved shirt, a dark tie, his black name tag on his chest and
  // the Book of Mormon in his hand; a sister in a white blouse with her
  // name tag and a long blue skirt.
  mormonElder: {
    width: 8,
    height: 23,
    act: 'test',
    testLine: 'MORMON TESTAD. NEGATIVT. SLÄKTFORSKAD IN I REGISTRET.',
    lines: MORMON_LINES.mormonElder,
  },
  mormonSister: {
    width: 8,
    height: 23,
    act: 'test',
    testLine: 'MORMON TESTAD. NEGATIVT. SLÄKTFORSKAD IN I REGISTRET.',
    lines: MORMON_LINES.mormonSister,
  },
  // The singing brothers outside the temple in Västerhaninge, in
  // short-sleeved shirts (navy, red, turquoise), white trousers to the
  // ankles and golden high-top sneakers.
  singerNavy: {
    width: 8,
    height: 24,
    act: 'test',
    testLine: SINGER_TEST_LINE,
    lines: SINGER_LINES.singerNavy,
  },
  singerRed: {
    width: 8,
    height: 24,
    act: 'test',
    testLine: SINGER_TEST_LINE,
    lines: SINGER_LINES.singerRed,
  },
  singerTurquoise: {
    width: 8,
    height: 24,
    act: 'test',
    testLine: SINGER_TEST_LINE,
    lines: SINGER_LINES.singerTurquoise,
  },
  // A chess player by Kulturhuset on Sergels torg: an old man in a flat
  // cap and a tweed jacket, a white king in his hand.
  chessPlayer: {
    width: 8,
    height: 20,
    act: 'test',
    lines: CHESS_PLAYER_LINES,
  },
  // A night walker at Slussen: a parent out walking the town at night in
  // a yellow vest, a thermos of coffee in her hand.
  nightWalker: {
    width: 8,
    height: 20,
    act: 'test',
    lines: NIGHT_WALKER_LINES,
  },
  // A clubber in the queue at Stureplan, dressed up for the night.
  clubber: {
    width: 8,
    height: 19,
    act: 'test',
    lines: CLUBBER_LINES,
  },
  // A dancer at the rave in the hall at Finnboda varv, hands in the air.
  dancer: {
    width: 8,
    height: 19,
    act: 'test',
    lines: DANCER_LINES,
  },
  // A tourist lost in Gamla stan, his map the wrong way up.
  tourist: {
    width: 8,
    height: 19,
    act: 'test',
    lines: TOURIST_LINES,
  },
  // A youngster waiting for the night bus on Medborgarplatsen.
  nightBusRider: {
    width: 8,
    height: 19,
    act: 'test',
    lines: NIGHT_BUS_LINES,
  },
  // A busker with his accordion in the tunnelbana.
  busker: {
    width: 10,
    height: 19,
    act: 'test',
    lines: BUSKER_LINES,
  },
  // A young raver brought in for her tests, in a police blanket.
  detainee: {
    width: 10,
    height: 19,
    act: 'test',
    lines: DETAINEE_LINES,
  },
  // The animals, one in each level, drawn in src/art/animals.js: a
  // hedgehog in Tungelsta's gardens, a hen on Krigslida farm, a hare by
  // Håga, a mongrel by Jordbro's slab block, a mallard at Övre Rudan, a
  // fox by Lännafortet, a squirrel in Trångsund's woods, a villa cat, a
  // swan on Riddarholmen, a gull at Slussen, a crow on Medborgarplatsen,
  // a mouse on the tunnelbana's platform, a pigeon on Plattan, a poodle
  // on Stureplan, the police's own sniffer dog at Kronoberg, a heron on Finnboda varv's quay and a rat by
  // Förorten's canal.
  hedgehog: animal('hedgehog', 14, 9, 'IGELKOTT TESTAD I TRÄDGÅRDSSTADEN. TAGGARNA NOTERADE.'),
  hen: animal('hen', 12, 15, 'HÖNA TESTAD. KRIGET MOT NARKOTIKAN NÅR HÖNSGÅRDEN.'),
  hare: animal('hare', 12, 13, 'HARE TESTAD. HJÄRTAT SLÅR FORT. TECKEN PÅ PÅVERKAN.'),
  dog: animal('dog', 14, 13, 'HUND TESTAD. NARKOTIKAHUNDEN MARKERADE PÅ DEN.'),
  duck: animal('duck', 12, 14, 'AND TESTAD I ÖVRE RUDAN. PROVET SPÄTT MED BADVATTEN.'),
  fox: animal('fox', 14, 13, 'RÄV TESTAD VID LÄNNAFORTET. REVIRET MARKERAT. AV OSS.'),
  squirrel: animal('squirrel', 10, 13, 'EKORRE TESTAD. GÖMMER NÖTTER I SKOGEN. LANGARE?'),
  cat: animal('cat', 10, 13, 'KATT TESTAD. VILLAN HUSRANNSAKAS. KATTMYNTA I KÖKET.'),
  gull: animal('gull', 10, 15, 'TRUT TESTAD VID SLUSSEN. SNODDE PROVBURKEN.'),
  pigeon: animal('pigeon', 10, 11, 'DUVA TESTAD PÅ PLATTAN. HELA FLOCKEN I REGISTRET.'),
  poodle: animal('poodle', 12, 13, 'PUDEL TESTAD PÅ STUREPLAN. FRISYREN BETALD KONTANT.'),
  heron: animal('heron', 12, 20, 'HÄGER TESTAD PÅ KAJEN. FISKEN SKICKAD PÅ ANALYS.'),
  swan: animal('swan', 14, 16, 'SVAN TESTAD PÅ RIDDARHOLMEN. FALLET GÅR TILL HOVRÄTTEN.'),
  crow: animal('crow', 12, 13, 'KRÅKA TESTAD PÅ MEDBORGARPLATSEN. KEBABEN PÅ ANALYS.'),
  mouse: animal('mouse', 12, 8, 'MUS TESTAD I TUNNELBANAN. HÅLET UNDERSÖKT.'),
  sniffer: animal('sniffer', 14, 14, 'NARKOTIKAHUND TESTAD. KOLLEGAN SKYDDAS AV FACKET.'),
  rat: animal('rat', 12, 9, 'RÅTTA TESTAD. AVLOPPSANALYSEN: ALLA ÄR MISSTÄNKTA.'),
};

// A citizen tested gives Blenke this many urine samples to carry to the
// filling station (the super bladder doubles them, as it does a pickup's);
// one helped gives none.
export const TEST_SAMPLES = 1;

// A plea shows while Blenke's middle is this close; the thanks this long.
export const PLEA_RANGE = 96;
export const THANKS_TIME = 2.5;

// A citizen stands on the bottom of the tile it is placed in, in the
// middle. index counts the citizens of its type before it in the level,
// and picks its plea.
export function createCitizen(type, col, row, tile, index = 0) {
  const citizen = CITIZENS[type];
  if (!citizen) throw new Error(`Unknown citizen type '${type}'`);
  const x = (col + 0.5) * tile - citizen.width / 2;
  const y = (row + 1) * tile - citizen.height;
  return {
    type,
    x,
    y,
    w: citizen.width,
    h: citizen.height,
    facing: -1,
    plea: citizen.lines[index % citizen.lines.length],
    near: false,
    speaking: false,
    helped: false,
    thanksTime: 0,
  };
}

function middle(body) {
  return body.x + body.w / 2;
}

// Turns to Blenke and notices whether he is near; the thanks fade.
export function updateCitizen(citizen, player, dt) {
  const gap = middle(player) - middle(citizen);
  citizen.near = Math.abs(gap) <= PLEA_RANGE && Math.abs(player.y + player.h - (citizen.y + citizen.h)) <= PLEA_RANGE;
  if (citizen.near && gap !== 0) citizen.facing = Math.sign(gap);
  citizen.thanksTime = Math.max(0, citizen.thanksTime - dt);
}

// Citizens standing close together would talk over each other, so one
// speaks at a time: one thanking Blenke (the latest) before any, then the
// nearest still pleading. The rest keep quiet, and still.
export function chooseSpeaker(citizens, player) {
  const thanking = citizens.filter((citizen) => citizen.thanksTime > 0);
  const pleading = citizens.filter((citizen) => !citizen.helped && citizen.near);
  const distance = (citizen) => Math.abs(middle(player) - middle(citizen));
  const speaker = thanking.length
    ? thanking.reduce((latest, citizen) => (citizen.thanksTime > latest.thanksTime ? citizen : latest))
    : pleading.reduce((nearest, citizen) => (nearest && distance(nearest) <= distance(citizen) ? nearest : citizen), null);
  for (const citizen of citizens) citizen.speaking = citizen === speaker;
}

// What the citizen is saying now, or null. One with a name (a title and
// a surname) says the plea under it; the thanks are the police's verdict.
export function citizenLine(citizen) {
  if (!citizen.speaking) return null;
  if (citizen.thanksTime > 0) return citizen.plea.thanks;
  if (!citizen.helped && citizen.near) return citizen.plea.name ? `${citizen.plea.name}: ${citizen.plea.plea}` : citizen.plea.plea;
  return null;
}
