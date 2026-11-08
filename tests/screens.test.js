import test from 'node:test';
import assert from 'node:assert/strict';
import { LINE_HEIGHT, textWidth } from '../src/art/font.js';
import { GAME_OVER_HEADING, LOGO } from '../src/art/logo.js';
import { SPEAKER_OFF, VOLUME_BARS } from '../src/art/sound.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../src/config.js';
import { createGame, GAME_OVER_LOCK, pauseGame, REPORT_LOCK, stepGame } from '../src/game.js';
import { beginStep, createInput, queueKey } from '../src/input.js';
import { createMenu } from '../src/menu.js';
import { fakeStorage } from './helpers.js';
import { BLINK_PERIOD, caseFileRows, CONTROL_ROWS, menuElements, screenLayout } from '../src/screens.js';
import { COMPLETE_TIME, GAME_OVER_TIME } from '../src/world.js';

const level = { id: 'screen', name: 'Skärm', rows: ['......', '.@....', '######'] };

function sizeOf(element) {
  if (element.kind === 'image') {
    const images = { logo: LOGO, gameOver: GAME_OVER_HEADING, speakerOff: SPEAKER_OFF };
    VOLUME_BARS.forEach((bar, level) => { images[`volume${level}`] = bar; });
    const image = images[element.image];
    return { width: image.width, height: image.height };
  }
  return { width: textWidth(element.text), height: LINE_HEIGHT };
}

function assertInView(elements) {
  for (const element of elements) {
    const { width, height } = sizeOf(element);
    assert.ok(element.x >= 0 && element.x + width <= VIEW_WIDTH, `${element.text ?? element.image} fits across`);
    assert.ok(element.y >= 0 && element.y + height <= VIEW_HEIGHT, `${element.text ?? element.image} fits down`);
  }
}

function texts(layout) {
  return layout.elements.filter((element) => element.kind === 'text').map((element) => element.text);
}

test('the title shows the logo and its menu over the bare backdrop', () => {
  const game = createGame(level);
  const shown = screenLayout(game);
  assert.equal(shown.shade, false);
  assert.ok(shown.elements.some((element) => element.image === 'logo'));
  for (const label of ['STARTA', 'KONTROLLER', 'LJUD', 'TOPPLISTA']) assert.ok(texts(shown).includes(label), label);
  assertInView(shown.elements);
});

test('the controls screen lists every row with its keys, inside the view', () => {
  const game = createGame(level);
  const input = createInput();
  for (const code of ['ArrowDown', 'Enter']) {
    queueKey(input, code, true);
    queueKey(input, code, false);
    beginStep(input);
    stepGame(game, input, 1 / 60);
  }
  assert.equal(game.screen, 'controls');
  const shown = screenLayout(game);
  assert.equal(shown.shade, true);
  for (const row of CONTROL_ROWS) assert.ok(texts(shown).includes(row.label), row.label);
  assert.ok(texts(shown).includes('SHIFT  X'));
  assertInView(shown.elements);
});

test('the sound screen shows each volume\'s bar and step and the way back, inside the view', () => {
  const game = createGame(level);
  const input = createInput();
  for (const code of ['ArrowDown', 'ArrowDown', 'Enter', 'ArrowLeft', 'ArrowLeft']) {
    queueKey(input, code, true);
    queueKey(input, code, false);
    beginStep(input);
    stepGame(game, input, 1 / 60);
  }
  assert.equal(game.screen, 'sound');
  const shown = screenLayout(game);
  for (const label of ['LJUD', 'MUSIK', 'EFFEKTER', 'TILLBAKA', '8', '10']) assert.ok(texts(shown).includes(label), label);
  const images = shown.elements.filter((element) => element.kind === 'image').map((element) => element.image);
  assert.deepEqual(images, ['volume8', 'volume10']);
  assertInView(shown.elements);
});

test('while sound is off, a struck-through loudspeaker shows in the corner of every screen', () => {
  const game = createGame(level);
  const icon = (layout) => layout.elements.filter((element) => element.image === 'speakerOff');
  assert.deepEqual(icon(screenLayout(game)), []);
  game.settings = { ...game.settings, muted: true };
  assert.equal(icon(screenLayout(game)).length, 1);
  assertInView(screenLayout(game).elements);
  game.screen = 'playing';
  assert.equal(icon(screenLayout(game)).length, 1, 'the play too');
});

test('the pause menu dims the world and shows its choices', () => {
  const game = createGame(level);
  const input = createInput();
  queueKey(input, 'Enter', true);
  beginStep(input);
  stepGame(game, input, 1 / 60);
  assert.deepEqual(screenLayout(game), { shade: false, hud: true, elements: [] });
  pauseGame(game);
  const shown = screenLayout(game);
  assert.equal(shown.shade, true);
  for (const label of ['FORTSÄTT', 'LJUD', 'AVSLUTA']) assert.ok(texts(shown).includes(label), label);
  assertInView(shown.elements);
});

test('the marked choice stands between arrows, and one that cannot be taken is grey', () => {
  const menu = createMenu([{ id: 'a', label: 'ETT' }, { id: 'b', label: 'TVÅ', enabled: false }]);
  const elements = menuElements(menu, 50);
  const marked = elements.filter((element) => element.y === 50).map((element) => element.text);
  assert.deepEqual(marked, ['>', 'ETT', '<']);
  assert.equal(elements.find((element) => element.text === 'TVÅ').colour, 'grey_3');
});

function overGame() {
  const game = createGame(level);
  const input = createInput();
  queueKey(input, 'Enter', true);
  beginStep(input);
  stepGame(game, input, 1 / 60);
  game.world.score.points = 1234;
  game.world.score.samples = 12;
  game.world.score.helped = 2;
  game.world.over = true;
  game.world.overTime = GAME_OVER_TIME;
  beginStep(input);
  stepGame(game, input, 1 / 60);
  assert.equal(game.screen, 'gameOver');
  return game;
}

test('the game over closes the case file: heading, rank, score and what was collected', () => {
  const game = overGame();
  const shown = screenLayout(game);
  assert.equal(shown.shade, true);
  assert.equal(shown.hud, false, 'the case file takes the HUD\'s place');
  assert.ok(shown.elements.some((element) => element.image === 'gameOver'));
  assert.ok(texts(shown).includes('UTREDNINGEN LÄGGS NER.'));
  assert.ok(texts(shown).includes('POLISASSISTENT'), 'twelve samples make an assistant');
  assert.ok(texts(shown).includes('0001234'));
  assert.ok(texts(shown).includes('SKÄRM'), 'where he was last seen');
  assert.deepEqual(caseFileRows(game.world).find(([label]) => label.startsWith('HJÄLPTA'))[1], '2');
  assertInView(shown.elements);
});

test('the game over\'s prompt waits until a key is taken, then blinks', () => {
  const game = overGame();
  assert.ok(!texts(screenLayout(game)).includes('TRYCK ENTER'));
  game.screenTime = GAME_OVER_LOCK + BLINK_PERIOD;
  assert.ok(texts(screenLayout(game)).includes('TRYCK ENTER'));
  game.screenTime = GAME_OVER_LOCK + BLINK_PERIOD * 1.75;
  assert.ok(!texts(screenLayout(game)).includes('TRYCK ENTER'));
});

function stepOnce(game, input, code = null) {
  if (code) {
    queueKey(input, code, true);
    queueKey(input, code, false);
  }
  beginStep(input);
  stepGame(game, input, 1 / 60);
}

function reportGame() {
  const game = createGame({ ...level, rows: ['......', '.@...u', '######'], title: 'Värld 9-9: Skärmen', time: 100 });
  const input = createInput();
  stepOnce(game, input, 'Enter');
  game.world.tally.sample = 1;
  game.world.timeLeft = 40;
  game.world.complete = true;
  game.world.completeTime = COMPLETE_TIME;
  stepOnce(game, input);
  assert.equal(game.screen, 'levelComplete');
  return { game, input };
}

test('a level\'s report: found of total, the bonus counting down, the cost, the verdict', () => {
  const { game, input } = reportGame();
  const shown = screenLayout(game);
  assert.equal(shown.hud, false);
  assert.ok(texts(shown).includes('POLISENS PRESTATIONSRAPPORT'));
  assert.ok(texts(shown).includes('VÄRLD 9-9: SKÄRMEN'));
  assert.ok(texts(shown).includes('400'), 'the whole bonus, none counted yet');
  assert.ok(texts(shown).includes('EJ MÄTBAR'), 'nothing seized');
  assert.ok(!texts(shown).includes('TRYCK ENTER'), 'not while the bonus counts');
  assertInView(shown.elements);
  while (game.screenTime < REPORT_LOCK) stepOnce(game, input);
  stepOnce(game, input, 'Enter');
  assert.ok(texts(screenLayout(game)).includes('0'), 'the bonus counted down');
  assert.ok(texts(screenLayout(game)).includes('TRYCK ENTER'));
});

test('the year\'s report adds up the game and closes it', () => {
  const { game, input } = reportGame();
  while (game.screenTime < REPORT_LOCK) stepOnce(game, input);
  stepOnce(game, input, 'Enter');
  stepOnce(game, input, 'Enter');
  assert.equal(game.screen, 'yearReport');
  const shown = screenLayout(game);
  assert.equal(shown.hud, false);
  assert.ok(texts(shown).includes('POLISENS ÅRSRAPPORT'));
  assert.ok(texts(shown).includes('BLENKE HUSIS, POLISASPIRANT'));
  assert.ok(texts(shown).includes('1 AV 1'), 'the sample found of the one there was');
  assertInView(shown.elements);
});

function overWithPoints(points) {
  const game = overGame();
  game.world.score.points = points;
  game.screenTime = GAME_OVER_LOCK;
  const input = createInput();
  stepOnce(game, input, 'Enter');
  return { game, input };
}

test('signing the report shows the score, its place and the name being typed', () => {
  const { game } = overWithPoints(12000);
  assert.equal(game.screen, 'nameEntry');
  game.entry.name = 'BLENKE';
  game.screenTime = 0;
  const shown = screenLayout(game);
  assert.equal(shown.hud, false);
  assert.ok(texts(shown).includes('NYTT REKORD!'));
  assert.ok(texts(shown).includes('0012000 POÄNG GER PLATS 6 PÅ TOPPLISTAN.'));
  const name = shown.elements.find((element) => element.text === 'BLENKE');
  const cursor = shown.elements.find((element) => element.text === '_');
  assert.ok(cursor.x > name.x, 'the cursor follows the name');
  assertInView(shown.elements);
  game.screenTime = BLINK_PERIOD * 0.3;
  assert.equal(screenLayout(game).elements.find((element) => element.text === 'BLENKE').x, name.x, 'the name stays put as the cursor blinks');
});

test('the high scores list all ten, the new entry picked out', () => {
  const { game, input } = overWithPoints(12000);
  stepOnce(game, input, 'Enter');
  assert.equal(game.screen, 'highScores');
  const shown = screenLayout(game);
  assert.ok(texts(shown).includes('TOPPLISTA'));
  for (const entry of game.highScores) assert.ok(texts(shown).includes(entry.name), entry.name);
  const picked = shown.elements.find((element) => element.text === 'BLENKE');
  assert.equal(picked.colour, 'hivis_3');
  assert.equal(shown.elements.find((element) => element.text === 'NOLLVISION').colour, 'white');
  assertInView(shown.elements);
});

test('the question whether to save is plain, and its two answers fit the view', () => {
  const game = createGame(level, { storage: fakeStorage() });
  const input = createInput();
  stepOnce(game, input, 'Enter');
  game.world.score.points = 12000;
  game.world.over = true;
  game.world.overTime = GAME_OVER_TIME;
  stepOnce(game, input);
  game.screenTime = GAME_OVER_LOCK;
  stepOnce(game, input, 'Enter');
  stepOnce(game, input, 'Enter');
  assert.equal(game.screen, 'consent');
  const shown = screenLayout(game);
  assert.ok(texts(shown).includes('FÅR TOPPLISTAN SPARAS?'));
  assert.ok(texts(shown).includes('JA, SPARA'));
  assert.ok(texts(shown).includes('NEJ TACK'));
  assertInView(shown.elements);
});
