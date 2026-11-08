import test from 'node:test';
import assert from 'node:assert/strict';
import { FADE_LEVELS, fadeImage } from '../src/art/cover.js';
import { STEP, TILE, VIEW_HEIGHT, VIEW_WIDTH } from '../src/config.js';
import { createGame, stepGame } from '../src/game.js';
import { beginStep, createInput, queueKey } from '../src/input.js';
import { PALETTE } from '../src/palette.js';
import { FADE_TIME, fadeOver, IRIS_TIME, irisFor, irisOver } from '../src/transitions.js';
import { COMPLETE_TIME, createWorld, DOWN_TIME, stepWorld } from '../src/world.js';

const first = { id: 'first', name: 'Först', rows: ['......', '.@....', '######'] };

function step(game, input, code = null) {
  if (code) {
    queueKey(input, code, true);
    queueKey(input, code, false);
  }
  beginStep(input);
  return stepGame(game, input, STEP);
}

function stepFor(world, seconds) {
  const input = createInput();
  for (let i = 0; i < Math.round(seconds / STEP); i++) stepWorld(world, input, STEP);
}

test('a level opens with the iris shut on Blenke, and open after a moment', () => {
  const world = createWorld(first);
  const iris = irisFor(world);
  assert.equal(iris.closed, 1);
  const { player, camera } = world;
  assert.equal(iris.x, player.x + player.w / 2 - camera.x);
  assert.equal(iris.y, player.y + player.h / 2 - camera.y);
  stepFor(world, IRIS_TIME / 2);
  assert.ok(irisFor(world).closed > 0.4 && irisFor(world).closed < 0.6);
  stepFor(world, IRIS_TIME / 2 + STEP);
  assert.equal(irisFor(world), null);
});

test('a lost life closes the iris on Blenke before he is back, and it opens where he starts again', () => {
  const world = createWorld({ id: 'pit', name: 'Pit', rows: ['......', '.@....', '###..#'] });
  stepFor(world, IRIS_TIME + STEP);
  const input = createInput();
  queueKey(input, 'ArrowRight', true);
  let steps = 0;
  while (world.down === 0 && steps++ < 300) {
    beginStep(input);
    stepWorld(world, input, STEP);
  }
  assert.ok(world.down > 0, 'he never fell');
  assert.equal(irisFor(world), null, 'it stays open as the life is lost');
  stepFor(world, DOWN_TIME - IRIS_TIME / 2);
  const closing = irisFor(world);
  assert.ok(closing.closed > 0.4 && closing.closed < 0.6);
  assert.ok(closing.y >= 0 && closing.y <= VIEW_HEIGHT, 'its centre stays on the view, though he fell out of it');
  stepFor(world, IRIS_TIME / 2);
  assert.equal(world.down, 0, 'he is back');
  assert.ok(irisFor(world).closed > 0.9);
  assert.ok(Math.abs(irisFor(world).x - (1.5 * TILE - world.camera.x)) < 1, 'it opens on where he starts');
});

test('the goal closes the iris before the report, and the report fades in from shut', () => {
  const game = createGame({ id: 'goal', name: 'Mål', rows: ['......', '.@.G..', '######'] }, { next: () => null });
  const input = createInput();
  step(game, input, 'Enter');
  queueKey(input, 'ArrowRight', true);
  while (!game.world.complete) step(game, input);
  queueKey(input, 'ArrowRight', false);
  for (let t = 0; t < COMPLETE_TIME - IRIS_TIME - STEP; t += STEP) step(game, input);
  assert.equal(irisOver(game), null, 'open while Blenke stands at the goal');
  for (let t = 0; t < IRIS_TIME - STEP; t += STEP) step(game, input);
  assert.ok(irisOver(game).closed > 0.9);
  while (game.screen === 'playing') step(game, input);
  assert.equal(game.screen, 'levelComplete');
  assert.equal(irisOver(game), null);
  assert.ok(fadeOver(game).closed > 0.9);
  for (let t = 0; t < FADE_TIME; t += STEP) step(game, input);
  assert.equal(fadeOver(game), null);
});

test('the screens around the play fade in; the level and the pause menu come at once', () => {
  const game = createGame(first);
  const input = createInput();
  assert.equal(fadeOver(game).closed, 1, 'the title fades in as the page opens');
  for (let t = 0; t < FADE_TIME; t += STEP) step(game, input);
  assert.equal(fadeOver(game), null);
  step(game, input, 'ArrowDown');
  step(game, input, 'Enter');
  assert.equal(game.screen, 'controls');
  assert.ok(fadeOver(game).closed > 0.9);
  step(game, input, 'Escape');
  step(game, input, 'ArrowUp');
  step(game, input, 'Enter');
  assert.equal(game.screen, 'playing');
  assert.equal(fadeOver(game), null, 'the level opens with its iris, not a fade');
  step(game, input, 'Escape');
  assert.equal(game.screen, 'paused');
  assert.equal(fadeOver(game), null);
  step(game, input, 'Escape');
  assert.equal(game.screen, 'playing');
  assert.equal(fadeOver(game), null);
});

test('a key works on a screen while it fades in', () => {
  const game = createGame(first);
  const input = createInput();
  step(game, input, 'ArrowDown');
  step(game, input, 'Enter');
  assert.equal(game.screen, 'controls');
  assert.ok(fadeOver(game));
  step(game, input, 'Escape');
  assert.equal(game.screen, 'title');
});

test('each level of the fade covers what the one below does and more, in ink', () => {
  const ink = PALETTE.ink;
  let covered = 0;
  let previous = fadeImage(0);
  assert.ok(previous.pixels.every((pixel) => pixel === null));
  for (let level = 1; level <= FADE_LEVELS; level++) {
    const image = fadeImage(level);
    assert.equal(image.width, VIEW_WIDTH);
    assert.equal(image.height, VIEW_HEIGHT);
    const count = image.pixels.filter((pixel) => pixel === ink).length;
    assert.ok(image.pixels.every((pixel) => pixel === null || pixel === ink));
    assert.ok(previous.pixels.every((pixel, index) => pixel === null || image.pixels[index] === ink));
    assert.ok(count > covered);
    covered = count;
    previous = image;
  }
  assert.equal(covered, VIEW_WIDTH * VIEW_HEIGHT);
});
