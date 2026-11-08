import test from 'node:test';
import assert from 'node:assert/strict';
import { LINE_HEIGHT, textWidth } from '../src/art/font.js';
import { LOGO } from '../src/art/logo.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../src/config.js';
import { createGame, pauseGame, stepGame } from '../src/game.js';
import { beginStep, createInput, queueKey } from '../src/input.js';
import { createMenu } from '../src/menu.js';
import { BLINK_PERIOD, menuElements, screenLayout } from '../src/screens.js';

const level = { id: 'screen', name: 'Skärm', rows: ['......', '.@....', '######'] };

function sizeOf(element) {
  if (element.kind === 'image') return { width: LOGO.width, height: LOGO.height };
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

test('the title shows the logo and a prompt that blinks, over the bare backdrop', () => {
  const game = createGame(level);
  const shown = screenLayout(game);
  assert.equal(shown.shade, false);
  assert.ok(shown.elements.some((element) => element.image === 'logo'));
  assert.ok(texts(shown).includes('TRYCK ENTER'));
  assertInView(shown.elements);
  game.time = BLINK_PERIOD * 0.75;
  assert.ok(!texts(screenLayout(game)).includes('TRYCK ENTER'));
});

test('the pause menu dims the world and shows its choices', () => {
  const game = createGame(level);
  const input = createInput();
  queueKey(input, 'Enter', true);
  beginStep(input);
  stepGame(game, input, 1 / 60);
  assert.deepEqual(screenLayout(game), { shade: false, elements: [] });
  pauseGame(game);
  const shown = screenLayout(game);
  assert.equal(shown.shade, true);
  assert.ok(texts(shown).includes('FORTSÄTT'));
  assert.ok(texts(shown).includes('AVSLUTA'));
  assertInView(shown.elements);
});

test('the marked choice stands between arrows, and one that cannot be taken is grey', () => {
  const menu = createMenu([{ id: 'a', label: 'ETT' }, { id: 'b', label: 'TVÅ', enabled: false }]);
  const elements = menuElements(menu, 50);
  const marked = elements.filter((element) => element.y === 50).map((element) => element.text);
  assert.deepEqual(marked, ['>', 'ETT', '<']);
  assert.equal(elements.find((element) => element.text === 'TVÅ').colour, 'grey_3');
});
