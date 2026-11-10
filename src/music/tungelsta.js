// Tungelsta's song: a garden town's evening visa in G, unhurried, a harp
// picking broken chords under a soft tune. Two bars of picking, then
// sixteen that loop: a phrase about the greenhouses, then one that turns
// to E minor as the moon ("tungel") comes up, and home again.
import { BAND, oom, oomSplit } from './band.js';

// A chord picked up and down, an eighth each.
const pick = (a, b, c) => `${a} ${b} ${c} ${b} ${a} ${b} ${c} ${b}`;

const G = { harmony: pick('G4', 'B4', 'D5'), bass: oom('G2', 'D3') };
const C = { harmony: pick('E4', 'G4', 'C5'), bass: oom('C3', 'G2') };
const D = { harmony: pick('F#4', 'A4', 'D5'), bass: oom('D2', 'A2') };
const Em = { harmony: pick('E4', 'G4', 'B4'), bass: oom('E2', 'B2') };
const AmD = { harmony: 'A4 C5 E5 C5 F#4 A4 D5 A4', bass: oomSplit('A2', 'E2', 'D2', 'A2') };

const intro = { lead: ['.', '.'], chords: [G, D] };

const garden = {
  lead: [
    'D5 - G5 - B5 - A5 G5',
    'E5 - - - G5 - E5 C5',
    'D5 - F#5 - A5 - G5 F#5',
    'G5 - - - . . D5 -',
    'B5 - - A5 G5 - D5 -',
    'E5 - G5 - B5 - - -',
    'C6 - B5 - A5 - F#5 -',
    'G5 - - - - - . .',
  ],
  chords: [G, C, D, G, G, Em, AmD, G],
};

const moon = {
  lead: [
    'B5 - - - E6 - D6 B5',
    'C6 - - - G5 - E5 -',
    'D6 - B5 - G5 - B5 -',
    'A5 - - - F#5 - D5 -',
    'E5 - G5 - B5 - E6 -',
    'D6 - C6 - G5 - E5 -',
    'C5 - E5 - D5 - F#5 -',
    'G5 - - - - - . .',
  ],
  chords: [Em, C, G, D, Em, C, AmD, G],
};

const STROLL = 'k . . . h . . . k . . . h . h .';
const STEP = 'k . . . h . . . k . h . s . h .';
const stroll = [STROLL, STROLL, STROLL, STEP];

const sections = [garden, moon];
const chords = [...intro.chords, ...sections.flatMap((section) => section.chords)];

export const TUNGELSTA = {
  id: 'tungelsta',
  bpm: 108,
  loopBar: 2,
  instruments: {
    lead: { ...BAND.lead, duty: 0.25, decay: 0.3, sustain: 0.45 },
    harmony: { ...BAND.harmony, duty: 0.5, gain: 0.035 },
    bass: { ...BAND.bass, gain: 0.24 },
  },
  bars: {
    lead: [...intro.lead, ...sections.flatMap((section) => section.lead)],
    harmony: chords.map((chord) => chord.harmony),
    bass: chords.map((chord) => chord.bass),
    drums: [STROLL, STEP, ...stroll, ...stroll, ...stroll, ...stroll],
  },
};
