// Darkness: a dark passage's tiles (DARK in a level) are drawn over in the
// fade's dithered ink, everything in them hidden but where something
// gives light: Blenke's own little round, a street lamp standing there, a
// torch lying lit (its beam) and the raver's glow sticks. The light is
// worked out for each 4×4 block of a dark tile, the dither's own size, so
// a pool of light has soft, stepped edges. Pure: no DOM.
import { TILE } from './config.js';
import { DARK, tileAt } from './level.js';
import { inBeam, isShining, PROPS } from './props.js';
import { PROJECTILES } from './projectiles.js';
import { SCENERY } from './scenery.js';

// How many dither levels there are (the fade's), and how dark a dark
// passage is with no light at all: nearly ink, a few pixels showing.
export const DARK_LEVELS = 16;
export const DARKEST = 15;
// The side of a block lit as one.
export const BLOCK = 4;

// Blenke's own round: full light within inner, none past outer.
export const PLAYER_LIGHT = { inner: 8, outer: 30 };
// A glow stick's round.
const GLOW_LIGHT = { inner: 4, outer: 22 };

// How lit a point is by a round light at (x, y): 1 within inner, fading
// to 0 at outer.
function roundLight(light, x, y, px, py) {
  const distance = Math.hypot(px - x, py - y);
  if (distance <= light.inner) return 1;
  return Math.max(0, (light.outer - distance) / (light.outer - light.inner));
}

// The world's lights now: { round: [{ x, y, inner, outer }], beams: [prop] }.
export function lightsOf(world) {
  const { player } = world;
  const round = [{ x: player.x + player.w / 2, y: player.y + player.h / 2, ...PLAYER_LIGHT }];
  for (const piece of world.scenery) {
    const light = SCENERY[piece.type].light;
    if (light) round.push({ x: piece.x + light.x, y: piece.y + light.y, inner: light.inner, outer: light.outer });
  }
  for (const projectile of world.projectiles) {
    if (PROJECTILES[projectile.type].glow) round.push({ x: projectile.x + projectile.w / 2, y: projectile.y + projectile.h / 2, ...GLOW_LIGHT });
  }
  return { round, beams: world.props.filter(isShining) };
}

// How lit a point is, 0 to 1: the brightest light on it. A torch's beam
// lights all it reaches, dimming towards its end.
export function lightAt(lights, x, y) {
  let light = 0;
  for (const round of lights.round) light = Math.max(light, roundLight(round, round.x, round.y, x, y));
  for (const prop of lights.beams) {
    if (!inBeam(prop, x, y)) continue;
    const ahead = Math.abs(x - (prop.x + prop.w / 2));
    light = Math.max(light, Math.min(1, 1.5 * (1 - ahead / PROPS[prop.type].beam.length)));
  }
  return light;
}

// The dither level a point is covered with: DARKEST unlit, 0 fully lit.
export function darknessAt(lights, x, y) {
  return Math.round(DARKEST * (1 - lightAt(lights, x, y)));
}

// The dark tiles in cols left..right, rows top..bottom, each { col, row,
// level } when the whole tile is one level, or { col, row, blocks } with
// the level of each 4×4 block, row by row.
export function darkTiles(level, lights, left, top, right, bottom) {
  const found = [];
  const perSide = TILE / BLOCK;
  for (let row = top; row <= bottom; row++) {
    for (let col = left; col <= right; col++) {
      if (tileAt(level, col, row) !== DARK) continue;
      const blocks = [];
      for (let by = 0; by < perSide; by++) {
        for (let bx = 0; bx < perSide; bx++) {
          blocks.push(darknessAt(lights, col * TILE + (bx + 0.5) * BLOCK, row * TILE + (by + 0.5) * BLOCK));
        }
      }
      if (blocks.every((value) => value === blocks[0])) found.push({ col, row, level: blocks[0] });
      else found.push({ col, row, blocks });
    }
  }
  return found;
}
