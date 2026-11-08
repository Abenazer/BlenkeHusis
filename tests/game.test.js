import test from 'node:test';
import assert from 'node:assert/strict';
import { STEP } from '../src/config.js';
import { createGame, GAME_OVER_LOCK, pauseGame, stepGame } from '../src/game.js';
import { beginStep, createInput, queueKey } from '../src/input.js';
import { LEVELS } from '../src/levels/index.js';
import { COMPLETE_TIME, GAME_OVER_TIME } from '../src/world.js';

const first = { id: 'first', name: 'Först', rows: ['......', '.@....', '######'] };
const second = { id: 'second', name: 'Sedan', rows: ['......', '.@....', '######'] };
const after = (level) => (level === first ? second : null);

// Steps the game once with a key tapped (pressed and let go within the
// step), or with nothing pressed.
function step(game, input, code = null) {
  if (code) {
    queueKey(input, code, true);
    queueKey(input, code, false);
  }
  beginStep(input);
  return stepGame(game, input, STEP);
}

function started() {
  const game = createGame(first, after);
  const input = createInput();
  step(game, input, 'Enter');
  return { game, input };
}

test('the game opens on the title, and confirm starts the first level', () => {
  const game = createGame(first, after);
  const input = createInput();
  assert.equal(game.screen, 'title');
  step(game, input);
  assert.equal(game.screen, 'title');
  step(game, input, 'Space');
  assert.equal(game.screen, 'playing');
  assert.equal(game.world.level.id, 'first');
});

test('Kontroller opens the controls, and back or confirm returns with the mark kept', () => {
  const game = createGame(first, after);
  const input = createInput();
  step(game, input, 'ArrowDown');
  step(game, input, 'Enter');
  assert.equal(game.screen, 'controls');
  step(game, input, 'Escape');
  assert.equal(game.screen, 'title');
  assert.equal(game.titleMenu.items[game.titleMenu.index].id, 'controls');
  step(game, input, 'Enter');
  step(game, input, 'Enter');
  assert.equal(game.screen, 'title');
});

test('Topplista cannot be chosen yet: the mark goes round past it', () => {
  const game = createGame(first, after);
  const input = createInput();
  step(game, input, 'ArrowUp');
  assert.equal(game.titleMenu.items[game.titleMenu.index].id, 'controls');
});

test('back on the title after a game, the mark is on Starta again', () => {
  const { game, input } = started();
  step(game, input, 'Escape');
  step(game, input, 'ArrowDown');
  step(game, input, 'Enter');
  assert.equal(game.screen, 'title');
  assert.equal(game.titleMenu.items[game.titleMenu.index].id, 'start');
});

test('pause stops the world, and pause again or Fortsätt goes on', () => {
  const { game, input } = started();
  step(game, input, 'Escape');
  assert.equal(game.screen, 'paused');
  const time = game.world.time;
  step(game, input);
  assert.equal(game.world.time, time, 'the world stands still');
  step(game, input, 'KeyP');
  assert.equal(game.screen, 'playing');
  step(game, input, 'KeyP');
  step(game, input, 'Enter');
  assert.equal(game.screen, 'playing');
});

test('Avsluta in the pause menu goes back to the title', () => {
  const { game, input } = started();
  step(game, input, 'Escape');
  step(game, input, 'ArrowDown');
  step(game, input, 'Enter');
  assert.equal(game.screen, 'title');
  assert.equal(game.world, null);
});

test('losing focus pauses a game being played, and nothing else', () => {
  const title = createGame(first, after);
  pauseGame(title);
  assert.equal(title.screen, 'title');
  const { game } = started();
  pauseGame(game);
  assert.equal(game.screen, 'paused');
});

test('the goal goes on to the next level with the score and lives', () => {
  const { game, input } = started();
  game.world.score.points = 500;
  game.world.lives = 2;
  game.world.complete = true;
  game.world.completeTime = COMPLETE_TIME;
  step(game, input);
  assert.equal(game.world.level.id, 'second');
  assert.equal(game.world.score.points, 500);
  assert.equal(game.world.lives, 2);
});

test('the game over screen follows the world\'s own, and takes a key only after a moment', () => {
  const { game, input } = started();
  game.world.over = true;
  game.world.overTime = GAME_OVER_TIME;
  step(game, input);
  assert.equal(game.screen, 'gameOver');
  const time = game.world.time;
  step(game, input, 'Enter');
  assert.equal(game.screen, 'gameOver', 'a key pressed straight away is ignored');
  while (game.screenTime < GAME_OVER_LOCK) step(game, input);
  assert.equal(game.world.time, time, 'the world stays as it stopped');
  step(game, input, 'Enter');
  assert.equal(game.screen, 'title');
});

test('after the last level the title comes back', () => {
  const { game, input } = started();
  game.world.complete = true;
  game.world.completeTime = COMPLETE_TIME;
  step(game, input);
  game.world.complete = true;
  game.world.completeTime = COMPLETE_TIME;
  step(game, input);
  assert.equal(game.screen, 'title');
});

test('the real game starts at its first level', () => {
  const game = createGame(LEVELS[0]);
  const input = createInput();
  step(game, input, 'Enter');
  assert.equal(game.world.level.id, LEVELS[0].id);
});
