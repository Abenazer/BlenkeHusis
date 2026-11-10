// Jordbro's song: concrete and a pipe works, a machine of a song in C
// minor. A sequencer runs sixteenths of the chord without stopping, the
// bass pumps eighths, and a long, cold tune goes over the top. Two bars
// of the machine alone, then sixteen that loop.
import { BAND } from './band.js';

// The sequencer: four chord tones, round and round, a sixteenth each.
const sequence = (a, b, c, d) => `${a} ${b} ${c} ${d} `.repeat(4).trim();
// The bass: the root on every eighth, the octave once.
const pump = (root, octave) => `${root} ${root} ${root} ${root} ${root} ${root} ${octave} ${root}`;

const Cm = { harmony: sequence('C4', 'Eb4', 'G4', 'C5'), bass: pump('C2', 'C3') };
const Ab = { harmony: sequence('C4', 'Eb4', 'Ab4', 'C5'), bass: pump('Ab1', 'Ab2') };
const Fm = { harmony: sequence('C4', 'F4', 'Ab4', 'C5'), bass: pump('F1', 'F2') };
const G = { harmony: sequence('B3', 'D4', 'G4', 'B4'), bass: pump('G1', 'G2') };
const Bb = { harmony: sequence('D4', 'F4', 'Bb4', 'D5'), bass: pump('Bb1', 'Bb2') };

const shift = {
  lead: [
    'G5 - - - Eb5 - C5 -',
    'D5 - Eb5 - G5 - - -',
    'Ab5 - - - G5 - Eb5 -',
    'C5 - - - - - . .',
    'F5 - - - Ab5 - C6 -',
    'Bb5 - Ab5 - G5 - F5 -',
    'G5 - - - B5 - D6 -',
    'F6 - - - D6 - B5 -',
  ],
  chords: [Cm, Cm, Ab, Ab, Fm, Fm, G, G],
};

const overtime = {
  lead: [
    'C6 - - - G5 - Eb5 -',
    'D6 - - - Bb5 - F5 -',
    'Eb6 - - - C6 - Ab5 -',
    'D6 - - - B5 - G5 -',
    'C6 - Ab5 - F5 - Ab5 -',
    'Eb6 - C6 - Ab5 - C6 -',
    'B5 - - - - - D6 -',
    'G5 - - - . . . .',
  ],
  chords: [Cm, Bb, Ab, G, Fm, Ab, G, G],
};

const MACHINE = 'k . h . k . h . k . h . k . h .';
const BEAT = 'k . h . s . h . k k h . s . h .';
const STAMP = 'k . h . s . h . k k h . s s s s';
const works = [BEAT, BEAT, BEAT, STAMP];

const sections = [shift, overtime];
const chords = [Cm, Cm, ...sections.flatMap((section) => section.chords)];

export const JORDBRO = {
  id: 'jordbro',
  bpm: 132,
  loopBar: 2,
  instruments: {
    lead: { ...BAND.lead, duty: 0.25, decay: 0.4, sustain: 0.6 },
    harmony: { ...BAND.harmony, duty: 0.125, gain: 0.035, decay: 0.03, sustain: 0.2 },
    bass: { ...BAND.bass, gain: 0.22 },
  },
  bars: {
    lead: ['.', '.', ...sections.flatMap((section) => section.lead)],
    harmony: chords.map((chord) => chord.harmony),
    bass: chords.map((chord) => chord.bass),
    drums: [MACHINE, MACHINE, ...works, ...works, ...works, ...works],
  },
};
