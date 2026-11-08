// Every sound effect held to rules like the asset factory's: it starts at
// once, never reaches full scale, ends without a click, is over quickly and
// sits in the mix with the others.
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
// The level of the loudest 50 ms, RMS in dBFS: no effect far louder or
// quieter than the rest. Unweighted, so low tones measure louder than they
// sound; a rough guard against outliers, and the ear decides the rest.
const LEVEL_WINDOW = 0.05;
const MIN_LEVEL = -22;
const MAX_LEVEL = -9;

function loudestLevel(samples) {
  const width = Math.round(LEVEL_WINDOW * SAMPLE_RATE);
  let sum = 0;
  let most = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] ** 2;
    if (i >= width) sum -= samples[i - width] ** 2;
    most = Math.max(most, sum / Math.min(i + 1, width));
  }
  return 10 * Math.log10(most);
}

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
    const level = loudestLevel(samples);
    assert.ok(level >= MIN_LEVEL && level <= MAX_LEVEL, `${level.toFixed(1)} dBFS at its loudest`);
  });
}

test('a sound sets only its voices, a channel and a minimum gap', () => {
  for (const [id, sound] of Object.entries(SOUNDS)) {
    assert.deepEqual(Object.keys(sound).filter((key) => !['voices', 'channel', 'minGap'].includes(key)), [], id);
    if ('minGap' in sound) assert.ok(sound.minGap > 0, id);
    if ('channel' in sound) assert.equal(typeof sound.channel, 'string', id);
  }
});
