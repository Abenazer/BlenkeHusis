import test from 'node:test';
import assert from 'node:assert/strict';
import { adjustVolume, DEFAULT_SETTINGS, isSettings, toggleMuted, volumeFactor, VOLUME_STEPS } from '../src/settings.js';

test('the game starts at full volume, sound on', () => {
  assert.deepEqual(DEFAULT_SETTINGS, { music: VOLUME_STEPS, effects: VOLUME_STEPS, muted: false });
  assert.ok(isSettings(DEFAULT_SETTINGS));
});

test('a volume moves a step at a time and stays within its steps', () => {
  const quieter = adjustVolume(DEFAULT_SETTINGS, 'music', -1);
  assert.equal(quieter.music, VOLUME_STEPS - 1);
  assert.equal(quieter.effects, VOLUME_STEPS, 'the other is left alone');
  assert.equal(adjustVolume(DEFAULT_SETTINGS, 'effects', 1).effects, VOLUME_STEPS);
  assert.equal(adjustVolume({ ...DEFAULT_SETTINGS, effects: 0 }, 'effects', -1).effects, 0);
  assert.throws(() => adjustVolume(DEFAULT_SETTINGS, 'bass', 1), /No volume 'bass'/);
  assert.notEqual(adjustVolume(DEFAULT_SETTINGS, 'music', 0), DEFAULT_SETTINGS, 'a new object every time');
});

test('a step\'s gain is squared: silent at 0, full at the top, each step a similar change', () => {
  assert.equal(volumeFactor(0), 0);
  assert.equal(volumeFactor(VOLUME_STEPS), 1);
  assert.ok(volumeFactor(VOLUME_STEPS / 2) < 0.5);
});

test('muting flips back and forth', () => {
  assert.equal(toggleMuted(DEFAULT_SETTINGS).muted, true);
  assert.equal(toggleMuted(toggleMuted(DEFAULT_SETTINGS)).muted, false);
});
