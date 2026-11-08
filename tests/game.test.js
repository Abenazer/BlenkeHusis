import test from 'node:test';
import assert from 'node:assert/strict';
import { STEP, TILE } from '../src/config.js';
import { BONUS_COUNT_TIME, createGame, GAME_OVER_LOCK, isBonusCounted, pauseGame, REPORT_LOCK, stepGame, TURN_DELAY, TURN_REPEAT } from '../src/game.js';
import { beginStep, createInput, queueKey, queueTap, queueText } from '../src/input.js';
import { SEED_SCORES, tagName } from '../src/highscores.js';
import { BROKEN_KEY, CONSENT_KEY, SAVE_KEY } from '../src/save.js';
import { fakeStorage } from './helpers.js';
import { LEVELS } from '../src/levels/index.js';
import { TIME_BONUS_PER_SECOND, URINE_BONUS_PER_SAMPLE } from '../src/report.js';
import { createStation, HOLD_TIME } from '../src/station.js';
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
  const game = createGame(first, { next: after });
  const input = createInput();
  step(game, input, 'Enter');
  return { game, input };
}

test('the game opens on the title, and confirm starts the first level', () => {
  const game = createGame(first, { next: after });
  const input = createInput();
  assert.equal(game.screen, 'title');
  step(game, input);
  assert.equal(game.screen, 'title');
  step(game, input, 'Space');
  assert.equal(game.screen, 'playing');
  assert.equal(game.world.level.id, 'first');
});

test('Kontroller opens the controls, and back or confirm returns with the mark kept', () => {
  const game = createGame(first, { next: after });
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
  const game = createGame(first, { next: after });
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
  step(game, input, 'ArrowUp');
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

function types(events) {
  return events.map((event) => event.type);
}

test('the screens tell what happens on them, for the sounds', () => {
  const game = createGame(first, { next: after });
  const input = createInput();
  assert.deepEqual(types(step(game, input, 'ArrowDown')), ['menuMoved']);
  assert.deepEqual(step(game, input, 'Enter'), [{ type: 'menuChosen', choice: 'controls' }]);
  assert.deepEqual(types(step(game, input, 'Escape')), ['advanced']);
});

test('pausing and going on are told, and the world\'s events come through while playing', () => {
  const { game, input } = started();
  for (let i = 0; i < 10; i++) step(game, input);
  queueKey(input, 'Space', true);
  assert.ok(types(step(game, input)).includes('jump'));
  queueKey(input, 'Space', false);
  assert.deepEqual(types(step(game, input, 'Escape')), ['paused']);
  assert.deepEqual(types(step(game, input, 'KeyP')), ['resumed']);
});

test('Avsluta in the pause menu goes back to the title', () => {
  const { game, input } = started();
  step(game, input, 'Escape');
  step(game, input, 'ArrowUp');
  step(game, input, 'Enter');
  assert.equal(game.screen, 'title');
  assert.equal(game.world, null);
});

test('losing focus pauses a game being played, and nothing else', () => {
  const title = createGame(first, { next: after });
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

test('the bonus is told as it counts, and once when the last of it is in', () => {
  const { game, input } = started();
  reachGoal(game, input, 10);
  const events = [];
  while (game.screenTime < BONUS_COUNT_TIME + 1) events.push(...step(game, input));
  const counted = events.filter((event) => event.type === 'bonusCounted');
  assert.ok(counted.length > 10, `${counted.length} counts`);
  assert.deepEqual(counted.filter((event) => event.done), [{ type: 'bonusCounted', done: true }]);
  assert.equal(counted.at(-1).done, true);
});

test('a full tank\'s urine bonus doubles once it is in, told once', () => {
  const { game, input } = started();
  game.world.station = { ...createStation(4, 1, TILE, 10), phase: 'done', time: HOLD_TIME, poured: 10, share: 1 };
  reachGoal(game, input, 5);
  assert.equal(game.report.bonus, 5 * TIME_BONUS_PER_SECOND + 2 * 10 * URINE_BONUS_PER_SAMPLE);
  const before = game.world.score.points;
  const events = [];
  while (game.screenTime < BONUS_COUNT_TIME + 1) events.push(...step(game, input));
  assert.equal(events.filter((event) => event.type === 'urineDoubled').length, 1);
  assert.equal(game.world.score.points - before, game.report.bonus);
});

test('a report without a bonus counts nothing', () => {
  const { game, input } = started();
  reachGoal(game, input, 0);
  const events = [];
  while (game.screenTime < BONUS_COUNT_TIME + 1) events.push(...step(game, input));
  assert.deepEqual(events, []);
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
  for (let slot = 0; slot < 3; slot++) step(game, input, 'Enter');
  assert.equal(game.screen, 'highScores');
  assert.equal(game.highScores[game.highlight].name, 'AAA', 'signed as the tag starts');
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

test('a score that makes the list is signed with a typed tag, then shown picked out on the list', () => {
  const { game, input } = overWith(12000);
  assert.equal(game.screen, 'nameEntry');
  assert.equal(game.entry.place, 5);
  typeText(game, input, 'bx');
  queueText(input, 'Backspace');
  step(game, input);
  typeText(game, input, 'le');
  assert.equal(tagName(game.entry.tag), 'BLE');
  assert.equal(game.entry.tag.slot, 2, 'the last slot stays the last');
  step(game, input, 'Enter');
  assert.equal(game.screen, 'highScores');
  assert.equal(game.highlight, 5);
  assert.deepEqual(game.highScores[5], { name: 'BLE', points: 12000, rank: 'Polismästare' });
  assert.equal(game.highScores.length, SEED_SCORES.length);
  step(game, input, 'Enter');
  assert.equal(game.screen, 'title');
  assert.equal(game.highScores[5].name, 'BLE', 'the list lasts while the page is open');
});

test('arcade style: up and down turn the letter round, left and right move, Enter moves on and signs from the last', () => {
  const { game, input } = overWith(12000);
  step(game, input, 'ArrowUp');
  step(game, input, 'ArrowUp');
  assert.equal(tagName(game.entry.tag), 'CAA');
  step(game, input, 'ArrowRight');
  step(game, input, 'ArrowDown');
  assert.equal(tagName(game.entry.tag), 'C9A', 'down from A turns round to the last');
  step(game, input, 'ArrowLeft');
  step(game, input, 'ArrowLeft');
  assert.equal(game.entry.tag.slot, 0, 'no further left than the first');
  step(game, input, 'Enter');
  step(game, input, 'Enter');
  assert.equal(game.screen, 'nameEntry');
  step(game, input, 'Enter');
  assert.equal(game.highScores[5].name, 'C9A');
});

test('a letter held up turns on by itself after a moment, and quickly then', () => {
  const { game, input } = overWith(12000);
  queueKey(input, 'ArrowUp', true);
  step(game, input);
  assert.equal(tagName(game.entry.tag), 'BAA');
  while (game.screenTime < TURN_DELAY - STEP) step(game, input);
  assert.equal(tagName(game.entry.tag), 'BAA', 'not before the delay');
  for (let t = 0; t < TURN_DELAY + 2 * TURN_REPEAT; t += STEP) step(game, input);
  assert.ok(game.entry.tag.letters[0] >= 3, 'turning on');
  queueKey(input, 'ArrowUp', false);
  step(game, input);
  const letter = game.entry.tag.letters[0];
  for (let t = 0; t < 1; t += STEP) step(game, input);
  assert.equal(game.entry.tag.letters[0], letter, 'let go, it stops');
});

test('a key that types a letter only types it: W fills the slot rather than turning it', () => {
  const { game, input } = overWith(12000);
  queueKey(input, 'KeyW', true);
  queueText(input, 'w');
  const events = step(game, input);
  assert.deepEqual(types(events), ['typed']);
  assert.equal(tagName(game.entry.tag), 'WAA');
  for (let t = 0; t < 1; t += STEP) step(game, input);
  assert.equal(tagName(game.entry.tag), 'WAA', 'held, it doesn\'t turn the next letter either');
  queueKey(input, 'KeyW', false);
  step(game, input);
});

test('tapped: an arrow turns its slot\'s letter, a letter takes its slot, and KLAR signs at once', () => {
  const { game, input } = overWith(12000);
  const tap = (target) => {
    queueTap(input, target);
    return step(game, input);
  };
  assert.deepEqual(types(tap({ kind: 'tag', slot: 2, step: 1 })), ['tagMoved', 'tagTurned']);
  tap({ kind: 'tag', slot: 2, step: 1 });
  tap({ kind: 'tag', slot: 0, step: -1 });
  assert.equal(tagName(game.entry.tag), '9AC');
  tap({ kind: 'tag', slot: 1, step: 0 });
  assert.equal(game.entry.tag.slot, 1);
  assert.deepEqual(types(tap({ kind: 'sign' })), ['nameSigned']);
  assert.equal(game.screen, 'highScores');
  assert.equal(game.highScores[5].name, '9AC');
});

test('a score that makes the list is told, and so is every key typed, turn and move for it', () => {
  const { game, input } = started();
  game.world.score.points = 12000;
  game.world.over = true;
  game.world.overTime = GAME_OVER_TIME;
  step(game, input);
  while (game.screenTime < GAME_OVER_LOCK) step(game, input);
  assert.deepEqual(step(game, input, 'Enter'), [{ type: 'advanced' }, { type: 'highScore', place: 5 }]);
  const typing = (keys) => {
    for (const key of keys) queueText(input, key);
    return step(game, input).map((event) => event.change);
  };
  assert.deepEqual(typing(['a', '!', 'Backspace']), ['added', 'refused', 'erased']);
  assert.deepEqual(typing(['Backspace']), ['refused'], 'no further back than the first');
  assert.deepEqual(types(step(game, input, 'ArrowUp')), ['tagTurned']);
  assert.deepEqual(types(step(game, input, 'ArrowLeft')), [], 'nowhere to move');
  assert.deepEqual(types(step(game, input, 'ArrowRight')), ['tagMoved']);
  assert.deepEqual(types(step(game, input, 'Enter')), ['tagMoved']);
  assert.deepEqual(types(step(game, input, 'Enter')), ['nameSigned']);
});

test('Ljud on the title opens the sound settings: up and down pick a volume, left and right change it, back returns', () => {
  const game = createGame(first, { next: after });
  const input = createInput();
  step(game, input, 'ArrowDown');
  step(game, input, 'ArrowDown');
  step(game, input, 'Enter');
  assert.equal(game.screen, 'sound');
  assert.deepEqual(step(game, input, 'ArrowLeft'), [{ type: 'volumeChanged', volume: 'music', step: 9 }]);
  assert.deepEqual(step(game, input, 'ArrowRight'), [{ type: 'volumeChanged', volume: 'music', step: 10 }]);
  assert.deepEqual(step(game, input, 'ArrowRight'), [], 'already at the top');
  step(game, input, 'ArrowDown');
  step(game, input, 'KeyA');
  step(game, input, 'KeyA');
  assert.deepEqual(game.settings, { music: 10, effects: 8, muted: false });
  step(game, input, 'ArrowDown');
  assert.deepEqual(step(game, input, 'ArrowLeft'), [], 'the way back has no volume');
  step(game, input, 'Enter');
  assert.equal(game.screen, 'title');
  assert.equal(game.titleMenu.items[game.titleMenu.index].id, 'sound', 'the mark kept');
});

test('Ljud in the pause menu goes back to the pause menu as it was', () => {
  const { game, input } = started();
  step(game, input, 'Escape');
  step(game, input, 'ArrowDown');
  const pauseMenu = game.menu;
  step(game, input, 'Enter');
  assert.equal(game.screen, 'sound');
  assert.deepEqual(types(step(game, input, 'Escape')), ['advanced']);
  assert.equal(game.screen, 'paused');
  assert.equal(game.menu, pauseMenu);
});

test('M turns all sound off and on, on any screen but the name entry, where it is a letter', () => {
  const { game, input } = started();
  assert.deepEqual(step(game, input, 'KeyM').filter((event) => event.type === 'muteToggled'), [{ type: 'muteToggled', muted: true }]);
  assert.equal(game.settings.muted, true);
  step(game, input, 'Escape');
  step(game, input, 'KeyM');
  assert.equal(game.settings.muted, false, 'the pause menu too');
  step(game, input, 'Escape');
  game.world.score.points = 12000;
  game.world.over = true;
  game.world.overTime = GAME_OVER_TIME;
  step(game, input);
  while (game.screenTime < GAME_OVER_LOCK) step(game, input);
  step(game, input, 'Enter');
  assert.equal(game.screen, 'nameEntry');
  queueText(input, 'm');
  step(game, input, 'KeyM');
  assert.equal(game.settings.muted, false);
  assert.equal(tagName(game.entry.tag), 'MAA');
});

test('a score below the list goes straight to the list', () => {
  const { game } = overWith(10);
  assert.equal(game.screen, 'highScores');
  assert.equal(game.highlight, null);
});

// Plays a game to its end with these points and signs it.
function signScore(game, input, points) {
  step(game, input, 'Enter');
  game.world.score.points = points;
  game.world.over = true;
  game.world.overTime = GAME_OVER_TIME;
  step(game, input);
  while (game.screenTime < GAME_OVER_LOCK) step(game, input);
  step(game, input, 'Enter');
  typeText(game, input, 'ble');
  step(game, input, 'Enter');
}

test('the first score on the list asks whether to save; yes saves it for the next visit', () => {
  const storage = fakeStorage();
  const game = createGame(first, { next: after, storage });
  const input = createInput();
  signScore(game, input, 12000);
  assert.equal(game.screen, 'consent');
  assert.equal(storage.getItem(SAVE_KEY), null, 'nothing is written before the answer');
  step(game, input, 'Enter');
  assert.equal(game.screen, 'highScores');
  assert.equal(storage.getItem(CONSENT_KEY), 'yes');
  const later = createGame(first, { next: after, storage });
  assert.equal(later.highScores[5].name, 'BLE');
});

test('the sound settings are saved with the high scores once saving is allowed, and never asked for alone', () => {
  const storage = fakeStorage();
  const game = createGame(first, { next: after, storage });
  const input = createInput();
  step(game, input, 'KeyM');
  assert.equal(game.settings.muted, true);
  assert.equal(storage.map.size, 0, 'nothing saved, nothing asked, before the high scores');
  step(game, input, 'KeyM');
  signScore(game, input, 12000);
  step(game, input, 'Enter');
  step(game, input, 'KeyM');
  const later = createGame(first, { next: after, storage });
  assert.equal(later.settings.muted, true, 'kept for the next visit');
});

test('no stores only the answer, and the question isn\'t asked again', () => {
  const storage = fakeStorage();
  const game = createGame(first, { next: after, storage });
  const input = createInput();
  signScore(game, input, 12000);
  step(game, input, 'ArrowDown');
  step(game, input, 'Enter');
  assert.equal(game.screen, 'highScores');
  assert.deepEqual([...storage.map.entries()], [[CONSENT_KEY, 'no']]);
  step(game, input, 'Enter');
  signScore(game, input, 30500);
  assert.equal(game.screen, 'highScores', 'no question the second time');
  assert.equal(game.highScores[2].points, 30500, 'the list still lasts while the page is open');
  assert.deepEqual([...storage.map.keys()], [CONSENT_KEY]);
});

test('with yes given on an earlier visit, a new score is saved without asking', () => {
  const storage = fakeStorage({ [CONSENT_KEY]: 'yes' });
  const game = createGame(first, { next: after, storage });
  const input = createInput();
  signScore(game, input, 12000);
  assert.equal(game.screen, 'highScores');
  assert.ok(storage.getItem(SAVE_KEY).includes('"BLE"'));
});

test('a save that can\'t be read is kept, and the game starts from the made-up list', (t) => {
  const warn = t.mock.method(console, 'warn', () => {});
  const storage = fakeStorage({ [CONSENT_KEY]: 'yes', [SAVE_KEY]: '{"version":1,"highScores":7}' });
  const game = createGame(first, { next: after, storage });
  assert.deepEqual(game.highScores, SEED_SCORES);
  assert.equal(storage.getItem(BROKEN_KEY), '{"version":1,"highScores":7}');
  assert.equal(warn.mock.callCount(), 1);
});

test('without storage, or when it fails, the game goes on and keeps the list in memory', (t) => {
  const plain = createGame(first, { next: after });
  const input = createInput();
  signScore(plain, input, 12000);
  assert.equal(plain.screen, 'highScores', 'nothing to ask about');

  const warn = t.mock.method(console, 'warn', () => {});
  const failing = {
    getItem: (key) => (key === CONSENT_KEY ? 'yes' : null),
    setItem: () => {
      throw new Error('QuotaExceededError');
    },
    removeItem: () => {},
  };
  const game = createGame(first, { next: after, storage: failing });
  signScore(game, createInput(), 12000);
  assert.equal(game.screen, 'highScores');
  assert.equal(game.highScores[5].name, 'BLE');
  assert.equal(game.storage, null, 'it stops trying');
  assert.ok(warn.mock.callCount() >= 1);
});
