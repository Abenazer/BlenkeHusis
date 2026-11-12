// Things Blenke can pick up, carry and throw: a traffic cone, a crate of
// folköl, a thermos of police coffee, a torch and a megaphone. A thrown
// one flies in an arc, puts an enemy it hits out of action and opens a
// crate it hits; then it lies where it lands until he picks it up again.
// Each takes THROWS throws: every throw that ends wears it, and the last
// breaks it, once what it does lying (the torch's light, the megaphone's
// slogans) is over. Besides, each does something of its own:
//   stand  lying still, it is something to stand on
//   spill  where a throw ends it splashes, striking every enemy this near
//   beam   lying after a throw, it shines the way it was thrown, `time`
//          seconds, showing what is hidden in its light
//   lure   lying after a throw, it blares slogans, `time` seconds, and
//          draws enemies this near to it
// How it moves is in world.js, with the other things that fall. Pure: no
// DOM.
export const PROPS = {
  cone: { char: 'v', width: 10, height: 12, shards: ['orange_2', 'orange_1', 'white'], breaks: 'KONEN KASSERAD. NY BESTÄLLS VIA UPPHANDLING.' },
  // Heavy: a short, low throw.
  beerCrate: {
    char: '{', width: 14, height: 10, throw: { speed: 150, lift: 140 }, stand: true,
    shards: ['red_3', 'brown_2', 'sky_4'], breaks: 'BACKEN SÖNDER. FOLKÖLEN ÄR FORTFARANDE LAGLIG.',
  },
  thermos: {
    char: '}', width: 6, height: 12, spill: 28,
    shards: ['grey_5', 'brown_2', 'brown_3'], breaks: 'TERMOSEN TOM. KÅREN STÅR UTAN KAFFE.',
  },
  torch: {
    char: ']', width: 10, height: 5, beam: { length: 96, spread: 0.45, time: 6 },
    shards: ['grey_3', 'grey_5', 'hivis_4'], breaks: 'FICKLAMPAN SLOCKNAD. SPANINGEN AVSLUTAD.',
  },
  megaphone: {
    char: '>', width: 12, height: 9, lure: { range: 112, time: 5, every: 1.6 },
    shards: ['white', 'red_3', 'grey_3'], breaks: 'MEGAFONEN TYST. BUDSKAPET GICK FRAM.',
  },
};

// Every prop takes this many throws.
export const THROWS = 3;

// What a megaphone blares, in turn.
export const MEGAPHONE_SLOGANS = [
  'SÄG NEJ TILL NARKOTIKA!',
  'ETT NARKOTIKAFRITT SVERIGE!',
  'LANGA INTE!',
  'KNARK ÄR KNARK!',
];

// Level character to prop type.
export const PROP_CHARS = Object.fromEntries(Object.entries(PROPS).map(([type, prop]) => [prop.char, type]));

// A throw goes this fast forward (plus some of Blenke's own speed) and up:
// low enough to hit a crate standing on the ground. A prop can throw
// differently (`throw`).
export const THROW_SPEED = 230;
export const THROW_CARRY = 0.5;
export const THROW_LIFT = 120;
export const PROP_GRAVITY = 900;
export const PROP_MAX_FALL = 430;
// How fast a prop on the ground slides to a stop. A thrown one still
// strikes what it slides into until it is slower than STRIKE_SPEED.
export const PROP_FRICTION = 900;
export const STRIKE_SPEED = 120;
// A torch's light reaches this far either side of its middle even right
// by it.
export const BEAM_BASE = 6;

// A prop stands on the bottom of the tile it is written in, in the middle.
// wear: how many of its throws have ended; effectTime: how long its
// light or slogans go on; spent once its last throw has ended.
export function createProp(type, col, row, tile) {
  const prop = PROPS[type];
  if (!prop) throw new Error(`Unknown prop type '${type}'`);
  const x = (col + 0.5) * tile - prop.width / 2;
  const y = (row + 1) * tile - prop.height;
  return {
    type, x, y, px: x, py: y, dx: 0, dy: 0, w: prop.width, h: prop.height, vx: 0, vy: 0,
    carried: false, thrown: false, onGround: false, facing: 1,
    wear: 0, spent: false, effectTime: 0, saying: null, sayTimer: 0, slogan: 0,
  };
}

// Lets go of a carried prop. thrown: flung forward the way facing points;
// otherwise it just drops.
export function releaseProp(prop, { thrown, facing = 1, carrierVx = 0 }) {
  const { speed = THROW_SPEED, lift = THROW_LIFT } = PROPS[prop.type].throw ?? {};
  prop.carried = false;
  prop.thrown = thrown;
  prop.onGround = false;
  prop.facing = facing;
  prop.vx = thrown ? facing * speed + carrierVx * THROW_CARRY : 0;
  prop.vy = thrown ? -lift : 0;
}

// A throw has ended: the prop wears, and the last throw spends it. Its
// light or slogans start. Returns whether it breaks now (spent, with
// nothing left to do lying).
export function wearProp(prop) {
  const data = PROPS[prop.type];
  prop.wear = Math.min(THROWS, prop.wear + 1);
  prop.spent = prop.wear >= THROWS;
  const lasting = data.beam ?? data.lure;
  if (lasting) {
    prop.effectTime = lasting.time;
    prop.sayTimer = 0;
  }
  return prop.spent && !lasting;
}

// Picked up, a prop stops shining or blaring.
export function liftProp(prop) {
  prop.carried = true;
  prop.vx = 0;
  prop.vy = 0;
  prop.effectTime = 0;
  prop.saying = null;
}

// Whether something can stand on the prop now: one made for it, lying
// still.
export function isStandable(prop) {
  return Boolean(PROPS[prop.type].stand) && !prop.carried && !prop.thrown && prop.onGround;
}

// Whether a torch lies shining now.
export function isShining(prop) {
  return Boolean(PROPS[prop.type].beam) && !prop.carried && !prop.thrown && prop.effectTime > 0;
}

// Whether a point is in a shining torch's light: ahead of it, within its
// length, and within a cone widening from its lens.
export function inBeam(prop, x, y) {
  if (!isShining(prop)) return false;
  const { length, spread } = PROPS[prop.type].beam;
  const ahead = (x - (prop.x + prop.w / 2)) * prop.facing;
  if (ahead < 0 || ahead > length) return false;
  return Math.abs(y - (prop.y + prop.h / 2)) <= BEAM_BASE + ahead * spread;
}

// Whether a megaphone lies blaring now.
export function isBlaring(prop) {
  return Boolean(PROPS[prop.type].lure) && !prop.carried && !prop.thrown && prop.effectTime > 0;
}

// Runs a lying prop's light or slogans down. Returns what happened:
// { blared: the slogan just started, or null; breaks: spent and done }.
export function stepEffect(prop, dt) {
  const result = { blared: null, breaks: false };
  if (prop.effectTime <= 0 || prop.carried || prop.thrown) return result;
  const { lure } = PROPS[prop.type];
  if (lure) {
    prop.sayTimer -= dt;
    if (prop.sayTimer <= 0) {
      prop.saying = MEGAPHONE_SLOGANS[prop.slogan % MEGAPHONE_SLOGANS.length];
      prop.slogan += 1;
      prop.sayTimer = lure.every;
      result.blared = prop.saying;
    }
  }
  prop.effectTime = Math.max(0, prop.effectTime - dt);
  if (prop.effectTime > 0) return result;
  prop.saying = null;
  result.breaks = prop.spent;
  return result;
}
