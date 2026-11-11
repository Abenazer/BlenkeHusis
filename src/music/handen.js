// Handen's song: a dance band's foxtrot in F for 1971, the year the new
// kommun moved into Nämndhuset, a saxophone of a tune over oom-pah bass
// and stabs off the beat. Two bars of the band warming up, then sixteen
// that loop: a verse and a chorus that leans on B flat.
import { BAND, offbeat, oom } from './band.js';

const F = { harmony: offbeat('A4', 'C5'), bass: oom('F2', 'C3') };
const Dm = { harmony: offbeat('A4', 'D5'), bass: oom('D2', 'A2') };
const Gm = { harmony: offbeat('Bb4', 'D5'), bass: oom('G2', 'D3') };
const C7 = { harmony: offbeat('Bb4', 'E5'), bass: oom('C2', 'G2') };
const Bb = { harmony: offbeat('D5', 'F5'), bass: oom('Bb1', 'F2') };

const intro = { lead: ['.', '.'], chords: [F, C7] };

const verse = {
  lead: [
    'C5 - F5 - A5 - G5 F5',
    'D5 - - - F5 - A5 -',
    'G5 - - - Bb5 - A5 G5',
    'E5 - - - C5 - . .',
    'C5 - F5 - A5 - C6 -',
    'D6 - - - Bb5 - F5 -',
    'G5 - A5 - Bb5 - E5 -',
    'F5 - - - - - . .',
  ],
  chords: [F, Dm, Gm, C7, F, Bb, C7, F],
};

const chorus = {
  lead: [
    'D6 - - - C6 - Bb5 -',
    'F5 - G5 - Bb5 - D6 -',
    'C6 - - - A5 - F5 -',
    'D5 - F5 - A5 - D6 -',
    'Bb5 - - - G5 - D5 -',
    'E5 - G5 - Bb5 - C6 -',
    'A5 - - - G5 - F5 -',
    'F5 - - - - - . .',
  ],
  chords: [Bb, Bb, F, Dm, Gm, C7, F, F],
};

const COUNT_IN = 'k . . . s . . . k . . . s . s s';
const FOXTROT = 'k . h . s . h . k . h . s . h .';
const TURN = 'k . h . s . h . k . h . s s s .';
const dance = [FOXTROT, FOXTROT, FOXTROT, TURN];

const sections = [verse, chorus];
const chords = [...intro.chords, ...sections.flatMap((section) => section.chords)];

export const HANDEN = {
  id: 'handen',
  bpm: 124,
  loopBar: 2,
  instruments: {
    lead: { ...BAND.lead, decay: 0.3, sustain: 0.65 },
    harmony: { ...BAND.harmony, duty: 0.25, gain: 0.035 },
    bass: { ...BAND.bass, gain: 0.26 },
  },
  bars: {
    lead: [...intro.lead, ...sections.flatMap((section) => section.lead)],
    harmony: chords.map((chord) => chord.harmony),
    bass: chords.map((chord) => chord.bass),
    drums: [FOXTROT, COUNT_IN, ...dance, ...dance, ...dance, ...dance],
  },
};
