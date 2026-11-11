// Skogås's song: new wave in E minor for the early 1980s, a thin synth
// tune over a guitar chopping eighths and a bass driving under it. Two
// bars of the band alone, then sixteen that loop: a verse, and a chorus
// that climbs to the top and hangs on B.
import { alternate, BAND } from './band.js';

// The bass: the root on every eighth, the octave on the off-beats of two.
const drive = (root, octave) => `${root} ${root} ${octave} ${root} ${root} ${root} ${octave} ${root}`;

const Em = { harmony: alternate('E4', 'B4'), bass: drive('E2', 'E3') };
const C = { harmony: alternate('C4', 'G4'), bass: drive('C2', 'C3') };
const G = { harmony: alternate('D4', 'G4'), bass: drive('G1', 'G2') };
const D = { harmony: alternate('D4', 'A4'), bass: drive('D2', 'D3') };
const Am = { harmony: alternate('E4', 'A4'), bass: drive('A1', 'A2') };
const B = { harmony: alternate('D#4', 'F#4'), bass: drive('B1', 'B2') };

const intro = { lead: ['.', '.'], chords: [Em, Em] };

const verse = {
  lead: [
    'B4 - E5 - G5 - F#5 E5',
    'G5 - - - E5 - C5 -',
    'D5 - G5 - B5 - A5 G5',
    'F#5 - - - D5 - . .',
    'B4 - E5 - G5 - B5 -',
    'C6 - B5 - G5 - E5 -',
    'A5 - - - C6 - B5 A5',
    'F#5 - - - D#5 - . .',
  ],
  chords: [Em, C, G, D, Em, C, Am, B],
};

const chorus = {
  lead: [
    'E6 - - - D6 - C6 -',
    'D6 - - - A5 - F#5 -',
    'G5 - B5 - E6 - - -',
    'E6 - D6 - B5 - G5 -',
    'C6 - - - E6 - C6 -',
    'D6 - - - F#6 - A5 -',
    'B5 - - - D#6 - F#6 -',
    'F#6 - - - - - . .',
  ],
  chords: [C, D, Em, Em, C, D, B, B],
};

const START = 'k . h . k . h . k . h . s s s s';
const BEAT = 'k . h . s . h . k k h . s . h .';
const PUSH = 'k . h . s . h . k k h . s s s s';
const wave = [BEAT, BEAT, BEAT, PUSH];

const sections = [verse, chorus];
const chords = [...intro.chords, ...sections.flatMap((section) => section.chords)];

export const SKOGAS = {
  id: 'skogas',
  bpm: 152,
  loopBar: 2,
  instruments: {
    lead: { ...BAND.lead, duty: 0.125, decay: 0.25, sustain: 0.5 },
    harmony: { ...BAND.harmony, duty: 0.5, gain: 0.03, decay: 0.04, sustain: 0.25 },
    bass: { ...BAND.bass, gain: 0.24 },
  },
  bars: {
    lead: [...intro.lead, ...sections.flatMap((section) => section.lead)],
    harmony: chords.map((chord) => chord.harmony),
    bass: chords.map((chord) => chord.bass),
    drums: [BEAT, START, ...wave, ...wave, ...wave, ...wave],
  },
};
