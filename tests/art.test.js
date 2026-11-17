import test from 'node:test';
import assert from 'node:assert/strict';
import { BOSS_PIPS } from '../src/art/enemies.js';
import { ESCALATOR_ART, RAIL_HEIGHT, STEP_DEPTH } from '../src/art/escalator.js';
import { MATERIAL_ART } from '../src/art/materials.js';
import { TILE_TYPES } from '../src/level.js';
import { glowFrames, GLOW_FPS } from '../src/art/glow.js';
import { NIGHT_COLOURS } from '../src/art/night.js';
import { beamArt, wornLooks } from '../src/art/props.js';
import { NEEDLE_STEPS, needleStep, STATION_ART } from '../src/art/station.js';
import { TOUCH_ART, TURN_ART } from '../src/art/touch.js';
import { bigText, GAME_OVER_HEADING, LOGO, TAG_LETTER_ART } from '../src/art/logo.js';
import { TILE, VIEW_HEIGHT, VIEW_WIDTH } from '../src/config.js';
import { ITEMS } from '../src/items.js';
import { isPaletteColour, PALETTE } from '../src/palette.js';
import { STEP_PITCH } from '../src/escalators.js';
import { coloursIn, getPixel } from '../src/pixels.js';
import { POWER_UPS } from '../src/powerups.js';
import { PROPS, THROWS } from '../src/props.js';
import { ITEM_SPRITES, PROP_SPRITES } from '../src/sprites.js';
import { loadDelivered } from './png.js';

// The art the asset factory never drew, drawn in code: the font's
// pictures, the touch controls, the boss's pips, the needle and hose, the
// torch's light, the glow round a power-up and a prop's wear (both drawn
// over the factory's pictures). The factory's sheets are
// tests/sprites.test.js's.

// One SNES palette per sprite: 15 colours and transparent.
const MAX_COLOURS = 15;

const delivered = loadDelivered();
// A delivered sprite's one picture, by the type it draws.
const pictureOf = (sprites, type) => {
  const sprite = Object.keys(sprites).find((name) => sprites[name] === type);
  return Object.values(delivered[sprite].images)[0];
};

function allColours(images) {
  const colours = new Set();
  for (const image of images) for (const value of coloursIn(image)) colours.add(value);
  return colours;
}

const tagImages = Object.values(TAG_LETTER_ART).flatMap((letters) => Object.values(letters));
const touchImages = [TOUCH_ART.pad, ...['knob', 'jump', 'act', 'pause'].flatMap((name) => Object.values(TOUCH_ART[name]))];
const otherImages = [
  beamArt(),
  ...Object.values(BOSS_PIPS),
  STATION_ART.hose,
  ...STATION_ART.needles,
  ...Object.values(ESCALATOR_ART.step),
  ...Object.values(ESCALATOR_ART.piece),
];

test('all art is drawn in the master palette', () => {
  const everything = [...otherImages, ...touchImages, ...tagImages, TURN_ART, LOGO, GAME_OVER_HEADING];
  for (const colour of allColours(everything)) {
    assert.ok(isPaletteColour(colour), `${colour} is not in the palette`);
  }
});

test('the touch controls keep to one palette, round and odd-sized so they centre on their place', () => {
  const colours = allColours(touchImages).size;
  assert.ok(colours <= MAX_COLOURS, `the touch controls have ${colours} colours`);
  for (const image of touchImages) {
    assert.equal(image.width, image.height);
    assert.equal(image.width % 2, 1);
  }
});

test('a power-up glows round its outline in shifting colours, and nothing else does', () => {
  const powerUps = Object.keys(ITEMS).filter((type) => ITEMS[type].category === 'powerUp');
  assert.deepEqual(Object.keys(POWER_UPS).sort(), [...powerUps].sort());
  assert.ok(GLOW_FPS > 0);
  for (const type of powerUps) {
    const item = pictureOf(ITEM_SPRITES, type);
    const frames = glowFrames(item);
    assert.ok(new Set(frames.map((frame) => [...coloursIn(frame)].join())).size > 2, `${type}'s glow doesn't shift`);
    for (const frame of frames) {
      for (const value of coloursIn(frame)) assert.ok(isPaletteColour(value), `${type}'s glow: ${value}`);
      assert.equal(frame.width, item.width + 2, type);
      assert.equal(frame.height, item.height + 2, type);
      assert.ok(frame.width <= TILE && frame.height <= TILE, `${type}'s glow is bigger than a tile`);
      for (let y = 0; y < frame.height; y++) {
        for (let x = 0; x < frame.width; x++) {
          const under = getPixel(item, x - 1, y - 1) !== null;
          let beside = false;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) beside ||= getPixel(item, x - 1 + dx, y - 1 + dy) !== null;
          }
          assert.equal(getPixel(frame, x, y) !== null, beside && !under, `${type}'s glow at ${x},${y}`);
        }
      }
    }
  }
});

test('each throw wears a prop a little more: its size kept, its palette kept, cracked and chipped', () => {
  for (const type of Object.keys(PROPS)) {
    const art = pictureOf(PROP_SPRITES, type);
    const looks = wornLooks(art);
    assert.equal(looks.length, THROWS, type);
    assert.equal(looks[0], art, `${type} starts whole`);
    let changed = 0;
    for (const look of looks.slice(1)) {
      assert.deepEqual([look.width, look.height], [art.width, art.height], type);
      const now = look.pixels.filter((value, index) => value !== art.pixels[index]).length;
      assert.ok(now > changed, `${type} is no worse after another throw`);
      changed = now;
    }
    for (const value of allColours(looks)) assert.ok(isPaletteColour(value), `${type} worn: ${value}`);
    assert.ok(allColours(looks).size <= MAX_COLOURS, `${type} has too many colours`);
  }
});

test('the pump, the hose and the needle share one palette', () => {
  const pump = delivered.pump.images.pump;
  assert.ok(allColours([pump, STATION_ART.hose, ...STATION_ART.needles]).size <= MAX_COLOURS);
});

test("a torch's light is a wedge widening from its lens", () => {
  const beam = beamArt();
  assert.equal(beam.width, PROPS.torch.beam.length);
  const height = (x) => beam.pixels.filter((value, index) => index % beam.width === x && value !== null).length;
  assert.ok(height(0) > 0 && height(beam.width - 1) > height(0));
  assert.equal(beam.height % 2, 1, 'it centres on the lens');
});

test('the needle has a picture for every step from 0 to MAX, each different', () => {
  assert.equal(STATION_ART.needles.length, NEEDLE_STEPS);
  assert.equal(needleStep(0), 0);
  assert.equal(needleStep(1), NEEDLE_STEPS - 1);
  assert.equal(needleStep(2), NEEDLE_STEPS - 1, 'past MAX the needle stays at MAX');
  const pictures = new Set(STATION_ART.needles.map((image) => image.pixels.join()));
  assert.equal(pictures.size, NEEDLE_STEPS);
});

test('the logo fits the view in one palette', () => {
  assert.ok(LOGO.width <= VIEW_WIDTH && LOGO.height <= VIEW_HEIGHT / 2);
  assert.ok(coloursIn(LOGO).size <= MAX_COLOURS);
  for (const value of coloursIn(LOGO)) assert.ok(isPaletteColour(value));
});

test('big text reaches above the capitals for Å, Ä and Ö, and the game over heading fits', () => {
  const bands = Array(7).fill('red_3');
  assert.ok(bigText('Ä', 3, bands).height > bigText('A', 3, bands).height);
  assert.throws(() => bigText('A', 3, ['red_3']), /a band for each/);
  assert.ok(GAME_OVER_HEADING.width <= VIEW_WIDTH);
  assert.ok(coloursIn(GAME_OVER_HEADING).size <= MAX_COLOURS);
});

test('the escalator\'s step is as wide as the steps are apart and reaches below the next, and a piece spans its tile', () => {
  const images = [...Object.values(ESCALATOR_ART.step), ...Object.values(ESCALATOR_ART.piece)];
  assert.ok(allColours(images).size <= MAX_COLOURS);
  for (const step of Object.values(ESCALATOR_ART.step)) assert.deepEqual([step.width, step.height], [STEP_PITCH, STEP_DEPTH]);
  assert.ok(STEP_DEPTH > STEP_PITCH);
  for (const piece of Object.values(ESCALATOR_ART.piece)) {
    assert.equal(piece.width, TILE);
    assert.ok(piece.height > RAIL_HEIGHT + TILE);
  }
  // Rising to the right, the handrail is higher at the right of the piece.
  const { right } = ESCALATOR_ART.piece;
  const railAt = (x) => right.pixels.findIndex((value, index) => index % right.width === x && value !== null);
  assert.ok(railAt(TILE - 1) < railAt(0));
});

test('by night every colour turns to a darker one of the palette, and ink stays ink', () => {
  const light = (hex) => [1, 3, 5].reduce((sum, at) => sum + parseInt(hex.slice(at, at + 2), 16), 0);
  assert.deepEqual(Object.keys(NIGHT_COLOURS).sort(), Object.values(PALETTE).sort());
  for (const [day, night] of Object.entries(NIGHT_COLOURS)) {
    assert.ok(isPaletteColour(night), `${day} turns to ${night}, outside the palette`);
    assert.ok(light(night) <= light(day), `${day} turns lighter, to ${night}`);
  }
  assert.equal(NIGHT_COLOURS[PALETTE.ink], PALETTE.ink);
  assert.ok(light(NIGHT_COLOURS[PALETTE.white]) < light(PALETTE.white));
});

test('world 2\'s materials are whole solid tiles, a top and a fill each, in one palette', () => {
  for (const [char, { top, fill }] of Object.entries(MATERIAL_ART)) {
    assert.ok(TILE_TYPES[char]?.solid, `'${char}' is no solid tile`);
    for (const image of [...top, ...fill]) {
      assert.deepEqual([image.width, image.height], [TILE, TILE], char);
      assert.ok(image.pixels.every((value) => value !== null), `'${char}' has a hole`);
    }
    assert.ok(allColours([...top, ...fill]).size <= MAX_COLOURS, char);
    for (const value of allColours([...top, ...fill])) assert.ok(isPaletteColour(value), `'${char}': ${value}`);
  }
});
