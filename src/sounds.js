// The sound effects as data: the voices synth.js renders (see there for
// what a voice holds). Each sound may also set
//   channel  sounds on the same channel cut each other off, so a run of
//            pickups is heard as a run, not a smear
//   minGap   seconds the same sound waits before it can play again, for
//            events that can come many steps in a row
import { noteFrequency as note } from './synth.js';

export const SOUNDS = {
  // A square wave sweeping up as he leaves the ground.
  jump: {
    channel: 'blenke',
    voices: [
      { wave: 'pulse', duty: 0.25, freq: 260, to: 620, slide: 0.12, length: 0.17, gain: 0.22, decay: 0.12, sustain: 0.3, release: 0.04 },
    ],
  },
  // A thump of boots on the ground; cues.js sets how loud by the fall.
  land: {
    minGap: 0.1,
    voices: [
      { wave: 'triangle', freq: 150, to: 55, length: 0.09, gain: 0.5, decay: 0.04, sustain: 0, release: 0.02 },
      { wave: 'noise', freq: 2200, length: 0.05, gain: 0.12, decay: 0.015, sustain: 0, release: 0.01 },
    ],
  },
  // His head against a ceiling: a dull knock.
  bump: {
    minGap: 0.15,
    voices: [
      { wave: 'pulse', duty: 0.5, freq: 190, to: 110, length: 0.1, gain: 0.2, decay: 0.05, sustain: 0, release: 0.02 },
      { wave: 'noise', freq: 5000, length: 0.03, gain: 0.12, decay: 0.01, sustain: 0, release: 0.008 },
    ],
  },
  // A urine sample: the bright two-note ping every pickup game has.
  sample: {
    channel: 'pickup',
    voices: [
      { wave: 'pulse', duty: 0.5, freq: note('B5'), length: 0.06, gain: 0.16, release: 0.005 },
      { wave: 'pulse', duty: 0.5, at: 0.06, freq: note('E6'), length: 0.3, gain: 0.16, decay: 0.09, sustain: 0, release: 0.05 },
    ],
  },
  // Minor possession is the big find: a little fanfare for 0.02 grams.
  possession: {
    channel: 'pickup',
    voices: [
      { wave: 'pulse', duty: 0.25, freq: note('G5'), arp: [0, 4, 7, 12], arpRate: 0.045, length: 0.18, gain: 0.15, release: 0.01 },
      { wave: 'pulse', duty: 0.25, at: 0.18, freq: note('G6'), length: 0.4, gain: 0.15, decay: 0.15, sustain: 0, release: 0.06 },
      { wave: 'triangle', freq: note('G3'), length: 0.3, gain: 0.35, decay: 0.12, sustain: 0, release: 0.05 },
    ],
  },
  // Evidence: two notes a fifth apart, thin and official.
  evidence: {
    channel: 'pickup',
    voices: [
      { wave: 'pulse', duty: 0.125, freq: note('G5'), length: 0.07, gain: 0.16, release: 0.005 },
      { wave: 'pulse', duty: 0.125, at: 0.07, freq: note('D6'), length: 0.22, gain: 0.16, decay: 0.07, sustain: 0, release: 0.04 },
    ],
  },
  // A bonus item: a quick run up a major chord.
  bonus: {
    channel: 'pickup',
    voices: [
      { wave: 'pulse', duty: 0.5, freq: note('C6'), arp: [0, 4, 7, 12], arpRate: 0.035, length: 0.28, gain: 0.14, decay: 0.12, sustain: 0.2, release: 0.06 },
    ],
  },
};
