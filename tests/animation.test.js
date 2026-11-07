import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnimation, frameName, updateAnimation } from '../src/animation.js';
import { STEP, TILE } from '../src/config.js';
import { createPlayer } from '../src/player.js';
import { createDriver, makeLevel } from './helpers.js';

const level = makeLevel([
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..@...........................',
  '##############################',
]);

// Steps Lelle and his animation together, as the world does.
function animate(driver, player, animation, steps) {
  for (let i = 0; i < steps; i++) {
    driver.step(player, level);
    updateAnimation(animation, player, STEP);
  }
}

function setup() {
  const player = createPlayer(2.5 * TILE, 5 * TILE);
  const driver = createDriver();
  const animation = createAnimation();
  animate(driver, player, animation, 2);
  return { player, driver, animation };
}

test('standing still, Lelle idles', () => {
  const { player, driver, animation } = setup();
  animate(driver, player, animation, 30);
  assert.equal(animation.name, 'idle');
});

test('Lelle walks, and runs when he picks up speed', () => {
  const { player, driver, animation } = setup();
  driver.press('right');
  animate(driver, player, animation, 30);
  assert.equal(animation.name, 'walk');
  driver.press('run');
  animate(driver, player, animation, 30);
  assert.equal(animation.name, 'run');
});

test('a jump plays on the way up and a fall on the way down, then he lands', () => {
  const { player, driver, animation } = setup();
  driver.press('jump');
  animate(driver, player, animation, 3);
  assert.equal(animation.name, 'jump');
  const seen = new Set();
  for (let i = 0; i < 120 && !player.onGround; i++) {
    animate(driver, player, animation, 1);
    seen.add(animation.name);
  }
  assert.ok(seen.has('fall'));
  assert.equal(animation.name, 'idle');
});

test('crouching plays on only while Lelle crawls', () => {
  const { player, driver, animation } = setup();
  driver.press('down');
  animate(driver, player, animation, 30);
  assert.equal(animation.name, 'crouch');
  assert.equal(animation.time, 0);
  driver.press('right');
  animate(driver, player, animation, 30);
  assert.ok(animation.time > 0);
});

test('a new animation starts from its first frame', () => {
  const animation = { name: 'idle', time: 5 };
  updateAnimation(animation, { crouching: false, onGround: false, vy: -100, vx: 0 }, STEP);
  assert.deepEqual(animation, { name: 'jump', time: 0 });
});

test('frames follow the frame rate, looping or holding the last', () => {
  const animations = { walk: ['a', 'b', 'c'], jump: ['up', 'top'] };
  const playback = { walk: { fps: 10, loop: true }, jump: { fps: 10, loop: false } };
  assert.equal(frameName({ name: 'walk', time: 0 }, animations, playback), 'a');
  assert.equal(frameName({ name: 'walk', time: 0.1 }, animations, playback), 'b');
  assert.equal(frameName({ name: 'walk', time: 0.35 }, animations, playback), 'a');
  assert.equal(frameName({ name: 'jump', time: 5 }, animations, playback), 'top');
  assert.throws(() => frameName({ name: 'swim', time: 0 }, animations, playback), /No frames/);
});
