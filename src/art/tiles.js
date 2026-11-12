// The suburb's tiles, drawn in code: lawn over soil, red brick, concrete,
// asphalt with its kerb, wooden panelling in five colours, a rendered
// facade and corrugated sheet metal, a greenhouse's glass, concrete balconies and wooden planks, and the
// hazards: police tape, a sewer pipe, deep water, toxic slime, giant
// syringes and a urine puddle; crates, closed and opened; the police
// barrier that closes the boss's way out, and a secret room's inside (its
// wall is brick). 16×16 and no
// outline, so they join without
// seams (as the asset factory's tiles do). Solid tiles have a look for
// their top surface and one for underneath, in a couple of variants so a
// long stretch doesn't repeat; liquids have frames instead, which play.
// The moving platform and the pipe's stream are here too. Pure: no DOM.
import { LEAK_WIDTH } from '../hazards.js';
import { TILE } from '../config.js';
import { colour } from '../palette.js';
import { PLATFORM_THICKNESS } from '../platforms.js';
import { createImage, fillRect, noise, setPixel } from '../pixels.js';

function tile(paint) {
  const image = createImage(TILE, TILE);
  paint(image);
  return image;
}

// Picks a colour per pixel from noise: each [threshold, name] wins where the
// noise is below its threshold, the base colour elsewhere.
function speckle(image, seed, base, specks, top = 0) {
  for (let y = top; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const n = noise(x, y, seed);
      const hit = specks.find(([threshold]) => n < threshold);
      setPixel(image, x, y, colour(hit ? hit[1] : base));
    }
  }
}

function soil(image, seed, top = 0) {
  speckle(image, seed, 'brown_2', [[0.1, 'brown_1'], [0.16, 'brown_3']], top);
  // A stone in some tiles.
  if (noise(seed, 3) < 0.5) return;
  const stoneX = 2 + Math.floor(noise(seed, 1) * 10);
  const stoneY = Math.max(top + 2, 4 + Math.floor(noise(seed, 2) * 9));
  fillRect(image, stoneX, stoneY, 3, 2, colour('grey_3'));
  fillRect(image, stoneX, stoneY, 2, 1, colour('grey_4'));
  setPixel(image, stoneX, stoneY, colour('grey_5'));
}

// Grass: a ragged lawn edge with tufts, over the soil.
function lawn(image, seed) {
  soil(image, seed, 0);
  for (let x = 0; x < TILE; x++) {
    const depth = 5 + Math.floor(noise(x, 0, seed + 7) * 3);
    const tuft = noise(x, 1, seed + 3) < 0.3;
    for (let y = tuft ? 0 : 1; y < depth; y++) {
      const shade = y === 0 || (y === 1 && !tuft) ? 'grass_4' : y >= depth - 1 ? 'grass_2' : 'grass_3';
      setPixel(image, x, y, colour(shade));
    }
    if (noise(x, 2, seed) < 0.25) setPixel(image, x, 2, colour('grass_4'));
    setPixel(image, x, depth, colour('grass_1'));
  }
}

// Red brick, 8×4 with mortar, every other course shifted half a brick.
function brick(image, seed, withCap) {
  fillRect(image, 0, 0, TILE, TILE, colour('grey_3'));
  for (let course = 0; course < 4; course++) {
    const shift = course % 2 === 0 ? 0 : 4;
    for (let b = -1; b < 2; b++) {
      const x0 = b * 8 + shift;
      const y0 = course * 4;
      const tone = noise(b + 2, course, seed) < 0.3 ? 'red_2' : 'red_3';
      fillRect(image, x0, y0, 7, 3, colour(tone));
      fillRect(image, x0, y0, 7, 1, colour(tone === 'red_3' ? 'red_4' : 'red_3'));
    }
  }
  if (withCap) {
    fillRect(image, 0, 0, TILE, 3, colour('grey_4'));
    fillRect(image, 0, 0, TILE, 1, colour('grey_5'));
    fillRect(image, 0, 3, TILE, 1, colour('grey_2'));
  }
}

// Concrete slab: flat grey with pores, lit from above.
function concrete(image, seed, withTop) {
  speckle(image, seed, 'grey_4', [[0.06, 'grey_3'], [0.09, 'grey_5']]);
  fillRect(image, 0, TILE - 1, TILE, 1, colour('grey_3'));
  fillRect(image, TILE - 1, 0, 1, TILE, colour('grey_3'));
  if (withTop) {
    fillRect(image, 0, 0, TILE, 1, colour('grey_6'));
    fillRect(image, 0, 1, TILE, 1, colour('grey_5'));
  }
}

// Asphalt; on top, a granite kerb.
function asphalt(image, seed, withKerb) {
  speckle(image, seed, 'grey_2', [[0.12, 'grey_1'], [0.18, 'grey_3']]);
  if (withKerb) {
    fillRect(image, 0, 0, TILE, 4, colour('grey_4'));
    fillRect(image, 0, 0, TILE, 1, colour('grey_5'));
    fillRect(image, 0, 4, TILE, 1, colour('grey_1'));
    setPixel(image, 7, 1, colour('grey_3'));
    setPixel(image, 7, 2, colour('grey_3'));
    setPixel(image, 7, 3, colour('grey_3'));
  }
}

// Standing wooden panelling, painted or stained in a ramp [shadow, seam,
// board, light]: a seam and a lit edge every four pixels, a knot here and
// there; on top, the white trim of an eave or a floor over a shadow.
function panel(image, seed, [shadow, seam, board, light], withTrim) {
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const shade = x % 4 === 0 ? seam : x % 4 === 1 ? light : board;
      setPixel(image, x, y, colour(shade !== board || noise(x, y, seed) > 0.04 ? shade : seam));
    }
  }
  if (withTrim) {
    fillRect(image, 0, 0, TILE, 2, colour('white'));
    fillRect(image, 0, 2, TILE, 1, colour('grey_5'));
    fillRect(image, 0, 3, TILE, 1, colour(shadow));
  }
}

// The panelling's colours: a villa's yellow, Falu red, green, blue and
// the seventies' brown stain.
const YELLOW_PANEL = ['urine_1', 'urine_2', 'urine_3', 'urine_4'];
const RED_PANEL = ['red_1', 'red_1', 'red_2', 'red_3'];
const GREEN_PANEL = ['grass_1', 'grass_2', 'grass_3', 'grass_4'];
const BLUE_PANEL = ['water_1', 'water_2', 'water_3', 'water_4'];
const BROWN_PANEL = ['brown_1', 'brown_2', 'brown_3', 'brown_4'];

// A rendered facade, light beige with its grain; on top, a white cornice
// over a shadow.
function plaster(image, seed, withCornice) {
  speckle(image, seed, 'skin_5', [[0.08, 'skin_4'], [0.11, 'white']]);
  if (withCornice) {
    fillRect(image, 0, 0, TILE, 2, colour('white'));
    fillRect(image, 0, 2, TILE, 1, colour('grey_5'));
    fillRect(image, 0, 3, TILE, 1, colour('skin_3'));
  }
}

// The seventies' corrugated sheet metal, orange, its ridges standing and
// a rivet now and then; on top, the grey flashing.
function sheetMetal(image, seed, withFlashing) {
  const ridge = ['orange_1', 'orange_2', 'orange_3', 'orange_2'];
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) setPixel(image, x, y, colour(ridge[x % 4]));
  }
  if (noise(seed, 4) < 0.5) setPixel(image, 2 + 4 * Math.floor(noise(seed, 5) * 3), 8, colour('grey_2'));
  if (withFlashing) {
    fillRect(image, 0, 0, TILE, 1, colour('grey_5'));
    fillRect(image, 0, 1, TILE, 2, colour('grey_4'));
    fillRect(image, 0, 3, TILE, 1, colour('grey_2'));
  }
}

// A greenhouse's glass: a pane in a white frame, clear but for a glint,
// so what is behind shows through; on top, the frame's ridge.
function glass(image, withRidge) {
  fillRect(image, 0, 0, 1, TILE, colour('grey_5'));
  fillRect(image, 0, 0, TILE, 1, colour('grey_5'));
  fillRect(image, 1, 1, TILE - 1, 1, colour('grey_6'));
  for (let i = 0; i < 6; i++) {
    setPixel(image, 9 + i - 6, 12 - i, colour('white'));
    setPixel(image, 12 + i - 6, 13 - i, colour('sky_4'));
  }
  if (withRidge) {
    fillRect(image, 0, 0, TILE, 2, colour('white'));
    fillRect(image, 0, 2, TILE, 1, colour('grey_4'));
  }
}

// A balcony slab sticking out of a block of flats, on two brackets.
function balcony(image) {
  fillRect(image, 0, 0, TILE, 1, colour('grey_6'));
  fillRect(image, 0, 1, TILE, 2, colour('grey_5'));
  fillRect(image, 0, 3, TILE, 1, colour('grey_4'));
  fillRect(image, 0, 4, TILE, 1, colour('grey_2'));
  for (const x of [2, 12]) {
    fillRect(image, x, 5, 2, 1, colour('grey_3'));
    setPixel(image, x, 6, colour('grey_3'));
  }
}

// A plank with its nails.
function plank(image) {
  fillRect(image, 0, 0, TILE, 1, colour('brown_4'));
  fillRect(image, 0, 1, TILE, 3, colour('brown_3'));
  fillRect(image, 0, 4, TILE, 1, colour('brown_1'));
  fillRect(image, 3, 2, 5, 1, colour('brown_2'));
  fillRect(image, 10, 3, 4, 1, colour('brown_2'));
  setPixel(image, 1, 2, colour('grey_5'));
  setPixel(image, 14, 2, colour('grey_5'));
  fillRect(image, 0, 0, 1, 4, colour('brown_2'));
}

// Police tape, Swedish blue and white, strung along the top from a striped
// post, so Blenke can stand on the cordon he can't walk through.
function tape(image) {
  fillRect(image, 6, 0, 4, TILE, colour('grey_2'));
  for (let y = 0; y < TILE - 2; y++) {
    const band = Math.floor(y / 3) % 2 === 0 ? 'red_3' : 'white';
    fillRect(image, 7, y, 2, 1, colour(band));
  }
  fillRect(image, 4, TILE - 2, 8, 2, colour('grey_2'));
  fillRect(image, 5, TILE - 2, 6, 1, colour('grey_3'));
  fillRect(image, 0, 1, TILE, 4, colour('ink'));
  for (let x = 0; x < TILE; x++) {
    for (let y = 2; y <= 3; y++) {
      const stripe = Math.floor((x + y) / 3) % 2 === 0 ? 'blue_3' : 'white';
      setPixel(image, x, y, colour(stripe));
    }
  }
}

// A rusty sewer pipe coming down, with a cracked collar at its end.
function pipe(image) {
  fillRect(image, 3, 0, 10, TILE, colour('grey_3'));
  fillRect(image, 3, 0, 1, TILE, colour('grey_1'));
  fillRect(image, 12, 0, 1, TILE, colour('grey_1'));
  fillRect(image, 5, 0, 2, TILE, colour('grey_5'));
  fillRect(image, 7, 0, 1, TILE, colour('grey_4'));
  fillRect(image, 2, 10, 12, 5, colour('grey_2'));
  fillRect(image, 2, 10, 12, 1, colour('grey_4'));
  fillRect(image, 2, 14, 12, 1, colour('grey_1'));
  for (const [x, y] of [[9, 3], [10, 4], [4, 7], [11, 12], [5, 12]]) setPixel(image, x, y, colour('brown_3'));
  setPixel(image, 10, 3, colour('brown_2'));
  setPixel(image, 8, 11, colour('ink'));
  setPixel(image, 9, 12, colour('ink'));
  setPixel(image, 8, 13, colour('ink'));
}

// A liquid's surface sits `surface` pixels down its tile, a crest of
// light that rolls along with each frame; underneath it darkens in
// dithered bands. Deep water rolls; slime bubbles.
function liquid(image, frame, surface, shades, bubbles) {
  const [deep, body, light, crest] = shades.map(colour);
  for (let y = surface; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const lower = y > surface + 6 && (y > surface + 8 || (x + y) % 2 === 0);
      setPixel(image, x, y, lower ? deep : body);
    }
  }
  for (let x = 0; x < TILE; x++) {
    const wave = Math.floor(((x + frame * 4) % TILE) / 4);
    setPixel(image, x, surface, wave === 1 ? light : crest);
    if (wave === 2) setPixel(image, x, surface - 1, crest);
    if (wave === 0) setPixel(image, x, surface + 1, light);
  }
  if (!bubbles) {
    setPixel(image, (5 + frame * 5) % TILE, surface + 4, light);
    setPixel(image, (6 + frame * 5) % TILE, surface + 4, light);
    return;
  }
  for (const [x, y] of bubbles[frame]) {
    setPixel(image, x, surface + y, crest);
    setPixel(image, x + 1, surface + y, light);
  }
}

// Deep inside a liquid: no surface, only the dark with a glint or bubble.
function deepLiquid(image, frame, shades) {
  const [deep, body, light] = shades.map(colour);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) setPixel(image, x, y, (x + y + frame) % 7 === 0 ? body : deep);
  }
  setPixel(image, (3 + frame * 6) % TILE, 9 - frame * 3, light);
}

const WATER = ['water_2', 'water_3', 'water_4', 'sky_4'];
const SLIME = ['slime_1', 'slime_2', 'slime_3', 'slime_4'];
const SLIME_BUBBLES = [
  [[3, 3], [11, 6]],
  [[3, 2], [12, 5], [7, 8]],
  [[11, 4], [7, 6]],
];

// Two giant syringes, needles up: they hurt from y = 4 down.
function syringes(image) {
  for (const x of [1, 9]) {
    fillRect(image, x + 2, 4, 1, 4, colour('grey_5'));
    setPixel(image, x + 2, 4, colour('white'));
    fillRect(image, x, 8, 5, 6, colour('ink'));
    fillRect(image, x + 1, 8, 3, 5, colour('sky_4'));
    fillRect(image, x + 1, 10, 3, 3, colour('red_3'));
    setPixel(image, x + 1, 10, colour('red_4'));
    fillRect(image, x - 1, 13, 7, 1, colour('grey_3'));
    fillRect(image, x + 2, 14, 1, 1, colour('grey_3'));
    fillRect(image, x, 15, 5, 1, colour('grey_2'));
  }
}

// A urine puddle on the ground, the tile's bottom rows, with a glint.
function puddle(image) {
  fillRect(image, 2, 13, 12, 1, colour('urine_3'));
  fillRect(image, 0, 14, TILE, 2, colour('urine_3'));
  fillRect(image, 1, 15, 14, 1, colour('urine_2'));
  fillRect(image, 4, 14, 5, 1, colour('urine_4'));
  setPixel(image, 11, 14, colour('urine_4'));
}

// A police evidence crate: a frame of dark planks, boards across with
// nails at the ends, and the force's blue band with a white seal, unbroken.
// Opened, the band is torn and the boards are dull.
function crate(image, open) {
  const [frame, board, light, seam] = open
    ? ['brown_1', 'brown_2', 'brown_3', 'brown_1']
    : ['brown_1', 'brown_3', 'brown_4', 'brown_2'];
  fillRect(image, 0, 0, TILE, TILE, colour(board));
  for (const y of [5, 10]) fillRect(image, 1, y, TILE - 2, 1, colour(seam));
  for (const y of [1, 6, 11]) fillRect(image, 1, y, TILE - 2, 1, colour(light));
  fillRect(image, 0, 0, TILE, 1, colour(frame));
  fillRect(image, 0, TILE - 1, TILE, 1, colour(frame));
  fillRect(image, 0, 0, 1, TILE, colour(frame));
  fillRect(image, TILE - 1, 0, 1, TILE, colour(frame));
  for (const y of [2, 7, 12]) {
    setPixel(image, 2, y, colour('grey_5'));
    setPixel(image, TILE - 3, y, colour('grey_5'));
  }
  if (open) {
    fillRect(image, 1, 7, 3, 2, colour('blue_2'));
    fillRect(image, TILE - 4, 7, 3, 2, colour('blue_2'));
    fillRect(image, 4, 6, 8, 4, colour('ink'));
    return;
  }
  fillRect(image, 1, 7, TILE - 2, 2, colour('blue_3'));
  fillRect(image, 1, 7, TILE - 2, 1, colour('blue_4'));
  fillRect(image, 6, 5, 4, 6, colour('white'));
  fillRect(image, 7, 6, 2, 4, colour('blue_3'));
  setPixel(image, 9, 10, colour('grey_5'));
}

// A police barrier: steel rails and bars, a blue plate with a white
// stripe on the top rail; seen through between the bars.
function gate(image, withPlate) {
  for (const x of [1, 5, 9, 13]) {
    fillRect(image, x, 0, 2, TILE, colour('grey_4'));
    fillRect(image, x + 1, 0, 1, TILE, colour('grey_3'));
  }
  fillRect(image, 0, 1, TILE, 2, colour('grey_5'));
  fillRect(image, 0, 3, TILE, 1, colour('grey_2'));
  fillRect(image, 0, 12, TILE, 2, colour('grey_5'));
  fillRect(image, 0, 14, TILE, 1, colour('grey_2'));
  if (!withPlate) return;
  fillRect(image, 3, 5, 10, 5, colour('ink'));
  fillRect(image, 4, 6, 8, 3, colour('blue_3'));
  fillRect(image, 4, 7, 8, 1, colour('white'));
}

// The inside of a room (a secret one, or a building cut open): dim
// wallpaper with a stripe, and under the ceiling a shadow.
function room(image, underCeiling) {
  fillRect(image, 0, 0, TILE, TILE, colour('brown_1'));
  for (let x = 2; x < TILE; x += 6) fillRect(image, x, 0, 2, TILE, colour('brown_2'));
  for (let y = 3; y < TILE; y += 6) setPixel(image, 4 + (y % 4), y, colour('red_2'));
  if (underCeiling) {
    fillRect(image, 0, 0, TILE, 3, colour('ink'));
    fillRect(image, 0, 3, TILE, 1, colour('purple_1'));
  }
}

// A tile-wide piece of a moving platform: a steel deck with hazard stripes.
function platformPiece() {
  const image = createImage(TILE, PLATFORM_THICKNESS);
  fillRect(image, 0, 0, TILE, 1, colour('grey_6'));
  fillRect(image, 0, 1, TILE, 1, colour('grey_4'));
  for (let x = 0; x < TILE; x++) {
    for (let y = 2; y < 4; y++) setPixel(image, x, y, colour(Math.floor((x + y) / 2) % 2 === 0 ? 'hivis_3' : 'ink'));
  }
  fillRect(image, 0, 4, TILE, 1, colour('grey_3'));
  fillRect(image, 0, 5, TILE, 1, colour('grey_1'));
  return image;
}

export const PLATFORM_ART = platformPiece();

// The sewage from a leaking pipe, a tile high and stacked down to where it
// lands, in frames that run downwards.
function stream(frame) {
  const image = createImage(LEAK_WIDTH, TILE);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < LEAK_WIDTH; x++) {
      const edge = x === 0 || x === LEAK_WIDTH - 1;
      const streak = (y + frame * 4 + x * 3) % 8 < 2;
      setPixel(image, x, y, colour(edge ? 'brown_2' : streak ? 'brown_4' : 'brown_3'));
    }
  }
  setPixel(image, 2, (frame * 4 + 3) % TILE, colour('slime_3'));
  return image;
}

export const LEAK_ART = { frames: [0, 1, 2, 3].map(stream), fps: 12 };

const VARIANTS = [11, 29, 47, 83];
const FRAMES = [0, 1, 2];

const ASPHALT = {
  top: VARIANTS.map((seed) => tile((image) => asphalt(image, seed, true))),
  fill: VARIANTS.map((seed) => tile((image) => asphalt(image, seed, false))),
};

// For each tile character: `top` where nothing solid (or, for a liquid,
// no more of it) lies above, `fill` underneath; tiles that are never
// stacked only have `top`. Where `fps` is given, the pictures are frames
// played in turn rather than variants by place.
export const TILE_ART = {
  '#': {
    top: VARIANTS.map((seed) => tile((image) => lawn(image, seed))),
    fill: VARIANTS.map((seed) => tile((image) => soil(image, seed))),
  },
  B: {
    top: VARIANTS.map((seed) => tile((image) => brick(image, seed, true))),
    fill: VARIANTS.map((seed) => tile((image) => brick(image, seed, false))),
  },
  Z: {
    top: VARIANTS.map((seed) => tile((image) => concrete(image, seed, true))),
    fill: VARIANTS.map((seed) => tile((image) => concrete(image, seed, false))),
  },
  A: ASPHALT,
  W: {
    top: VARIANTS.map((seed) => tile((image) => panel(image, seed, YELLOW_PANEL, true))),
    fill: VARIANTS.map((seed) => tile((image) => panel(image, seed, YELLOW_PANEL, false))),
  },
  'Ä': {
    top: VARIANTS.map((seed) => tile((image) => panel(image, seed, RED_PANEL, true))),
    fill: VARIANTS.map((seed) => tile((image) => panel(image, seed, RED_PANEL, false))),
  },
  'Ö': {
    top: VARIANTS.map((seed) => tile((image) => panel(image, seed, GREEN_PANEL, true))),
    fill: VARIANTS.map((seed) => tile((image) => panel(image, seed, GREEN_PANEL, false))),
  },
  'Å': {
    top: VARIANTS.map((seed) => tile((image) => panel(image, seed, BLUE_PANEL, true))),
    fill: VARIANTS.map((seed) => tile((image) => panel(image, seed, BLUE_PANEL, false))),
  },
  'ä': {
    top: VARIANTS.map((seed) => tile((image) => panel(image, seed, BROWN_PANEL, true))),
    fill: VARIANTS.map((seed) => tile((image) => panel(image, seed, BROWN_PANEL, false))),
  },
  'ö': {
    top: VARIANTS.map((seed) => tile((image) => plaster(image, seed, true))),
    fill: VARIANTS.map((seed) => tile((image) => plaster(image, seed, false))),
  },
  'å': {
    top: VARIANTS.map((seed) => tile((image) => sheetMetal(image, seed, true))),
    fill: VARIANTS.map((seed) => tile((image) => sheetMetal(image, seed, false))),
  },
  g: { top: [tile((image) => glass(image, true))], fill: [tile((image) => glass(image, false))] },
  '=': { top: [tile(tape)], fill: [tile(tape)] },
  O: { top: [tile(pipe)], fill: [tile(pipe)] },
  '-': { top: [tile(balcony)] },
  _: { top: [tile(plank)] },
  '~': {
    top: FRAMES.map((frame) => tile((image) => liquid(image, frame, 4, WATER, null))),
    fill: FRAMES.map((frame) => tile((image) => deepLiquid(image, frame, WATER))),
    fps: 3,
  },
  '%': {
    top: FRAMES.map((frame) => tile((image) => liquid(image, frame, 5, SLIME, SLIME_BUBBLES))),
    fill: FRAMES.map((frame) => tile((image) => deepLiquid(image, frame, SLIME))),
    fps: 4,
  },
  '^': { top: [tile(syringes)] },
  ',': { top: [tile(puddle)] },
  '?': { top: [tile((image) => crate(image, false))], fill: [tile((image) => crate(image, false))] },
  '!': { top: [tile((image) => crate(image, true))], fill: [tile((image) => crate(image, true))] },
  '|': { top: [tile((image) => gate(image, true))], fill: [tile((image) => gate(image, false))] },
  // Drawn in front of everything until the room is found, so the room
  // and what is in it stay hidden; the renderer uses the brick's own
  // look underneath (a delivered sheet's, if there is one).
  ':': { top: VARIANTS.map((seed) => tile((image) => brick(image, seed, false))) },
  // Secret asphalt is asphalt to look at, top and fill (the renderer uses
  // a delivered asphalt sheet's, if there is one).
  '[': ASPHALT,
  ';': { top: [tile((image) => room(image, true))], fill: [tile((image) => room(image, false))] },
};

// Which variant a tile at col, row uses: fixed per place, so the ground
// doesn't change as the view scrolls.
export function variantAt(variants, col, row) {
  return variants[Math.floor(noise(col, row, 5) * variants.length)];
}
