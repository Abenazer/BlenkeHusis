// The rules every sound effect and song is held to, like the asset
// factory's for its own sounds, as checks that report what they measured.
// The tests assert them and the listening page (tools/ljud.html) shows
// them, so both judge alike. Pure: samples in, checks out.
//
// The factory wants the last 5 ms of a recording silent; a synthesized
// release fades to exactly zero, so here the last sample must be silence
// and the last millisecond already faded.

// Under this a sample is silence (-60 dBFS).
export const SILENCE = 0.001;
// Room under full scale for a few sounds at once.
export const MAX_PEAK = 0.8;
export const MIN_PEAK = 0.1;
export const MIN_SONG_PEAK = 0.2;
export const MAX_ONSET = 0.005;
const TAIL = 0.001;
const MAX_TAIL = 0.05;
export const MAX_LENGTH = 1;
// The level of the loudest 50 ms, RMS in dBFS: no effect far louder or
// quieter than the rest. Unweighted, so low tones measure louder than they
// sound; a rough guard against outliers, and the ear decides the rest.
const LEVEL_WINDOW = 0.05;
export const MIN_LEVEL = -22;
export const MAX_LEVEL = -9;
// Where a loop wraps, the step from its last sample to its first may be
// this much bigger than the biggest step within 10 ms either side.
const SEAM_WINDOW = 0.01;
const MAX_SEAM = 1.5;

export function decibels(level) {
  return 20 * Math.log10(Math.max(level, 1e-9));
}

export function peakOf(samples) {
  let peak = 0;
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
  return peak;
}

function onsetOf(samples, rate) {
  const index = samples.findIndex((sample) => Math.abs(sample) > SILENCE);
  return index < 0 ? Infinity : index / rate;
}

// The RMS level of the loudest LEVEL_WINDOW, in dBFS.
export function loudestLevel(samples, rate) {
  const width = Math.round(LEVEL_WINDOW * rate);
  let sum = 0;
  let most = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] ** 2;
    if (i >= width) sum -= samples[i - width] ** 2;
    most = Math.max(most, sum / Math.min(i + 1, width));
  }
  return 10 * Math.log10(Math.max(most, 1e-18));
}

function check(name, pass, detail) {
  return { name, pass, detail };
}

function endsInSilence(samples, rate) {
  const last = Math.abs(samples.at(-1));
  const tail = peakOf(samples.subarray(samples.length - Math.round(TAIL * rate)));
  return check('tail', last <= SILENCE && tail <= MAX_TAIL, `last sample ${decibels(last).toFixed(0)} dBFS, last 1 ms at most ${decibels(tail).toFixed(0)} dBFS`);
}

// An effect: [{ name, pass, detail }].
export function checkEffect(samples, rate) {
  const peak = peakOf(samples);
  const onset = onsetOf(samples, rate);
  const length = samples.length / rate;
  const level = loudestLevel(samples, rate);
  return [
    check('peak', peak <= MAX_PEAK && peak >= MIN_PEAK,
      `${decibels(peak).toFixed(1)} dBFS, between ${decibels(MIN_PEAK).toFixed(1)} and ${decibels(MAX_PEAK).toFixed(1)}`),
    check('onset', onset <= MAX_ONSET, `starts at ${(onset * 1000).toFixed(1)} ms, limit ${MAX_ONSET * 1000} ms`),
    endsInSilence(samples, rate),
    check('length', length <= MAX_LENGTH, `${(length * 1000).toFixed(0)} ms, limit ${MAX_LENGTH * 1000} ms`),
    check('level', level >= MIN_LEVEL && level <= MAX_LEVEL,
      `loudest 50 ms at ${level.toFixed(1)} dBFS, between ${MIN_LEVEL} and ${MAX_LEVEL}`),
  ];
}

function seamCheck(samples, loopStart, rate) {
  const start = Math.round(loopStart * rate);
  const near = Math.round(SEAM_WINDOW * rate);
  let largest = 0;
  for (let i = 1; i < near; i++) {
    largest = Math.max(largest, Math.abs(samples[start + i] - samples[start + i - 1]));
    largest = Math.max(largest, Math.abs(samples.at(-i) - samples.at(-i - 1)));
  }
  const seam = Math.abs(samples[start] - samples.at(-1));
  return check('seam', seam <= largest * MAX_SEAM + 1e-6, `a step of ${seam.toFixed(3)} where it wraps, ${largest.toFixed(3)} near it`);
}

// A rendered song ({ samples, loopStart }): [{ name, pass, detail }]; a
// loop must wrap seamlessly, a jingle end in silence.
export function checkSong({ samples, loopStart }, rate) {
  const peak = peakOf(samples);
  return [
    check('peak', peak <= MAX_PEAK && peak >= MIN_SONG_PEAK,
      `${decibels(peak).toFixed(1)} dBFS, between ${decibels(MIN_SONG_PEAK).toFixed(1)} and ${decibels(MAX_PEAK).toFixed(1)}`),
    loopStart === null ? endsInSilence(samples, rate) : seamCheck(samples, loopStart, rate),
  ];
}
