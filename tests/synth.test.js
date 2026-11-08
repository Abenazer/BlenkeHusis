import { test } from 'node:test';
import assert from 'node:assert/strict';
import { noteFrequency, renderSound, SAMPLE_RATE, soundLength } from '../src/synth.js';

const RATE = 8000;

function peak(samples, from = 0, to = samples.length) {
  let most = 0;
  for (let i = from; i < to; i++) most = Math.max(most, Math.abs(samples[i]));
  return most;
}

// Upward zero crossings per second over a stretch, for a tone's pitch.
function pitch(samples, from, to, rate = RATE) {
  let crossings = 0;
  for (let i = from + 1; i < to; i++) if (samples[i - 1] < 0 && samples[i] >= 0) crossings += 1;
  return crossings / ((to - from) / rate);
}

test('notes are tuned to A4 at 440 Hz, with sharps, flats and octaves', () => {
  assert.equal(noteFrequency('A4'), 440);
  assert.equal(noteFrequency('A5'), 880);
  assert.ok(Math.abs(noteFrequency('C4') - 261.63) < 0.01);
  assert.equal(noteFrequency('F#4'), noteFrequency('Gb4'));
  assert.throws(() => noteFrequency('H2'), /Not a note/);
});

test('a sound lasts until its last voice ends', () => {
  const sound = { voices: [
    { wave: 'pulse', freq: 440, length: 0.1 },
    { wave: 'triangle', freq: 220, at: 0.05, length: 0.2 },
  ] };
  assert.ok(Math.abs(soundLength(sound) - 0.25) < 1e-9);
  assert.equal(renderSound(sound, RATE).length, Math.ceil(0.25 * RATE));
  assert.equal(SAMPLE_RATE, 44100);
});

test('a pulse plays at its frequency and gain, and a voice starts at its time', () => {
  const samples = renderSound({ voices: [{ wave: 'pulse', freq: 200, at: 0.1, length: 0.5, gain: 0.25 }] }, RATE);
  assert.equal(peak(samples, 0, 0.1 * RATE), 0, 'silent before it starts');
  assert.ok(Math.abs(pitch(samples, 0.15 * RATE, 0.55 * RATE) - 200) <= 5);
  assert.ok(Math.abs(peak(samples, 0.2 * RATE, 0.5 * RATE) - 0.25) < 1e-6);
});

test('a narrow pulse is centred on zero', () => {
  const samples = renderSound({ voices: [{ wave: 'pulse', duty: 0.125, freq: 100, length: 1, gain: 0.2, attack: 0, release: 0 }] }, RATE);
  const mean = samples.reduce((sum, sample) => sum + sample, 0) / samples.length;
  assert.ok(Math.abs(mean) < 0.01, `mean ${mean}`);
});

test('a voice slides to its target pitch and holds it', () => {
  const samples = renderSound({ voices: [{ wave: 'triangle', freq: 100, to: 400, slide: 0.5, length: 1.5 }] }, RATE);
  assert.ok(pitch(samples, 0, 0.2 * RATE) < 200);
  assert.ok(Math.abs(pitch(samples, 0.6 * RATE, 1.4 * RATE) - 400) <= 5);
});

test('an arpeggio steps through its notes', () => {
  const samples = renderSound({ voices: [{ wave: 'pulse', freq: 200, arp: [0, 12], arpRate: 0.5, length: 1 }] }, RATE);
  assert.ok(Math.abs(pitch(samples, 0.05 * RATE, 0.45 * RATE) - 200) <= 5);
  assert.ok(Math.abs(pitch(samples, 0.55 * RATE, 0.95 * RATE) - 400) <= 8);
});

test('the envelope rises, decays to its sustain and releases to silence', () => {
  const samples = renderSound({ voices: [
    { wave: 'pulse', freq: 100, length: 1, gain: 0.5, attack: 0.01, decay: 0.05, sustain: 0.2, release: 0.1 },
  ] }, RATE);
  assert.ok(peak(samples, 0, 0.005 * RATE) < 0.3, 'still rising');
  assert.ok(Math.abs(peak(samples, 0.5 * RATE, 0.8 * RATE) - 0.1) < 0.005, 'held at the sustain');
  assert.ok(peak(samples, samples.length - 8) < 0.01, 'silent at the end');
});

test('noise is the same every time, and spreads across levels', () => {
  const sound = { voices: [{ wave: 'noise', freq: 4000, length: 0.2 }] };
  assert.deepEqual(renderSound(sound, RATE), renderSound(sound, RATE));
  const samples = renderSound(sound, RATE);
  const highs = samples.filter((sample) => sample > 0).length;
  assert.ok(highs > samples.length * 0.3 && highs < samples.length * 0.7);
});

test('a broken voice fails loudly', () => {
  assert.throws(() => renderSound({ voices: [] }), /at least one voice/);
  assert.throws(() => renderSound({ voices: [{ wave: 'sine', freq: 440, length: 1 }] }), /Unknown wave/);
  assert.throws(() => renderSound({ voices: [{ wave: 'pulse', freq: 440 }] }), /length/);
  assert.throws(() => renderSound({ voices: [{ wave: 'pulse', length: 1 }] }), /frequency/);
});
