// Trångsund's song: a spy theme in D minor for 1969, a surf guitar of a
// tune that twangs and, now and then, picks one note over and over, a
// bass walking up the chords and stabs off the beat. Two bars of the
// bass alone, then sixteen that loop: a stake-out and a chase.
import { BAND, offbeat } from './band.js';

// One note picked a sixteenth at a time for the whole bar.
const tremolo = (note) => Array(16).fill(note).join(' ');

const Dm = { harmony: offbeat('D4', 'F4'), bass: 'D2 - F2 - A2 - C3 -' };
const Bb = { harmony: offbeat('D4', 'F4'), bass: 'Bb1 - D2 - F2 - A2 -' };
const A = { harmony: offbeat('C#4', 'E4'), bass: 'A1 - C#2 - E2 - G2 -' };
const Gm = { harmony: offbeat('Bb3', 'D4'), bass: 'G1 - Bb1 - D2 - F2 -' };
const C = { harmony: offbeat('E4', 'G4'), bass: 'C2 - E2 - G2 - Bb2 -' };
const F = { harmony: offbeat('C4', 'F4'), bass: 'F1 - A1 - C2 - E2 -' };

const intro = { lead: ['.', '.'], harmony: ['.', '.'], bass: [Dm.bass, A.bass] };

const stakeOut = {
  lead: [
    'A5 - - - D6 - - - C6 - A5 - F5 - - -',
    tremolo('A5'),
    'Bb5 - - - D6 - - - F6 - - - D6 - - -',
    'C#6 - - - E6 - - - A5 - - - . . . .',
    'D6 - - - F6 - - - E6 - D6 - A5 - - -',
    tremolo('D6'),
    'G5 - - - Bb5 - - - D6 - - - G6 - - -',
    'E6 - - - C#6 - - - A5 - - - . . . .',
  ],
  chords: [Dm, Dm, Bb, A, Dm, Dm, Gm, A],
};

const chase = {
  lead: [
    'Bb5 - - - G5 - - - D5 - - - G5 - - -',
    'C6 - - - G5 - - - E5 - - - G5 - - -',
    tremolo('A5'),
    'F6 - - - D6 - - - Bb5 - - - F5 - - -',
    'G5 - Bb5 - D6 - G6 - F6 - D6 - Bb5 - G5 -',
    'A5 - C#6 - E6 - - - G6 - - - E6 - - -',
    tremolo('D6'),
    'A5 - - - - - - - . . . . . . . .',
  ],
  chords: [Gm, C, F, Bb, Gm, A, Dm, A],
};

const SURF = 'k . h . s . h . k . h k s . h .';
const ROLL = 'k . h . s . h . k . s . s s s s';
const surf = [SURF, SURF, SURF, ROLL];

const sections = [stakeOut, chase];
const chords = sections.flatMap((section) => section.chords);

export const TRANGSUND = {
  id: 'trangsund',
  bpm: 140,
  loopBar: 2,
  instruments: {
    lead: { ...BAND.lead, duty: 0.25, decay: 0.15, sustain: 0.4 },
    harmony: { ...BAND.harmony, duty: 0.5, gain: 0.03 },
    bass: { ...BAND.bass, gain: 0.26 },
  },
  bars: {
    lead: [...intro.lead, ...sections.flatMap((section) => section.lead)],
    harmony: [...intro.harmony, ...chords.map((chord) => chord.harmony)],
    bass: [...intro.bass, ...chords.map((chord) => chord.bass)],
    drums: ['k . . . k . . . k . . . k . h h', ROLL, ...surf, ...surf, ...surf, ...surf],
  },
};
