// Citizens who need the police: each stands where it is written, asks for
// help when Blenke comes near, and thanks him once he has helped. Helping
// is worth less than an empty tin (score.js), which is the point. Pure: no
// DOM.

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

// act is what the act key does to the citizen: helps, or tests; either is
// worth the same next to nothing.
export const CITIZENS = {
  // A pensioner with a walking stick and a problem.
  pensioner: {
    char: 'm',
    width: 10,
    height: 21,
    act: 'help',
    lines: PLEAS,
  },
  // One of Tungelsta IF's juniors, in the club's orange and black, out to
  // train.
  junior: {
    char: 'é',
    width: 8,
    height: 17,
    act: 'test',
    lines: JUNIOR_LINES,
  },
  // One of Jordbro's children, seven years old in 1972, in a striped
  // jumper and flared jeans, on the way to school.
  jordbroChild: {
    char: 'ñ',
    width: 8,
    height: 15,
    act: 'test',
    lines: JORDBRO_CHILD_LINES,
  },
  // A pupil of Fredrika Bremergymnasiet in the early 1970s: long hair, an
  // army parka, bell-bottoms and clogs.
  bremerPupil: {
    char: 'æ',
    width: 8,
    height: 19,
    act: 'test',
    lines: BREMER_PUPIL_LINES,
  },
  // A youngster in Skogås centrum in the early 1980s, in a denim jacket,
  // jeans and white trainers.
  skogasYouth: {
    char: 'ß',
    width: 8,
    height: 17,
    act: 'test',
    lines: SKOGAS_YOUTH_LINES,
  },
};

// A plea shows while Blenke's middle is this close; the thanks this long.
export const PLEA_RANGE = 96;
export const THANKS_TIME = 2.5;

// Level character to citizen type.
export const CITIZEN_CHARS = Object.fromEntries(Object.entries(CITIZENS).map(([type, citizen]) => [citizen.char, type]));

// A citizen stands on the bottom of the tile it is written in, in the
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

// What the citizen is saying now, or null.
export function citizenLine(citizen) {
  if (citizen.thanksTime > 0) return citizen.plea.thanks;
  if (!citizen.helped && citizen.near) return citizen.plea.plea;
  return null;
}
