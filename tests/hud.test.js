import test from 'node:test';
import assert from 'node:assert/strict';
import { HUD_ICONS } from '../src/art/items.js';
import { LINE_HEIGHT, textWidth } from '../src/art/font.js';
import { VIEW_WIDTH } from '../src/config.js';
import { COLUMNS, HEART_SHAKE_TIME, HOP_HEIGHT, HOP_TIME, hopLift, hudElements, padNumber, VALUE_Y } from '../src/hud.js';
import { HURRY_TIME } from '../src/world.js';
import { LEVELS } from '../src/levels/index.js';
import { startPowerUp, WARN_TIME } from '../src/powerups.js';
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
  world.powerUp = startPowerUp('budgetIncrease');
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
  world.score.carried = 7;
  world.timeLeft = 120.2;
  const texts = hudElements(world).filter((element) => element.kind === 'text').map((element) => element.text);
  for (const expected of ['POLISASSISTENT', '0001250', '×3', '×7', '×0', 'TESTBANA', '121']) {
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

test('a number hops when it changes, and is down again after a moment', () => {
  assert.equal(hopLift(Infinity), 0);
  assert.equal(hopLift(HOP_TIME / 2), HOP_HEIGHT);
  assert.equal(hopLift(HOP_TIME), 0);
  const world = createWorld(definition);
  world.score.carried = 4;
  const samples = () => hudElements(world).find((element) => element.text === '×4');
  assert.equal(samples().y, VALUE_Y);
  world.hops.samples = HOP_TIME / 2;
  assert.equal(samples().y, VALUE_Y - HOP_HEIGHT);
  const score = hudElements(world).find((element) => element.text === '0000000');
  assert.equal(score.y, VALUE_Y, 'only what changed hops');
});

test('a heart just lost shakes, then lies still', () => {
  const world = createWorld(definition);
  world.player.health = 2;
  const lostX = () => hudElements(world).find((element) => element.icon === 'healthLost').x;
  const still = lostX();
  const xs = [];
  for (let age = 0; age < HEART_SHAKE_TIME; age += 1 / 60) {
    world.hops.health = age;
    xs.push(lostX());
  }
  assert.ok(xs.some((x) => x < still) && xs.some((x) => x > still));
  assert.ok(xs.every((x) => Math.abs(x - still) <= 1));
  world.hops.health = HEART_SHAKE_TIME;
  assert.equal(lostX(), still);
});

test('icons stand within the line of text beside them', () => {
  for (const [name, image] of Object.entries(HUD_ICONS)) assert.ok(image.height <= LINE_HEIGHT, name);
});

test('numbers are padded with zeros and never negative', () => {
  assert.equal(padNumber(42, 5), '00042');
  assert.equal(padNumber(-3, 3), '000');
});

test('the power-up at work shows its picture and its seconds left', () => {
  const world = createWorld(definition);
  assert.ok(hudElements(world).some((element) => element.text === '–' && element.x === COLUMNS.powerUp));
  world.powerUp = startPowerUp('policeCoffee');
  world.powerUp.timeLeft = 7.2;
  const slot = hudElements(world).filter((element) => element.x >= COLUMNS.powerUp);
  assert.deepEqual(slot.map((element) => element.icon ?? element.text), ['KRAFT', 'policeCoffee', '8']);
});

test('the shield shows no seconds; it lasts until used', () => {
  const world = createWorld(definition);
  world.powerUp = startPowerUp('paperworkShield');
  const slot = hudElements(world).filter((element) => element.x >= COLUMNS.powerUp);
  assert.deepEqual(slot.map((element) => element.icon ?? element.text), ['KRAFT', 'paperworkShield']);
});

test('a budget increase shows its doubled multiplier', () => {
  const world = createWorld(definition);
  world.powerUp = startPowerUp('budgetIncrease');
  assert.ok(hudElements(world).some((element) => element.text === '×2' && element.colour === 'orange_3'));
});

test('a power-up blinks in the HUD as it runs out', () => {
  const world = createWorld(definition);
  world.powerUp = startPowerUp('helicopter');
  world.powerUp.timeLeft = WARN_TIME;
  const shown = Array.from({ length: 8 }, (_, i) => {
    world.time = i / 8;
    return hudElements(world).some((element) => element.icon === 'helicopter');
  });
  assert.ok(shown.includes(true) && shown.includes(false));
});
