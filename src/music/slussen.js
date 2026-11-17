// Slussen's song: eurodance in A minor for 1997, the beat on every
// quarter with the open hat between, an octave bass pumping eighths, the
// chords stabbed off the beat, and a riff that climbs into a big chorus.
// Two bars of the beat and the bass, then sixteen that loop: the verse by
// the lock, the chorus up Katarinahissen.
import { BAND, offbeat } from './band.js';

const pump = (low, high) => `${low} ${high} ${low} ${high} ${low} ${high} ${low} ${high}`;

const Am = { harmony: offbeat('A4', 'C5'), bass: pump('A1', 'A2') };
const F = { harmony: offbeat('F4', 'A4'), bass: pump('F1', 'F2') };
const C = { harmony: offbeat('E4', 'G4'), bass: pump('C2', 'C3') };
const G = { harmony: offbeat('D4', 'G4'), bass: pump('G1', 'G2') };

const intro = { lead: ['.', '.'], harmony: ['.', '.'], bass: [Am.bass, G.bass] };

const verse = {
  lead: [
    'A5 - . A5 C6 - A5 - G5 - . G5 E5 - G5 -',
    'F5 - . F5 A5 - F5 - E5 - . E5 C5 - E5 -',
    'A5 - . A5 C6 - A5 - G5 - . G5 E5 - G5 -',
    'G5 - . G5 B5 - G5 - D6 - - - B5 - G5 -',
    'A5 - . A5 C6 - A5 - G5 - . G5 E5 - G5 -',
    'F5 - . F5 A5 - F5 - E5 - . E5 C5 - E5 -',
    'A5 - . A5 C6 - A5 - G5 - . G5 E5 - G5 -',
    'G5 - . G5 B5 - D6 - E6 - - - . . . .',
  ],
  chords: [Am, F, Am, G, Am, F, Am, G],
};

const chorus = {
  lead: [
    'E6 - - - E6 - D6 - C6 - - - A5 - - -',
    'C6 - - - C6 - B5 - A5 - - - F5 - - -',
    'E6 - - - E6 - D6 - C6 - - - E6 - - -',
    'D6 - - - D6 - C6 - B5 - - - G5 - - -',
    'A6 - - - G6 - E6 - C6 - - - A5 - - -',
    'F6 - - - E6 - C6 - A5 - - - C6 - - -',
    'E6 - - - C6 - E6 - G6 - - - E6 - D6 -',
    'B5 - - - - - - - . . . . . . . .',
  ],
  chords: [Am, F, C, G, Am, F, C, G],
};

// Four to the floor, the open hat off the beat, the snare on two and four.
const BEAT = 'k . o . s . o . k . o . s . o .';
const FILL = 'k . o . s . o . k . s . s s s s';
const beat = [BEAT, BEAT, BEAT, FILL];

const sections = [verse, chorus];
const chords = sections.flatMap((section) => section.chords);

export const SLUSSEN = {
  id: 'slussen',
  bpm: 136,
  loopBar: 2,
  instruments: {
    lead: { ...BAND.lead, duty: 0.25, gain: 0.08, decay: 0.12, sustain: 0.5 },
    harmony: { ...BAND.harmony, duty: 0.5, gain: 0.035 },
    bass: { ...BAND.bass, gain: 0.27 },
  },
  bars: {
    lead: [...intro.lead, ...sections.flatMap((section) => section.lead)],
    harmony: [...intro.harmony, ...chords.map((chord) => chord.harmony)],
    bass: [...intro.bass, ...chords.map((chord) => chord.bass)],
    drums: [BEAT, FILL, ...beat, ...beat, ...beat, ...beat],
  },
};
