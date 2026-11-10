// Krigslida's song: a fife and drum march in D minor, for a place with a
// war in its name and a front in the war on drugs. A snare roll, then
// sixteen bars that loop: the fife's call ending on the dominant, and its
// answer marching home to D.
import { BAND, oom } from './band.js';

// The second fife holds the chord's third and fifth, a half note each.
const Dm = { harmony: 'F4 - A4 -', bass: oom('D2', 'A2') };
const C = { harmony: 'E4 - G4 -', bass: oom('C2', 'G2') };
const Bb = { harmony: 'D4 - F4 -', bass: oom('Bb1', 'F2') };
const Gm = { harmony: 'Bb3 - D4 -', bass: oom('G1', 'D2') };
const A = { harmony: 'C#4 - E4 -', bass: oom('A1', 'E2') };
const F = { harmony: 'A3 - C4 -', bass: oom('F2', 'C3') };

const call = {
  lead: [
    'D5 - D5 E5 F5 - E5 D5',
    'A5 - - - F5 - D5 -',
    'E5 - E5 F5 G5 - F5 E5',
    'C5 - - - E5 - G5 -',
    'F5 - F5 G5 A5 - G5 F5',
    'D5 - G5 - Bb5 - A5 G5',
    'A5 - - - C#6 - - -',
    'E5 - A5 - C#6 - A5 -',
  ],
  chords: [Dm, Dm, C, C, Bb, Gm, A, A],
};

const answer = {
  lead: [
    'D6 - - - A5 - F5 -',
    'D5 - F5 - A5 - D6 -',
    'C6 - - - G5 - E5 -',
    'F5 - A5 - C6 - A5 -',
    'Bb5 - - A5 G5 - F5 -',
    'G5 - - F5 E5 - D5 -',
    'C#5 - E5 - A5 - G5 -',
    'D5 - - - . . . .',
  ],
  chords: [Dm, Dm, C, F, Bb, Gm, A, Dm],
};

const CADENCE = 'k . s s s . s . k . s s s . s .';
const TURN = 'k . s s s . s . s s s s s s s s';
const ROLL = 's s s s s s s s s s s s k . k .';
const march = [CADENCE, CADENCE, CADENCE, TURN];

const sections = [call, answer];
const chords = sections.flatMap((section) => section.chords);

export const KRIGSLIDA = {
  id: 'krigslida',
  bpm: 120,
  loopBar: 1,
  instruments: {
    lead: { ...BAND.lead, duty: 0.125, gain: 0.08 },
    harmony: { ...BAND.harmony, duty: 0.125, sustain: 0.5 },
    bass: { ...BAND.bass, gain: 0.2 },
  },
  bars: {
    lead: ['.', ...sections.flatMap((section) => section.lead)],
    harmony: ['.', ...chords.map((chord) => chord.harmony)],
    bass: ['.', ...chords.map((chord) => chord.bass)],
    drums: [ROLL, ...march, ...march, ...march, ...march],
  },
};
