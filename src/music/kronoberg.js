// Kronoberg's song: trip-hop in E minor for three in the morning in the
// police house, 1997, slow and heavy at 88 bpm: a lazy kick and a snare
// on three, a bass that walks down the minor scale, a cold organ chord
// held under it and a thin tune that will not settle. Two bars of the
// beat and the bass, then sixteen that loop.
import { BAND } from './band.js';

// The bass: the root held, falling at the end of the bar.
const walk = (root, fall) => `${root} - - - - - - - - - - - ${fall} - - -`;
// The organ: one chord tone held across the bar.
const held = (note) => `${note} - - -`;

const Em = { harmony: held('G4'), bass: walk('E2', 'D2') };
const C = { harmony: held('E4'), bass: walk('C2', 'B1') };
const Am = { harmony: held('C5'), bass: walk('A1', 'G1') };
const B = { harmony: held('D#4'), bass: walk('B1', 'F#1') };

const intro = { lead: ['.', '.'], harmony: ['.', '.'], bass: [Em.bass, Em.bass] };

const cell = {
  lead: [
    '. . . . B4 - - - . . G4 - A4 - - -',
    'B4 - - - - - - - . . . . . . . .',
    '. . . . C5 - - - . . B4 - A4 - - -',
    'E4 - - - - - - - . . . . . . . .',
    '. . . . A4 - - - . . C5 - E5 - - -',
    'D5 - - - C5 - - - B4 - - - A4 - - -',
    '. . . . F#4 - - - . . A4 - B4 - - -',
    'D#5 - - - - - - - . . . . . . . .',
  ],
  chords: [Em, Em, C, C, Am, Am, B, B],
};

const turn = {
  lead: [
    'E5 - - - - - D5 - B4 - - - G4 - - -',
    'A4 - - - B4 - - - . . . . . . . .',
    'C5 - - - - - B4 - G4 - - - E4 - - -',
    'F#4 - - - G4 - - - . . . . . . . .',
    'A4 - - - C5 - - - E5 - - - D5 - - -',
    'C5 - - - - - - - . . . . B4 - A4 -',
    'B4 - - - - - - - D#5 - - - F#5 - - -',
    'E5 - - - - - - - . . . . . . . .',
  ],
  chords: [Em, Em, C, C, Am, Am, B, Em],
};

// The kick lazy and late, the snare on three, the hats ticking.
const BEAT = 'k . h . h . k h s . h . h k h .';
const FILL = 'k . h . h . k h s . h k s . s s';
const beat = [BEAT, BEAT, BEAT, FILL];

const sections = [cell, turn];
const chords = sections.flatMap((section) => section.chords);

export const KRONOBERG = {
  id: 'kronoberg',
  bpm: 88,
  loopBar: 2,
  instruments: {
    lead: { ...BAND.lead, duty: 0.125, gain: 0.07, decay: 0.4, sustain: 0.5 },
    harmony: { ...BAND.harmony, wave: 'triangle', gain: 0.05, decay: 0.3, sustain: 0.8 },
    bass: { ...BAND.bass, gain: 0.26 },
  },
  bars: {
    lead: [...intro.lead, ...sections.flatMap((section) => section.lead)],
    harmony: [...intro.harmony, ...chords.map((chord) => chord.harmony)],
    bass: [...intro.bass, ...chords.map((chord) => chord.bass)],
    drums: [BEAT, FILL, ...beat, ...beat, ...beat, ...beat],
  },
};
