// Every sound effect held to rules like the asset factory's: it starts at
// once, never reaches full scale, ends without a click and is over quickly.
// The factory wants the last 5 ms of a recording silent; a synthesized
// release fades to exactly zero, so here the last sample must be silence
// and the last millisecond already faded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SOUNDS } from '../src/sounds.js';
import { renderSound, SAMPLE_RATE, soundLength } from '../src/synth.js';

// Under this a sample is silence (-60 dBFS).
const SILENCE = 0.001;
// Room under full scale for a few sounds at once.
const MAX_PEAK = 0.8;
const MIN_PEAK = 0.1;
const MAX_ONSET = 0.005;
const TAIL = 0.001;
const MAX_TAIL = 0.05;
const MAX_LENGTH = 1;

for (const [id, sound] of Object.entries(SOUNDS)) {
  test(`the sound '${id}' starts at once, fits under full scale and ends in silence`, () => {
    const samples = renderSound(sound);
    let peak = 0;
    let onset = -1;
    samples.forEach((sample, i) => {
      peak = Math.max(peak, Math.abs(sample));
      if (onset < 0 && Math.abs(sample) > SILENCE) onset = i;
    });
    assert.ok(peak <= MAX_PEAK, `peak ${peak.toFixed(3)}`);
    assert.ok(peak >= MIN_PEAK, `peak ${peak.toFixed(3)}: too quiet to hear`);
    assert.ok(onset / SAMPLE_RATE <= MAX_ONSET, `starts after ${(onset / SAMPLE_RATE).toFixed(4)} s`);
    assert.ok(Math.abs(samples.at(-1)) <= SILENCE, 'the last sample is silence');
    const tail = samples.subarray(samples.length - Math.round(TAIL * SAMPLE_RATE));
    assert.ok(tail.every((sample) => Math.abs(sample) <= MAX_TAIL), 'faded by the last millisecond');
    assert.ok(soundLength(sound) <= MAX_LENGTH, `${soundLength(sound)} s long`);
  });
}

test('a sound sets only its voices, a channel and a minimum gap', () => {
  for (const [id, sound] of Object.entries(SOUNDS)) {
    assert.deepEqual(Object.keys(sound).filter((key) => !['voices', 'channel', 'minGap'].includes(key)), [], id);
    if ('minGap' in sound) assert.ok(sound.minGap > 0, id);
    if ('channel' in sound) assert.equal(typeof sound.channel, 'string', id);
  }
});
