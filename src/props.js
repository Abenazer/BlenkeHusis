// Things Blenke can pick up, carry and throw: a traffic cone. A thrown one
// flies in an arc, puts an enemy it hits out of action and opens a crate
// it hits; then it lies where it lands until he picks it up again. How it
// moves is in world.js, with the other things that fall. Pure: no DOM.
export const PROPS = {
  cone: { char: 'v', width: 10, height: 12 },
};

// Level character to prop type.
export const PROP_CHARS = Object.fromEntries(Object.entries(PROPS).map(([type, prop]) => [prop.char, type]));

// A throw goes this fast forward (plus some of Blenke's own speed) and up:
// low enough to hit a crate standing on the ground.
export const THROW_SPEED = 230;
export const THROW_CARRY = 0.5;
export const THROW_LIFT = 120;
export const PROP_GRAVITY = 900;
export const PROP_MAX_FALL = 430;
// How fast a prop on the ground slides to a stop. A thrown one still
// strikes what it slides into until it is slower than STRIKE_SPEED.
export const PROP_FRICTION = 900;
export const STRIKE_SPEED = 120;

// A prop stands on the bottom of the tile it is written in, in the middle.
export function createProp(type, col, row, tile) {
  const prop = PROPS[type];
  if (!prop) throw new Error(`Unknown prop type '${type}'`);
  const x = (col + 0.5) * tile - prop.width / 2;
  const y = (row + 1) * tile - prop.height;
  return { type, x, y, px: x, py: y, w: prop.width, h: prop.height, vx: 0, vy: 0, carried: false, thrown: false, onGround: false };
}

// Lets go of a carried prop. thrown: flung forward the way facing points;
// otherwise it just drops.
export function releaseProp(prop, { thrown, facing = 1, carrierVx = 0 }) {
  prop.carried = false;
  prop.thrown = thrown;
  prop.onGround = false;
  prop.vx = thrown ? facing * THROW_SPEED + carrierVx * THROW_CARRY : 0;
  prop.vy = thrown ? -THROW_LIFT : 0;
}
