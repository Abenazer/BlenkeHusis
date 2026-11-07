import test from 'node:test';
import assert from 'node:assert/strict';
import { beginStep, createInput, isHeld, queueKey, releaseAll, wasPressed } from '../src/input.js';

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
