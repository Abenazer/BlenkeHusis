import test from 'node:test';
import assert from 'node:assert/strict';
import { HUD_ICONS } from '../src/art/items.js';
import { LINE_HEIGHT, textWidth } from '../src/art/font.js';
import { VIEW_WIDTH } from '../src/config.js';
import { COLUMNS, HURRY_TIME, hudElements, padNumber } from '../src/hud.js';
import { LEVELS } from '../src/levels/index.js';
import { RANKS } from '../src/score.js';
import { createWorld } from '../src/world.js';

const definition = { id: 'hud', name: 'Testbana', rows: ['.@.', '###'] };

function elementWidth(element) {
  return element.kind === 'icon' ? HUD_ICONS[element.icon].width : textWidth(element.text);
}

// The widest the HUD gets: the highest counts and a combo. (The ranks get
// a test of their own.)
function crowdedWorld() {
  const world = createWorld(definition);
  Object.assign(world.score, { points: 9999999, samples: 999, possessions: 99, chain: 5 });
  world.lives = 99;
  world.timeLeft = 999;
  return world;
}

test('the HUD columns never run into each other or off the view', () => {
  const elements = hudElements(crowdedWorld());
  const starts = Object.values(COLUMNS).sort((a, b) => a - b);
  for (const element of elements) {
    const column = Math.max(...starts.filter((start) => start <= element.x));
    const next = starts.find((start) => start > column) ?? VIEW_WIDTH;
    assert.ok(element.x + elementWidth(element) < next - 2, `${element.text ?? element.icon} runs into the next column`);
  }
});

test('every rank fits over the score', () => {
  for (const rank of RANKS) assert.ok(COLUMNS.score + textWidth(rank.title.toUpperCase()) < COLUMNS.lives - 2, rank.title);
});

test('the name of every level fits its column', () => {
  for (const { name } of LEVELS) assert.ok(COLUMNS.level + textWidth(name.toUpperCase()) < COLUMNS.time - 2, name);
});

test('the HUD shows the score, counts, level and time', () => {
  const world = createWorld(definition);
  world.score.points = 1250;
  world.score.samples = 7;
  world.timeLeft = 120.2;
  const texts = hudElements(world).filter((element) => element.kind === 'text').map((element) => element.text);
  for (const expected of ['POLISASPIRANT', '0001250', '×3', '×7', '×0', 'TESTBANA', '121']) {
    assert.ok(texts.includes(expected), `missing ${expected}`);
  }
});

test('the combo multiplier shows only while a chain is going', () => {
  const world = createWorld(definition);
  assert.ok(!hudElements(world).some((element) => element.colour === 'orange_3'));
  world.score.chain = 3;
  assert.ok(hudElements(world).some((element) => element.text === '×3' && element.colour === 'orange_3'));
});

test('the clock turns red when time runs short', () => {
  const world = createWorld(definition);
  world.timeLeft = HURRY_TIME;
  const clock = hudElements(world).find((element) => element.text === '030');
  assert.equal(clock.colour, 'red_4');
});

test('hearts show the health left over the lives', () => {
  const world = createWorld(definition);
  world.player.health = 2;
  const hearts = hudElements(world).filter((element) => element.kind === 'icon' && element.icon.startsWith('health'));
  assert.deepEqual(hearts.map((element) => element.icon), ['health', 'health', 'healthLost']);
});

test('icons stand within the line of text beside them', () => {
  for (const [name, image] of Object.entries(HUD_ICONS)) assert.ok(image.height <= LINE_HEIGHT, name);
});

test('numbers are padded with zeros and never negative', () => {
  assert.equal(padNumber(42, 5), '00042');
  assert.equal(padNumber(-3, 3), '000');
});
