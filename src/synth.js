// A chip synthesizer that renders sounds into sample arrays, the way the art
// is made as pixel images: pure, with no Web Audio, so tests can measure
// what is heard and audio.js only plays the result.
//
// A sound is a list of voices mixed together. A voice is one tone:
//   wave     'pulse', 'triangle' or 'noise'
//   duty     a pulse's share of high (0.125, 0.25 or 0.5 are the classic ones)
//   at       when it starts, in seconds from the sound's start (0)
//   length   how long it lasts, in seconds, release included
//   freq     its pitch in Hz; for noise, how often a new random level is
//            picked, which is what gives noise its pitch
//   to       a pitch to slide to, exponentially, over `slide` seconds
//            (the whole length if not given), then held
//   arp      semitone steps cycled every `arpRate` seconds (an arpeggio)
//   gain     its loudness, 0 to 1
//   attack   seconds to rise to full (a few milliseconds, so it never clicks)
//   decay    seconds for the level to fall by e towards `sustain` (none if 0)
//   sustain  the level it falls to, 0 to 1
//   release  seconds at the end to fade out to silence, so it never clicks

export const SAMPLE_RATE = 44100;

export const WAVES = ['pulse', 'triangle', 'noise'];

const DEFAULTS = {
  at: 0,
  duty: 0.5,
  arp: null,
  arpRate: 0.03,
  gain: 0.3,
  attack: 0.002,
  decay: 0,
  sustain: 1,
  release: 0.01,
};

const NOTE_STEPS = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
const NOTE = /^([A-G])([#b]?)(-?\d)$/;

// 'A4' is 440 Hz; sharps and flats as 'F#5' and 'Bb3'.
export function noteFrequency(name) {
  const match = NOTE.exec(name);
  if (!match) throw new Error(`Not a note: '${name}'`);
  const [, letter, accidental, octave] = match;
  const shift = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0;
  const steps = NOTE_STEPS[letter] + shift + (Number(octave) - 4) * 12;
  return 440 * 2 ** (steps / 12);
}

export function voiceEnd(voice) {
  return (voice.at ?? 0) + voice.length;
}

export function soundLength(sound) {
  return Math.max(...sound.voices.map(voiceEnd));
}

function check(voice) {
  if (!WAVES.includes(voice.wave)) throw new Error(`Unknown wave '${voice.wave}'`);
  if (!(voice.length > 0)) throw new Error(`A voice needs a length above 0, not ${voice.length}`);
  if (!(voice.freq > 0)) throw new Error(`A voice needs a frequency above 0, not ${voice.freq}`);
}

function envelope(voice, t) {
  const { attack, decay, sustain, release, length } = voice;
  let level = t < attack ? t / attack : 1;
  if (decay > 0 && t >= attack) level = sustain + (1 - sustain) * Math.exp(-(t - attack) / decay);
  const left = length - t;
  if (left < release) level *= Math.max(0, left / release);
  return level;
}

function frequency(voice, t) {
  let freq = voice.freq;
  if (voice.to) {
    const slide = voice.slide ?? voice.length;
    freq *= (voice.to / voice.freq) ** Math.min(t / slide, 1);
  }
  if (voice.arp) freq *= 2 ** (voice.arp[Math.floor(t / voice.arpRate) % voice.arp.length] / 12);
  return freq;
}

// The triangle steps through 16 levels, as on the old consoles' chips.
function triangle(phase) {
  return Math.round((1 - 4 * Math.abs(phase - 0.5)) * 7.5) / 7.5;
}

// Adds one voice into the samples, from its start.
function renderVoice(samples, voice, rate) {
  check(voice);
  const v = { ...DEFAULTS, ...voice };
  const start = Math.round(v.at * rate);
  const count = Math.min(Math.round(v.length * rate), samples.length - start);
  let phase = 0;
  // A 15-bit linear-feedback shift register, as the old noise channels had:
  // the same noise every time, so a test hears what the player hears.
  let lfsr = 1;
  let noise = 1;
  for (let i = 0; i < count; i++) {
    const t = i / rate;
    let wave;
    // Centred on zero, as the chips' output filters did: a narrow pulse
    // would otherwise sit far below the middle and thump as it starts.
    if (v.wave === 'pulse') wave = phase < v.duty ? 2 * (1 - v.duty) : -2 * v.duty;
    else if (v.wave === 'triangle') wave = triangle(phase);
    else wave = noise;
    samples[start + i] += wave * v.gain * envelope(v, t);
    phase += frequency(v, t) / rate;
    if (phase >= 1) {
      phase -= Math.floor(phase);
      const bit = (lfsr ^ (lfsr >> 1)) & 1;
      lfsr = (lfsr >> 1) | (bit << 14);
      noise = lfsr & 1 ? 1 : -1;
    }
  }
}

// The sound's samples, mono, at the given rate.
export function renderSound(sound, rate = SAMPLE_RATE) {
  if (!sound.voices?.length) throw new Error('A sound needs at least one voice');
  const samples = new Float32Array(Math.ceil(soundLength(sound) * rate));
  for (const voice of sound.voices) renderVoice(samples, voice, rate);
  return samples;
}
