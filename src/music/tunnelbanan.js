// Tunnelbanan's song: jungle in A minor for the last train in 1997, a
// broken two-step beat at 170 bpm over a long sub bass, stabs off the
// beat, and a tune at half the speed that breaks into sixteenths for the
// second half. Two bars of the beat and the bass, then sixteen that loop.
import { BAND } from './band.js';

// The sub: the root held, moving to the fifth late in the bar.
const sub = (root, fifth) => `${root} - - - - - - - - - ${fifth} - - - - -`;
// A stab on two and four, held for an eighth.
const stab = (note) => `. . . . ${note} - . . . . . . ${note} - . .`;

const Am = { harmony: stab('C5'), bass: sub('A1', 'E2') };
const F = { harmony: stab('A4'), bass: sub('F1', 'C2') };
const C = { harmony: stab('E5'), bass: sub('C2', 'G1') };
const G = { harmony: stab('D5'), bass: sub('G1', 'D2') };
const E = { harmony: stab('G#4'), bass: sub('E1', 'B1') };

const intro = { lead: ['.', '.'], harmony: ['.', '.'], bass: [Am.bass, Am.bass] };

const calm = {
  lead: [
    'E5 - - - A5 - - -',
    'G5 - E5 - - - . .',
    'F5 - - - C6 - - -',
    'A5 - - - - - . .',
    'G5 - - - E5 - G5 -',
    'C6 - - - - - . .',
    'B5 - - - D6 - - -',
    'B5 - G#5 - E5 - . .',
  ],
  chords: [Am, Am, F, F, C, C, G, E],
};

const rush = {
  lead: [
    'A5 . A5 . C6 . A5 . E6 - - - C6 . A5 .',
    'G5 . E5 . G5 . A5 - - - . . . . . .',
    'F5 . F5 . A5 . C6 . F6 - - - C6 . A5 .',
    'G5 . A5 . F5 - - - . . . . . . . .',
    'E5 . G5 . C6 . G5 . E6 - - - C6 . G5 .',
    'D6 . C6 . G5 - - - . . . . . . . .',
    'D6 . B5 . G5 . B5 . D6 - - - B5 . G5 .',
    'G#5 - - - B5 - - - E6 - - - - - - -',
  ],
  chords: [Am, Am, F, F, C, C, G, E],
};

// The two-step: the kick on one and a late one, the snare on two and
// four, ghosted hats; the fill breaks it up.
const BEAT = 'k . h . s . h k . h k . s . h .';
const FILL = 'k . h . s . h k . h k . s s k s';
const beat = [BEAT, BEAT, BEAT, FILL];

const sections = [calm, rush];
const chords = sections.flatMap((section) => section.chords);

export const TUNNELBANAN = {
  id: 'tunnelbanan',
  bpm: 170,
  loopBar: 2,
  instruments: {
    lead: { ...BAND.lead, duty: 0.25, gain: 0.07, decay: 0.2, sustain: 0.5 },
    harmony: { ...BAND.harmony, duty: 0.5, gain: 0.04, decay: 0.05, sustain: 0.2 },
    bass: { ...BAND.bass, gain: 0.3 },
  },
  bars: {
    lead: [...intro.lead, ...sections.flatMap((section) => section.lead)],
    harmony: [...intro.harmony, ...chords.map((chord) => chord.harmony)],
    bass: [...intro.bass, ...chords.map((chord) => chord.bass)],
    drums: [BEAT, FILL, ...beat, ...beat, ...beat, ...beat],
  },
};
