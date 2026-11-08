import test from 'node:test';
import assert from 'node:assert/strict';
import { LINE_HEIGHT, textWidth } from '../src/art/font.js';
import { GAME_OVER_HEADING, LOGO, TAG_LETTER_ART } from '../src/art/logo.js';
import { SPEAKER_OFF, VOLUME_BARS } from '../src/art/sound.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../src/config.js';
import { createGame, GAME_OVER_LOCK, pauseGame, REPORT_LOCK, stepGame } from '../src/game.js';
import { beginStep, createInput, queueKey, queueText } from '../src/input.js';
import { createMenu } from '../src/menu.js';
import { fakeStorage } from './helpers.js';
import { BLINK_PERIOD, caseFileRows, CONTROL_ROWS, DOUBLED_LABEL, menuElements, screenLayout, tagImageName, TURN_HEIGHT, TURN_WIDTH, turnLayout } from '../src/screens.js';
import { TURN_ART } from '../src/art/touch.js';
import { COMPLETE_TIME, GAME_OVER_TIME } from '../src/world.js';

const level = { id: 'screen', name: 'Skärm', rows: ['......', '.@....', '######'] };

function sizeOf(element) {
  if (element.kind === 'image') {
    const images = { logo: LOGO, gameOver: GAME_OVER_HEADING, speakerOff: SPEAKER_OFF, turn: TURN_ART };
    VOLUME_BARS.forEach((bar, level) => { images[`volume${level}`] = bar; });
    for (const [look, letters] of Object.entries(TAG_LETTER_ART)) {
      for (const [letter, image] of Object.entries(letters)) images[tagImageName(look, letter)] = image;
    }
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

test('the urine bonus has its own line under the time bonus, and a full tank says so as it doubles', () => {
  const { game, input } = reportGame();
  game.report = { ...game.report, poured: 12, urineBonus: 240, full: true, bonus: game.report.timeBonus + 480 };
  assert.ok(texts(screenLayout(game)).includes('URINBONUS (12 PROV)'));
  assert.ok(texts(screenLayout(game)).includes('240'));
  game.bonusGiven = game.report.timeBonus + 240;
  const doubled = screenLayout(game);
  assert.ok(texts(doubled).includes(DOUBLED_LABEL));
  assert.ok(texts(doubled).includes('240'), 'the doubling counts in the same again');
  assertInView(doubled.elements);
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

test('signing the report shows the score, its place and the tag, the slot being set lit with its arrows', () => {
  const { game } = overWithPoints(12000);
  assert.equal(game.screen, 'nameEntry');
  game.entry.tag = { letters: [1, 11, 4], slot: 1 };
  for (const touch of [false, true]) {
    const shown = screenLayout(game, { touch });
    assert.equal(shown.hud, false);
    assert.ok(texts(shown).includes('NYTT REKORD!'));
    assert.ok(texts(shown).includes('0012000 POÄNG GER PLATS 6 PÅ TOPPLISTAN.'));
    const letters = shown.elements.filter((element) => element.tap?.kind === 'tag' && element.tap.step === 0);
    assert.deepEqual(letters.map((element) => element.image), [tagImageName('unlit', 'B'), tagImageName('lit', 'L'), tagImageName('unlit', 'E')]);
    assert.ok(letters[0].x < letters[1].x && letters[1].x < letters[2].x, 'side by side');
    const arrows = shown.elements.filter((element) => element.text === '↑' || element.text === '↓');
    assert.equal(arrows.length, touch ? 6 : 2, touch ? 'every letter\'s, to tap' : 'the lit letter\'s');
    assertInView(shown.elements);
  }
  assert.ok(texts(screenLayout(game, { touch: true })).includes('KLAR'));
  assert.ok(!texts(screenLayout(game)).includes('KLAR'));
  game.entry.tag = { letters: [27, 0, 28], slot: 0 };
  const marked = screenLayout(game, { touch: true }).elements;
  const [ae, a, oe] = marked.filter((element) => element.tap?.kind === 'tag' && element.tap.step === 0);
  const bottom = (element) => element.y + TAG_LETTER_ART.lit[element.image.slice(-1)].height;
  assert.equal(bottom(ae), bottom(a), 'Ä stands on the line with A');
  assert.equal(bottom(oe), bottom(a));
  const up = marked.find((element) => element.text === '↑' && element.tap.slot === 0);
  assert.ok(up.y + LINE_HEIGHT <= ae.y, 'the arrow clears the marks over Ä');
});

test('the high scores list all ten, the new entry picked out', () => {
  const { game, input } = overWithPoints(12000);
  for (const key of 'ble') queueText(input, key);
  stepOnce(game, input);
  stepOnce(game, input, 'Enter');
  assert.equal(game.screen, 'highScores');
  const shown = screenLayout(game);
  assert.ok(texts(shown).includes('TOPPLISTA'));
  for (const entry of game.highScores) assert.ok(texts(shown).includes(entry.name), entry.name);
  const picked = shown.elements.find((element) => element.text === 'BLE');
  assert.equal(picked.colour, 'hivis_3');
  assert.equal(shown.elements.find((element) => element.text === 'NOL').colour, 'white');
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
  for (let slot = 0; slot < 3; slot++) stepOnce(game, input, 'Enter');
  assert.equal(game.screen, 'consent');
  const shown = screenLayout(game);
  assert.ok(texts(shown).includes('FÅR TOPPLISTAN SPARAS?'));
  assert.ok(texts(shown).includes('JA, SPARA'));
  assert.ok(texts(shown).includes('NEJ TACK'));
  assertInView(shown.elements);
});

test('the screen asking to turn the phone fits its own small view, and says why', () => {
  const shown = turnLayout();
  assert.ok(texts(shown).includes('VÄND TELEFONEN'));
  for (const element of shown.elements) {
    const { width, height } = sizeOf(element);
    assert.ok(element.x >= 0 && element.x + width <= TURN_WIDTH, `${element.text ?? element.image} fits across`);
    assert.ok(element.y >= 0 && element.y + height <= TURN_HEIGHT, `${element.text ?? element.image} fits down`);
  }
  assert.ok(TURN_WIDTH < VIEW_WIDTH, 'bigger on an upright phone than the view would be');
});
