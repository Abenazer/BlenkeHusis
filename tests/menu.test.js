import test from 'node:test';
import assert from 'node:assert/strict';
import { beginStep, createInput, queueKey } from '../src/input.js';
import { createMenu, updateMenu } from '../src/menu.js';

function tap(input, code) {
  queueKey(input, code, true);
  queueKey(input, code, false);
  beginStep(input);
}

const ITEMS = [
  { id: 'start', label: 'STARTA' },
  { id: 'list', label: 'TOPPLISTA', enabled: false },
  { id: 'controls', label: 'KONTROLLER' },
];

test('down and up move the mark round, past what cannot be taken', () => {
  const menu = createMenu(ITEMS);
  const input = createInput();
  assert.equal(menu.index, 0);
  tap(input, 'ArrowDown');
  updateMenu(menu, input);
  assert.equal(menu.items[menu.index].id, 'controls');
  tap(input, 'ArrowDown');
  updateMenu(menu, input);
  assert.equal(menu.items[menu.index].id, 'start');
  tap(input, 'ArrowUp');
  updateMenu(menu, input);
  assert.equal(menu.items[menu.index].id, 'controls');
});

test('confirm takes the marked choice; otherwise nothing is taken', () => {
  const menu = createMenu(ITEMS);
  const input = createInput();
  beginStep(input);
  assert.equal(updateMenu(menu, input), null);
  tap(input, 'Enter');
  assert.equal(updateMenu(menu, input), 'start');
});

test('a moved mark and a choice taken are told as events', () => {
  const menu = createMenu(ITEMS);
  const input = createInput();
  const events = [];
  beginStep(input);
  updateMenu(menu, input, events);
  assert.deepEqual(events, []);
  tap(input, 'ArrowDown');
  updateMenu(menu, input, events);
  tap(input, 'Enter');
  updateMenu(menu, input, events);
  assert.deepEqual(events, [{ type: 'menuMoved' }, { type: 'menuChosen', choice: 'controls' }]);
});

test('a mark with nowhere to go does not move', () => {
  const menu = createMenu([{ id: 'only', label: 'ENDA' }, { id: 'off', label: 'AV', enabled: false }]);
  const input = createInput();
  const events = [];
  tap(input, 'ArrowDown');
  updateMenu(menu, input, events);
  assert.deepEqual(events, []);
});

test('the mark starts on the first choice that can be taken', () => {
  assert.equal(createMenu([{ id: 'a', label: 'A', enabled: false }, { id: 'b', label: 'B' }]).index, 1);
  assert.throws(() => createMenu([{ id: 'a', label: 'A', enabled: false }]), /at least one/);
});
