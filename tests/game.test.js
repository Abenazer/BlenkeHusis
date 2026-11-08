import test from 'node:test';
import assert from 'node:assert/strict';
import { STEP } from '../src/config.js';
import { BONUS_COUNT_TIME, createGame, GAME_OVER_LOCK, isBonusCounted, pauseGame, REPORT_LOCK, stepGame } from '../src/game.js';
import { beginStep, createInput, queueKey, queueText } from '../src/input.js';
import { SEED_SCORES } from '../src/highscores.js';
import { LEVELS } from '../src/levels/index.js';
import { TIME_BONUS_PER_SECOND } from '../src/report.js';
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

test('Topplista opens the high scores, and back returns to the title with the mark kept', () => {
  const game = createGame(first, after);
  const input = createInput();
  step(game, input, 'ArrowUp');
  step(game, input, 'Enter');
  assert.equal(game.screen, 'highScores');
  assert.equal(game.highlight, null);
  step(game, input, 'Escape');
  assert.equal(game.screen, 'title');
  assert.equal(game.titleMenu.items[game.titleMenu.index].id, 'scores');
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

function reachGoal(game, input, timeLeft = 0) {
  game.world.timeLeft = timeLeft;
  game.world.complete = true;
  game.world.completeTime = COMPLETE_TIME;
  step(game, input);
}

// Past the report's lock, then a key: the first finishes the count, the
// second goes on.
function leaveReport(game, input) {
  while (game.screenTime < REPORT_LOCK) step(game, input);
  step(game, input, 'Enter');
  if (game.screen === 'levelComplete') step(game, input, 'Enter');
}

test('the goal brings up the level\'s report, then the next level with the score and lives', () => {
  const { game, input } = started();
  game.world.score.points = 500;
  game.world.lives = 2;
  reachGoal(game, input);
  assert.equal(game.screen, 'levelComplete');
  assert.equal(game.report.title, 'Först');
  leaveReport(game, input);
  assert.equal(game.screen, 'playing');
  assert.equal(game.world.level.id, 'second');
  assert.equal(game.world.score.points, 500);
  assert.equal(game.world.lives, 2);
});

test('the time bonus counts into the score, and a key finishes the count', () => {
  const { game, input } = started();
  reachGoal(game, input, 42.7);
  assert.equal(game.report.bonus, 42 * TIME_BONUS_PER_SECOND);
  for (let i = 0; i < 20; i++) step(game, input);
  const counting = game.world.score.points;
  assert.ok(counting > 0 && counting < game.report.bonus, 'part of it is in');
  while (game.screenTime < REPORT_LOCK) step(game, input);
  step(game, input, 'Enter');
  assert.equal(game.world.score.points, 420);
  assert.ok(isBonusCounted(game));
  assert.equal(game.screen, 'levelComplete', 'the first key only finishes the count');
});

test('left alone, the whole bonus is counted, once', () => {
  const { game, input } = started();
  reachGoal(game, input, 10);
  while (game.screenTime < BONUS_COUNT_TIME + 1) step(game, input);
  assert.equal(game.world.score.points, 100);
});

test('after the last level comes the year\'s report over every level, then the high scores', () => {
  const { game, input } = started();
  reachGoal(game, input, 100);
  leaveReport(game, input);
  reachGoal(game, input, 50);
  leaveReport(game, input);
  assert.equal(game.screen, 'yearReport');
  assert.equal(game.year.levels, 2);
  assert.equal(game.year.cost, game.reports[0].cost + game.reports[1].cost);
  step(game, input, 'Enter');
  assert.equal(game.screen, 'yearReport', 'it takes no key straight away');
  leaveReport(game, input);
  assert.equal(game.screen, 'nameEntry', 'the time bonuses, 1 500 points, make the list');
  step(game, input, 'Enter');
  assert.equal(game.screen, 'highScores');
  assert.equal(game.highScores[game.highlight].name, 'BLENKE', 'signed with nothing typed');
  step(game, input, 'Enter');
  assert.equal(game.screen, 'title');
});

test('the real game starts at its first level', () => {
  const game = createGame(LEVELS[0]);
  const input = createInput();
  step(game, input, 'Enter');
  assert.equal(game.world.level.id, LEVELS[0].id);
});

function typeText(game, input, text) {
  for (const key of text) queueText(input, key);
  step(game, input);
}

function overWith(points) {
  const { game, input } = started();
  game.world.score.points = points;
  game.world.over = true;
  game.world.overTime = GAME_OVER_TIME;
  step(game, input);
  while (game.screenTime < GAME_OVER_LOCK) step(game, input);
  step(game, input, 'Enter');
  return { game, input };
}

test('a score that makes the list is signed for, then shown picked out on the list', () => {
  const { game, input } = overWith(12000);
  assert.equal(game.screen, 'nameEntry');
  assert.equal(game.entry.place, 5);
  typeText(game, input, 'blenkx');
  queueText(input, 'Backspace');
  step(game, input);
  typeText(game, input, 'e h');
  step(game, input, 'Space');
  assert.equal(game.screen, 'nameEntry', 'space is part of a name, not a confirm');
  step(game, input, 'Enter');
  assert.equal(game.screen, 'highScores');
  assert.equal(game.highlight, 5);
  assert.deepEqual(game.highScores[5], { name: 'BLENKE H', points: 12000, rank: 'Polisaspirant' });
  assert.equal(game.highScores.length, SEED_SCORES.length);
  step(game, input, 'Enter');
  assert.equal(game.screen, 'title');
  assert.equal(game.highScores[5].name, 'BLENKE H', 'the list lasts while the page is open');
});

test('a score below the list goes straight to the list', () => {
  const { game } = overWith(10);
  assert.equal(game.screen, 'highScores');
  assert.equal(game.highlight, null);
});
