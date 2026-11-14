import test from 'node:test';
import assert from 'node:assert/strict';
import { BOSS_PIPS } from '../src/art/enemies.js';
import { glowFrames, GLOW_FPS } from '../src/art/glow.js';
import { beamArt, wornLooks } from '../src/art/props.js';
import { NEEDLE_STEPS, needleStep, STATION_ART } from '../src/art/station.js';
import { CITIZEN_ART as BREMER_CITIZEN_ART } from '../src/art/bremer.js';
import { CITIZEN_ART as JORDBRO_CITIZEN_ART } from '../src/art/jordbro.js';
import { CITIZEN_ART as SKOGAS_CITIZEN_ART, SCENERY_ART as SKOGAS_SCENERY_ART } from '../src/art/skogas.js';
import { CITIZEN_ART, SCENERY_ART } from '../src/art/tif.js';
import { TOUCH_ART, TURN_ART } from '../src/art/touch.js';
import { bigText, GAME_OVER_HEADING, LOGO, TAG_LETTER_ART } from '../src/art/logo.js';
import { TILE, VIEW_HEIGHT, VIEW_WIDTH } from '../src/config.js';
import { ITEMS } from '../src/items.js';
import { isPaletteColour } from '../src/palette.js';
import { coloursIn, getPixel } from '../src/pixels.js';
import { POWER_UPS } from '../src/powerups.js';
import { PROPS, THROWS } from '../src/props.js';
import { ITEM_SPRITES, PROP_SPRITES } from '../src/sprites.js';
import { SCENERY } from '../src/scenery.js';
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
];

test('all art is drawn in the master palette', () => {
  const everything = [...otherImages, ...touchImages, ...tagImages, TURN_ART, LOGO, GAME_OVER_HEADING];
  for (const colour of allColours(everything)) {
    assert.ok(isPaletteColour(colour), `${colour} is not in the palette`);
  }
});

// Tungelsta IF until the factory delivers it: the junior hung like a
// delivered citizen, the goal and banner at their scenery size, each in
// one SNES palette.
const tifCitizenFrames = Object.values(CITIZEN_ART).flatMap((looks) => [...looks.stand.frames, ...looks.wave.frames]);

test("Tungelsta IF's junior stands on the middle of his feet in a citizen's frame", () => {
  for (const { image, originX, originY } of tifCitizenFrames) {
    assert.deepEqual([image.width, image.height, originX, originY], [20, 25, 8, 25]);
    assert.ok(Array.from({ length: image.width }, (_, x) => getPixel(image, x, image.height - 1)).some((value) => value !== null), 'he floats');
  }
});

test("Tungelsta IF's goal and banner stand on their bottom left corner at their scenery size", () => {
  for (const [type, { frames }] of Object.entries(SCENERY_ART)) {
    for (const { image, originX, originY } of frames) {
      assert.deepEqual([image.width, image.height, originX, originY], [SCENERY[type].width, SCENERY[type].height, 0, SCENERY[type].height], type);
    }
  }
});

test("Tungelsta IF's art keeps to the palette, 15 colours a sprite", () => {
  for (const frames of [tifCitizenFrames, ...Object.values(SCENERY_ART).map((look) => look.frames)]) {
    const colours = allColours(frames.map((frame) => frame.image));
    assert.ok(colours.size <= MAX_COLOURS, `${colours.size} colours`);
    for (const value of colours) assert.ok(isPaletteColour(value), value);
  }
});

// The citizens drawn in code until the factory delivers them, each hung
// like a delivered citizen, in one SNES palette.
for (const [type, looks] of Object.entries({ ...JORDBRO_CITIZEN_ART, ...BREMER_CITIZEN_ART, ...SKOGAS_CITIZEN_ART })) {
  const frames = [...looks.stand.frames, ...looks.wave.frames];
  test(`the ${type} stands on the middle of his feet in a citizen's frame, in one palette`, () => {
    for (const { image, originX, originY } of frames) {
      assert.deepEqual([image.width, image.height, originX, originY], [20, 25, 8, 25]);
      assert.ok(Array.from({ length: image.width }, (_, x) => getPixel(image, x, image.height - 1)).some((value) => value !== null), 'he floats');
    }
    const colours = allColours(frames.map((frame) => frame.image));
    assert.ok(colours.size <= MAX_COLOURS, `${colours.size} colours`);
    for (const value of colours) assert.ok(isPaletteColour(value), value);
  });
}

test("Fornborgs Färg och Parfym's sign stands on its bottom left corner at its scenery size, in one palette", () => {
  const { frames } = SKOGAS_SCENERY_ART.fornborgSign;
  for (const { image, originX, originY } of frames) {
    assert.deepEqual([image.width, image.height, originX, originY], [SCENERY.fornborgSign.width, SCENERY.fornborgSign.height, 0, SCENERY.fornborgSign.height]);
  }
  const colours = allColours(frames.map((frame) => frame.image));
  assert.ok(colours.size <= MAX_COLOURS, `${colours.size} colours`);
  for (const value of colours) assert.ok(isPaletteColour(value), value);
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
