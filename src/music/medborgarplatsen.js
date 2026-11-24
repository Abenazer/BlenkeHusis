// Medborgarplatsen's song: Britpop in D for Söder in 1997, the bars'
// guitar strumming eighths, the bass driving the root, a backbeat with a
// double kick, and a tune to sing along to on the way out at closing
// time. Two bars of the band, then a verse and a chorus that loop, the
// chorus lifting through E to A before it comes round again.
import { BAND, alternate } from './band.js';

const eighths = (note) => Array(8).fill(note).join(' ');

const D = { harmony: alternate('F#4', 'A4'), bass: eighths('D2') };
const A = { harmony: alternate('E4', 'A4'), bass: eighths('A1') };
const Bm = { harmony: alternate('F#4', 'B4'), bass: eighths('B1') };
const G = { harmony: alternate('G4', 'B4'), bass: eighths('G1') };
const E = { harmony: alternate('E4', 'G#4'), bass: eighths('E2') };

const intro = { lead: ['.', '.'], harmony: [D.harmony, A.harmony], bass: [D.bass, A.bass] };

const verse = {
  lead: [
    'F#5 - - - F#5 - E5 - D5 - - - . . A4 -',
    'C#5 - - - C#5 - D5 - E5 - - - . . . .',
    'D5 - - - D5 - C#5 - B4 - - - . . F#4 -',
    'G4 - - - A4 - B4 - D5 - - - - - - -',
    'F#5 - - - F#5 - G5 - A5 - - - F#5 - - -',
    'E5 - - - E5 - D5 - C#5 - - - . . A4 -',
    'B4 - - - C#5 - D5 - F#5 - - - E5 - D5 -',
    'E5 - - - - - - - . . . . . . . .',
  ],
  chords: [D, A, Bm, G, D, A, Bm, G],
};

const chorus = {
  lead: [
    'B5 - - - B5 - A5 - G5 - - - A5 - B5 -',
    'A5 - - - - - F#5 - . . . . D5 - E5 -',
    'E5 - - - E5 - F#5 - E5 - - - C#5 - - -',
    'D5 - - - C#5 - B4 - . . . . B4 - C#5 -',
    'D5 - - - D5 - E5 - G5 - - - F#5 - E5 -',
    'F#5 - - - - - D5 - A5 - - - F#5 - - -',
    'G#5 - - - G#5 - A5 - B5 - - - A5 - G#5 -',
    'A5 - - - - - - - . . . . . . . .',
  ],
  chords: [G, D, A, Bm, G, D, E, A],
};

// The backbeat, the kick doubled before three, the hat on the eighths.
const BEAT = 'k h s h k k s h';
const FILL = 'k h s h k s s s';
const beat = [BEAT, BEAT, BEAT, FILL];

const sections = [verse, chorus];
const chords = sections.flatMap((section) => section.chords);

export const MEDBORGARPLATSEN = {
  id: 'medborgarplatsen',
  bpm: 132,
  loopBar: 2,
  instruments: {
    lead: { ...BAND.lead, duty: 0.5, gain: 0.08, decay: 0.25, sustain: 0.6 },
    harmony: { ...BAND.harmony, duty: 0.25, gain: 0.04, decay: 0.08, sustain: 0.35 },
    bass: { ...BAND.bass, gain: 0.26 },
  },
  bars: {
    lead: [...intro.lead, ...sections.flatMap((section) => section.lead)],
    harmony: [...intro.harmony, ...chords.map((chord) => chord.harmony)],
    bass: [...intro.bass, ...chords.map((chord) => chord.bass)],
    drums: [BEAT, FILL, ...beat, ...beat, ...beat, ...beat],
  },
};
