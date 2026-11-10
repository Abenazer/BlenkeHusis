// Södertörns villastad's song: a summer hit in D for a day at Farsta
// strandbad, calypso bass and a steel drum skanking off the beat. Sixteen
// bars that loop: a sunny tune, a second half that dips to B minor, and
// a last line home.
import { BAND } from './band.js';

// The bass in three, three and two eighths: root, fifth, root.
const calypso = (root, fifth) => `${root} - - ${fifth} - - ${root} -`;
// The steel drum: two chord tones, off the beat.
const skank = (a, b) => `. ${a} ${b} . ${a} . ${b} .`;

const D = { harmony: skank('F#4', 'A4'), bass: calypso('D2', 'A2') };
const G = { harmony: skank('G4', 'B4'), bass: calypso('G2', 'D3') };
const A = { harmony: skank('A4', 'C#5'), bass: calypso('A1', 'E2') };
const Bm = { harmony: skank('F#4', 'B4'), bass: calypso('B1', 'F#2') };
const E = { harmony: skank('G#4', 'B4'), bass: calypso('E2', 'B2') };
const Fsm = { harmony: skank('A4', 'C#5'), bass: calypso('F#2', 'C#3') };

const sunny = {
  lead: [
    'F#5 - A5 - D6 - - A5',
    'B5 - - G5 - - D5 -',
    'E5 - A5 - C#6 - B5 A5',
    'D6 - - - - - . .',
    'A5 - F#5 - A5 - D6 -',
    'D6 - - B5 - - F#5 -',
    'G#5 - B5 - E6 - D6 B5',
    'C#6 - - - A5 - . .',
  ],
  chords: [D, G, A, D, D, Bm, E, A],
};

const shade = {
  lead: [
    'B5 - D6 - B5 - G5 -',
    'C#6 - E6 - C#6 - A5 -',
    'A5 - C#6 - F#6 - E6 C#6',
    'D6 - - - B5 - F#5 -',
    'G5 - B5 - D6 - E6 -',
    'F#6 - E6 - C#6 - A5 -',
    'D6 - - - A5 - F#5 -',
    'D5 - - - . . . .',
  ],
  chords: [G, A, Fsm, Bm, G, A, D, D],
};

const BEACH = 'k . o . s h . h k . o . s h . h';
const WAVE = 'k . o . s h . h k . s . s s s s';
const beach = [BEACH, BEACH, BEACH, WAVE];

const sections = [sunny, shade];
const chords = sections.flatMap((section) => section.chords);

export const VILLASTAD = {
  id: 'villastad',
  bpm: 132,
  loopBar: 0,
  instruments: {
    lead: BAND.lead,
    harmony: { ...BAND.harmony, decay: 0.05, sustain: 0.15 },
    bass: BAND.bass,
  },
  bars: {
    lead: sections.flatMap((section) => section.lead),
    harmony: chords.map((chord) => chord.harmony),
    bass: chords.map((chord) => chord.bass),
    drums: [...beach, ...beach, ...beach, ...beach],
  },
};
