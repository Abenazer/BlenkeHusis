// Citizens who need the police: each stands where it is written, asks for
// help when Blenke comes near, and thanks him once he has helped. Helping
// is worth less than an empty tin (score.js), which is the point. Pure: no
// DOM.

export const CITIZENS = {
  // A pensioner with a walking stick and a problem.
  pensioner: {
    char: 'm',
    width: 10,
    height: 21,
  },
};

// What each citizen asks, and says once helped, in turn: the first citizen
// of a level the first plea, and so on.
export const PLEAS = [
  { plea: 'MIN CYKEL ÄR STULEN!', thanks: 'ANMÄLAN MOTTAGEN. INGA SPÅR.' },
  { plea: 'DET HAR VARIT INBROTT!', thanks: 'VI ÅTERKOMMER. KANSKE.' },
  { plea: 'MIN KATT HAR FÖRSVUNNIT!', thanks: 'KATTEN LÄMNADE INGET PROV.' },
];

// A plea shows while Blenke's middle is this close; the thanks this long.
export const PLEA_RANGE = 96;
export const THANKS_TIME = 2.5;

// Level character to citizen type.
export const CITIZEN_CHARS = Object.fromEntries(Object.entries(CITIZENS).map(([type, citizen]) => [citizen.char, type]));

// A citizen stands on the bottom of the tile it is written in, in the
// middle. index counts the citizens before it in the level, and picks its
// plea.
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
    plea: PLEAS[index % PLEAS.length],
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
