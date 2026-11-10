// Västerhaninge's song: 1970s disco funk in E minor for the new centre of
// 1969 and a laundry on its spin cycle. A bar of the groove, then sixteen
// that loop: a vamp between E minor and A, and a longer climb through the
// circle of fifths back to it. Four on the floor, open hi-hats off the
// beat, and stabs where a guitar would chank.
import { BAND } from './band.js';

// The bass: a syncopated root and its octave, a seventh before the end.
const funk = (root, octave, seventh) =>
  `${root} . ${octave} ${root} . ${root} ${octave} . ${root} . ${octave} ${root} . ${seventh} ${octave} .`;
// The stabs: two chord tones, short, off the beat.
const stab = (a, b) => `. . ${a} . . . ${b} . . . ${a} . . . ${b} .`;

const Em7 = { harmony: stab('G4', 'D5'), bass: funk('E2', 'E3', 'D3') };
const A7 = { harmony: stab('G4', 'C#5'), bass: funk('A1', 'A2', 'G2') };
const Cmaj7 = { harmony: stab('E4', 'B4'), bass: funk('C2', 'C3', 'B2') };
const B7 = { harmony: stab('D#4', 'A4'), bass: funk('B1', 'B2', 'A2') };
const Am7 = { harmony: stab('G4', 'C5'), bass: funk('A1', 'A2', 'G2') };
const D7 = { harmony: stab('F#4', 'C5'), bass: funk('D2', 'D3', 'C3') };
const Gmaj7 = { harmony: stab('F#4', 'B4'), bass: funk('G1', 'G2', 'F#2') };
const Fsm7b5 = { harmony: stab('E4', 'A4'), bass: funk('F#1', 'F#2', 'E2') };

const vamp = {
  lead: [
    'E5 . G5 . A5 . B5 - - - . . D6 . B5 .',
    'A5 - - - G5 . E5 . . . G5 . A5 - - -',
    'E5 . G5 . A5 . B5 - - - . . D6 . E6 .',
    'D6 - B5 - A5 - G5 - E5 - - - . . . .',
    'G5 - - - B5 - - - E6 - - - D6 - B5 -',
    'A5 - - - F#5 - - - D#5 - - - F#5 - - -',
    'E5 . E5 . G5 . E5 . B5 - - - A5 - G5 -',
    'F#5 - - - D#5 - - - B4 - - - . . . .',
  ],
  chords: [Em7, A7, Em7, A7, Cmaj7, B7, Em7, B7],
};

const climb = {
  lead: [
    'C6 - - - B5 - A5 - G5 - - - E5 - - -',
    'F#5 - - - A5 - - - C6 - - - A5 - - -',
    'B5 - - - D6 - - - F#6 - - - D6 - - -',
    'E6 - - - - - - - D6 - C6 - B5 - G5 -',
    'A5 - - - C6 - - - E6 - - - C6 - - -',
    'B5 - - - A5 - - - F#5 - - - D#5 - - -',
    'E5 - - - G5 - B5 - E6 - - - D6 - B5 -',
    'A5 - F#5 - D#5 - B4 - . . . . . . . .',
  ],
  chords: [Am7, D7, Gmaj7, Cmaj7, Fsm7b5, B7, Em7, B7],
};

const FLOOR = 'k . o . s . o . k . o . s . o .';
const SPIN = 'k . o . s . o . k . s s s . s s';
const floor = [FLOOR, FLOOR, FLOOR, SPIN];

const sections = [vamp, climb];
const chords = sections.flatMap((section) => section.chords);

export const VASTERHANINGE = {
  id: 'vasterhaninge',
  bpm: 116,
  loopBar: 1,
  instruments: {
    lead: { ...BAND.lead, duty: 0.25 },
    harmony: { ...BAND.harmony, duty: 0.125, decay: 0.04, sustain: 0.1 },
    bass: BAND.bass,
  },
  bars: {
    lead: ['.', ...sections.flatMap((section) => section.lead)],
    harmony: ['.', ...chords.map((chord) => chord.harmony)],
    bass: [Em7.bass, ...chords.map((chord) => chord.bass)],
    drums: [FLOOR, ...floor, ...floor, ...floor, ...floor],
  },
};
