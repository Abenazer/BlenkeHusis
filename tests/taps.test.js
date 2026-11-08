import test from 'node:test';
import assert from 'node:assert/strict';
import { LINE_HEIGHT, textWidth } from '../src/art/font.js';
import { VOLUME_BARS } from '../src/art/sound.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../src/config.js';
import { createGame, GAME_OVER_LOCK, pauseGame, stepGame } from '../src/game.js';
import { beginStep, createInput, queueKey, queueTap, tapOf, wasPressed } from '../src/input.js';
import { createMenu, updateMenu } from '../src/menu.js';
import { CONTROL_ROWS, screenLayout, tapAt, TOUCH_PROMPT } from '../src/screens.js';
import { VOLUME_STEPS } from '../src/settings.js';
import { GAME_OVER_TIME } from '../src/world.js';

const level = { id: 'taps', name: 'Tryck', rows: ['......', '.@....', '######'] };

function texts(layout) {
  return layout.elements.filter((element) => element.kind === 'text').map((element) => element.text);
}

// The middle of what is drawn: a line of text, or a tappable picture's box.
function middleOf(element) {
  if (element.kind === 'image') return { x: element.hit.x + element.hit.width / 2, y: element.hit.y + element.hit.height / 2 };
  return { x: element.x + textWidth(element.text) / 2, y: element.y + LINE_HEIGHT / 2 };
}

function find(layout, text) {
  const element = layout.elements.find((candidate) => candidate.text === text);
  assert.ok(element, `no ${text} on the screen`);
  return element;
}

// Taps the view at x, y the way the page does: asks the layout what it hit
// and hands that to the next step.
function tap(game, input, x, y, touch = true) {
  const target = tapAt(screenLayout(game, { touch }), x, y);
  if (target) queueTap(input, target);
  beginStep(input);
  return stepGame(game, input, 1 / 60);
}

function tapText(game, input, text) {
  const { x, y } = middleOf(find(screenLayout(game, { touch: true }), text));
  return tap(game, input, x, y);
}

function press(game, input, code) {
  queueKey(input, code, true);
  queueKey(input, code, false);
  beginStep(input);
  stepGame(game, input, 1 / 60);
}

function wait(game, input, seconds) {
  for (let t = 0; t < seconds; t += 1 / 60) {
    beginStep(input);
    stepGame(game, input, 1 / 60);
  }
}

test('a tap that presses presses for one step, as a key would', () => {
  const input = createInput();
  queueTap(input, { kind: 'press', action: 'confirm' });
  beginStep(input);
  assert.equal(wasPressed(input, 'confirm'), true);
  beginStep(input);
  assert.equal(wasPressed(input, 'confirm'), false);
});

test('a tap of another kind is there for its screen to read, for one step', () => {
  const input = createInput();
  queueTap(input, { kind: 'menu', index: 2 });
  assert.equal(tapOf(input, 'menu'), null, 'not before the step');
  beginStep(input);
  assert.deepEqual(tapOf(input, 'menu'), { kind: 'menu', index: 2 });
  assert.equal(tapOf(input, 'volume'), null);
  beginStep(input);
  assert.equal(tapOf(input, 'menu'), null);
});

test('a tapped menu choice is marked and taken at once, but not one that cannot be taken', () => {
  const menu = createMenu([{ id: 'a', label: 'ETT' }, { id: 'b', label: 'TVÅ', enabled: false }, { id: 'c', label: 'TRE' }]);
  const input = createInput();
  queueTap(input, { kind: 'menu', index: 2 });
  beginStep(input);
  const events = [];
  assert.equal(updateMenu(menu, input, events), 'c');
  assert.equal(menu.index, 2);
  assert.deepEqual(events, [{ type: 'menuChosen', choice: 'c' }]);
  queueTap(input, { kind: 'menu', index: 1 });
  beginStep(input);
  assert.equal(updateMenu(menu, input), null);
  assert.equal(menu.index, 2);
});

test('the title\'s rows take taps across their whole height, each its own, without gaps', () => {
  const game = createGame(level);
  const layout = screenLayout(game, { touch: true });
  const rows = layout.elements.filter((element) => element.tap?.kind === 'menu');
  assert.equal(rows.length, 4);
  for (let i = 1; i < rows.length; i++) assert.equal(rows[i].hit.y, rows[i - 1].hit.y + rows[i - 1].hit.height);
  for (const [i, row] of rows.entries()) {
    assert.deepEqual(tapAt(layout, VIEW_WIDTH / 2, row.hit.y), { kind: 'menu', index: i });
    assert.deepEqual(tapAt(layout, VIEW_WIDTH / 2, row.hit.y + row.hit.height - 1), { kind: 'menu', index: i });
    assert.ok(row.hit.y + row.hit.height <= VIEW_HEIGHT);
  }
  assert.equal(tapAt(layout, VIEW_WIDTH / 2, 10), null, 'the logo takes no tap');
});

test('tapping STARTA starts the game, and the pause menu\'s rows are tapped too', () => {
  const game = createGame(level);
  const input = createInput();
  tapText(game, input, 'STARTA');
  assert.equal(game.screen, 'playing');
  pauseGame(game);
  tapText(game, input, 'FORTSÄTT');
  assert.equal(game.screen, 'playing');
  pauseGame(game);
  tapText(game, input, 'AVSLUTA');
  assert.equal(game.screen, 'title');
});

test('a screen that waits for Enter goes on at a tap anywhere, and says so when played by touch', () => {
  const game = createGame(level);
  const input = createInput();
  tapText(game, input, 'KONTROLLER');
  assert.equal(game.screen, 'controls');
  tap(game, input, 3, 3);
  assert.equal(game.screen, 'title');
  tapText(game, input, 'TOPPLISTA');
  assert.equal(game.screen, 'highScores');
  assert.ok(texts(screenLayout(game, { touch: true })).includes(`TILLBAKA: ${TOUCH_PROMPT}`));
  assert.ok(texts(screenLayout(game)).includes('TILLBAKA: ENTER'));
  tap(game, input, VIEW_WIDTH - 1, VIEW_HEIGHT - 1);
  assert.equal(game.screen, 'title');
});

test('the game over takes a tap only once it takes a key, and then prompts for a tap', () => {
  const game = createGame(level);
  const input = createInput();
  press(game, input, 'Enter');
  game.world.over = true;
  game.world.overTime = GAME_OVER_TIME;
  wait(game, input, 1 / 60);
  assert.equal(game.screen, 'gameOver');
  tap(game, input, 100, 100);
  assert.equal(game.screen, 'gameOver', 'too early');
  wait(game, input, GAME_OVER_LOCK);
  assert.ok(texts(screenLayout(game, { touch: true })).includes(TOUCH_PROMPT));
  assert.ok(!texts(screenLayout(game, { touch: true })).includes('TRYCK ENTER'));
  tap(game, input, 100, 100);
  assert.notEqual(game.screen, 'gameOver');
});

test('played by touch, the controls screen tells the touch controls, inside the view', () => {
  const game = createGame(level);
  const input = createInput();
  tapText(game, input, 'KONTROLLER');
  const shown = screenLayout(game, { touch: true });
  for (const row of CONTROL_ROWS) assert.ok(texts(shown).includes(row.touch), row.touch);
  assert.ok(!texts(shown).includes('SHIFT  X'));
  for (const element of shown.elements) {
    assert.ok(element.x >= 0 && element.x + textWidth(element.text) <= VIEW_WIDTH, `${element.text} fits across`);
  }
});

function soundScreen() {
  const game = createGame(level);
  const input = createInput();
  tapText(game, input, 'LJUD');
  assert.equal(game.screen, 'sound');
  return { game, input };
}

function bar(game, volume) {
  return screenLayout(game, { touch: true }).elements.find((element) => element.tap?.kind === 'volume' && element.tap.volume === volume);
}

test('a tapped step of a volume\'s bar sets it there and marks its row; left of the bar is silence', () => {
  const { game, input } = soundScreen();
  const effects = bar(game, 'effects');
  const events = tap(game, input, effects.x + 1 + 2 * 5 + 2, effects.y + 3);
  assert.equal(game.settings.effects, 3);
  assert.equal(game.soundMenu.items[game.soundMenu.index].id, 'effects');
  assert.deepEqual(events.filter((event) => event.type === 'volumeChanged'), [{ type: 'volumeChanged', volume: 'effects', step: 3 }]);
  const music = bar(game, 'music');
  tap(game, input, music.x - 2, music.y + 3);
  assert.equal(game.settings.music, 0);
  tap(game, input, music.x + VOLUME_BARS[0].width + 10, music.y + 3);
  assert.equal(game.settings.music, VOLUME_STEPS);
  assert.equal(game.settings.effects, 3, 'the other volume left as it was');
});

test('the sound screen\'s way back is tapped, and played by touch a line turns the sound off and on', () => {
  const { game, input } = soundScreen();
  tapText(game, input, 'STÄNG AV ALLT LJUD: TRYCK HÄR');
  assert.equal(game.settings.muted, true);
  tapText(game, input, 'LJUDET ÄR AVSTÄNGT. TRYCK HÄR FÖR ATT SÄTTA PÅ.');
  assert.equal(game.settings.muted, false);
  assert.ok(!texts(screenLayout(game)).includes('STÄNG AV ALLT LJUD: TRYCK HÄR'), 'with keys, M does it');
  tapText(game, input, 'TILLBAKA');
  assert.equal(game.screen, 'title');
});

test('a tap where nothing is takes nothing on a screen with a menu', () => {
  const game = createGame(level);
  const input = createInput();
  tap(game, input, 3, 3);
  assert.equal(game.screen, 'title');
});

test('signing by touch: each letter and its arrows take taps in their own boxes, and KLAR signs', () => {
  const game = createGame(level);
  const input = createInput();
  press(game, input, 'Enter');
  game.world.score.points = 12000;
  game.world.over = true;
  game.world.overTime = GAME_OVER_TIME;
  wait(game, input, GAME_OVER_LOCK + 1 / 30);
  press(game, input, 'Enter');
  assert.equal(game.screen, 'nameEntry');
  const layout = screenLayout(game, { touch: true });
  const tappable = layout.elements.filter((element) => element.tap?.kind === 'tag');
  assert.equal(tappable.length, 9);
  for (const element of tappable) {
    const { x, y } = middleOf(element);
    assert.deepEqual(tapAt(layout, x, y), element.tap, `${element.text ?? element.image} in slot ${element.tap.slot}`);
  }
  for (let i = 0; i < tappable.length; i++) {
    for (let j = i + 1; j < tappable.length; j++) {
      const [a, b] = [tappable[i].hit, tappable[j].hit];
      const apart = a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y;
      assert.ok(apart, `boxes ${i} and ${j} overlap`);
    }
  }
  const up = tappable.find((element) => element.text === '↑' && element.tap.slot === 2);
  tap(game, input, middleOf(up).x, middleOf(up).y);
  tapText(game, input, 'KLAR');
  assert.equal(game.screen, 'highScores');
  assert.equal(game.highScores[game.highlight].name, 'AAB');
});
