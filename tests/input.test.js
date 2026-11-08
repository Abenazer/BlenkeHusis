import test from 'node:test';
import assert from 'node:assert/strict';
import { textWidth } from '../src/art/font.js';
import { beginStep, createInput, isHeld, KEY_ACTIONS, keyName, keyNamesFor, queueKey, queueText, releaseAll, wasPressed } from '../src/input.js';

test('a key maps to its action, and an unknown key is ignored', () => {
  const input = createInput();
  assert.equal(queueKey(input, 'Space', true), true);
  assert.equal(queueKey(input, 'KeyQ', true), false);
  beginStep(input);
  assert.equal(isHeld(input, 'jump'), true);
  assert.equal(wasPressed(input, 'jump'), true);
});

test('pressed lasts one step, held lasts until the key is let go', () => {
  const input = createInput();
  queueKey(input, 'ArrowLeft', true);
  beginStep(input);
  beginStep(input);
  assert.equal(wasPressed(input, 'left'), false);
  assert.equal(isHeld(input, 'left'), true);
  queueKey(input, 'ArrowLeft', false);
  beginStep(input);
  assert.equal(isHeld(input, 'left'), false);
});

test('a key pressed and let go between two steps still counts as pressed', () => {
  const input = createInput();
  queueKey(input, 'Space', true);
  queueKey(input, 'Space', false);
  beginStep(input);
  assert.equal(wasPressed(input, 'jump'), true);
  assert.equal(isHeld(input, 'jump'), false);
});

test('two keys for one action: letting go of one keeps it held', () => {
  const input = createInput();
  queueKey(input, 'ArrowLeft', true);
  queueKey(input, 'KeyA', true);
  queueKey(input, 'ArrowLeft', false);
  beginStep(input);
  assert.equal(isHeld(input, 'left'), true);
});

test('key repeat does not press again', () => {
  const input = createInput();
  queueKey(input, 'Space', true);
  beginStep(input);
  queueKey(input, 'Space', true);
  beginStep(input);
  assert.equal(wasPressed(input, 'jump'), false);
});

test('losing focus lets go of every key', () => {
  const input = createInput();
  queueKey(input, 'ArrowRight', true);
  queueKey(input, 'ShiftLeft', true);
  beginStep(input);
  releaseAll(input);
  beginStep(input);
  assert.equal(isHeld(input, 'right'), false);
  assert.equal(isHeld(input, 'run'), false);
});

test('losing focus lets go of a key pressed since the last step, after it counts as pressed', () => {
  const input = createInput();
  queueKey(input, 'ArrowRight', true);
  releaseAll(input);
  beginStep(input);
  assert.equal(wasPressed(input, 'right'), true);
  assert.equal(isHeld(input, 'right'), false);
  beginStep(input);
  assert.equal(isHeld(input, 'right'), false);
});

test('a key can mean several actions, each pressed and held with it', () => {
  const input = createInput();
  queueKey(input, 'ArrowUp', true);
  beginStep(input);
  assert.equal(wasPressed(input, 'jump'), true);
  assert.equal(wasPressed(input, 'up'), true);
  queueKey(input, 'ArrowUp', false);
  beginStep(input);
  assert.equal(isHeld(input, 'jump'), false);
  assert.equal(isHeld(input, 'up'), false);
});

test('letting go of one key keeps an action another key still holds', () => {
  const input = createInput();
  queueKey(input, 'Space', true);
  queueKey(input, 'ArrowUp', true);
  queueKey(input, 'Space', false);
  beginStep(input);
  assert.equal(isHeld(input, 'jump'), true);
  assert.equal(isHeld(input, 'confirm'), false);
});

test('every key in the map means at least one action', () => {
  for (const [code, actions] of Object.entries(KEY_ACTIONS)) {
    assert.ok(actions.length > 0, code);
  }
});

test('every key has a name the font can draw', () => {
  for (const code of Object.keys(KEY_ACTIONS)) assert.ok(textWidth(keyName(code)) > 0, code);
  assert.equal(keyName('KeyC'), 'C');
  assert.throws(() => keyName('F13'), /no name/);
});

test('the keys for an action are named once each, in the map\'s order', () => {
  assert.deepEqual(keyNamesFor(['run']), ['SHIFT', 'X']);
  assert.deepEqual(keyNamesFor(['left', 'right']), ['←', 'A', '→', 'D']);
});

test('typed characters and Backspace last one step; other named keys are not text', () => {
  const input = createInput();
  assert.equal(queueText(input, 'å'), true);
  assert.equal(queueText(input, ' '), true);
  assert.equal(queueText(input, 'Backspace'), true);
  assert.equal(queueText(input, 'Shift'), false);
  beginStep(input);
  assert.deepEqual(input.typed, ['å', ' ', 'Backspace']);
  beginStep(input);
  assert.deepEqual(input.typed, []);
});
