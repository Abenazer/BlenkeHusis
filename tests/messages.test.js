import test from 'node:test';
import assert from 'node:assert/strict';
import { textWidth } from '../src/art/font.js';
import { JUNIOR_LINES, PLEAS } from '../src/citizens.js';
import { VIEW_WIDTH } from '../src/config.js';
import { ITEMS } from '../src/items.js';
import { LEVELS } from '../src/levels/index.js';
import { POWER_UPS } from '../src/powerups.js';
import { createMessages, MAX_WAITING, MESSAGE_TIME, MIN_MESSAGE_TIME, showMessage, updateMessages } from '../src/messages.js';
import { RANKS } from '../src/score.js';
import { DEFEAT_LINE, GAME_OVER_LINE, HELP_LINE, LOSS_LINES, QUIET_LINE, TEST_LINE } from '../src/world.js';

test('a message shows for its time, then goes', () => {
  const messages = createMessages();
  showMessage(messages, 'A');
  updateMessages(messages, MESSAGE_TIME - 0.1);
  assert.equal(messages.current.text, 'A');
  updateMessages(messages, 0.1);
  assert.equal(messages.current, null);
});

test('a waiting message cuts the current one short, but not too short', () => {
  const messages = createMessages();
  showMessage(messages, 'A');
  showMessage(messages, 'B');
  updateMessages(messages, MIN_MESSAGE_TIME - 0.1);
  assert.equal(messages.current.text, 'A');
  updateMessages(messages, 0.1);
  assert.equal(messages.current.text, 'B');
});

test('when too many wait, the oldest waiting one is dropped', () => {
  const messages = createMessages();
  for (const text of ['A', 'B', 'C', 'D']) showMessage(messages, text);
  assert.equal(messages.waiting.length, MAX_WAITING);
  assert.deepEqual(messages.waiting.map((message) => message.text), ['C', 'D']);
});

test('every line the game says fits the view, in the font', () => {
  const lines = [
    ...Object.values(ITEMS).flatMap((item) => item.messages),
    ...RANKS.map((rank) => `BEFORDRAD TILL ${rank.title.toUpperCase()}!`),
    'DU HAR SAMLAT 9999 PROV. UTMÄRKT ARBETE, BLENKE!',
    QUIET_LINE,
    DEFEAT_LINE,
    GAME_OVER_LINE,
    HELP_LINE,
    TEST_LINE,
    ...Object.values(LOSS_LINES),
    ...Object.values(POWER_UPS).map((powerUp) => powerUp.ends),
    ...[...PLEAS, ...JUNIOR_LINES].flatMap(({ plea, thanks }) => [plea, thanks]),
    ...LEVELS.flatMap((level) => level.signs ?? []),
    ...LEVELS.map((level) => level.title),
  ];
  for (const line of lines) assert.ok(textWidth(line) <= VIEW_WIDTH - 16, `too wide: ${line}`);
});
