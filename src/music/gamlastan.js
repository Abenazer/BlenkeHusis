// Gamla stan's song: a trad jazz shuffle in F from the cellar clubs in
// the old town's lanes, late on a summer evening. The clarinet's tune
// swung long and short, the banjo on two and four, a walking bass and
// brushed drums. Two bars of the rhythm section, then sixteen that loop,
// round a trad chorus that leans on its sevenths on the way home.
import { BAND } from './band.js';

// Four swung eighths a beat, long and short, as the 16-step grid has them.
const swing = (a, b, c, d, e, f, g, h) => `${a} - - ${b} ${c} - - ${d} ${e} - - ${f} ${g} - - ${h}`;
// The banjo's chord on two and four.
const banjo = (low, high) => `. ${low} . ${high}`;

const F = { harmony: banjo('A4', 'C5'), bass: 'F2 A2 C3 A2' };
const F2 = { harmony: banjo('A4', 'C5'), bass: 'F2 G2 A2 C3' };
const F7 = { harmony: banjo('A4', 'Eb5'), bass: 'F2 A2 C3 Eb3' };
const Bb = { harmony: banjo('Bb4', 'D5'), bass: 'Bb1 D2 F2 D2' };
const Bb2 = { harmony: banjo('Bb4', 'D5'), bass: 'Bb1 C2 D2 E2' };
const D7 = { harmony: banjo('F#4', 'C5'), bass: 'D2 F#2 A2 C3' };
const G7 = { harmony: banjo('B4', 'F5'), bass: 'G1 B1 D2 F2' };
const C7 = { harmony: banjo('E4', 'Bb4'), bass: 'C2 E2 G2 Bb2' };

const intro = { lead: ['.', '.'], harmony: ['.', '.'], bass: [F.bass, C7.bass] };

const chorus = {
  lead: [
    swing('C5', 'D5', 'F5', 'A5', 'G5', 'F5', 'D5', 'C5'),
    'F5 - - - - - - - A5 - - G5 F5 - - .',
    swing('C5', 'D5', 'F5', 'A5', 'C6', 'A5', 'G5', 'F5'),
    'Eb5 - - - - - - - D5 - - C5 A4 - - .',
    swing('D5', 'F5', 'Bb5', 'D6', 'C6', 'Bb5', 'A5', 'G5'),
    'F5 - - - - - - - D5 - - F5 G5 - - .',
    swing('A5', 'G5', 'F5', 'C5', 'F5', 'A5', 'C6', 'A5'),
    'F#5 - - - - - - - A5 - - F#5 D5 - - .',
    swing('B4', 'D5', 'F5', 'G5', 'B5', 'A5', 'G5', 'F5'),
    'E5 - - - - - - - G5 - - Bb5 C6 - - .',
    swing('A5', 'C6', 'A5', 'F5', 'C5', 'D5', 'F5', 'A5'),
    'C6 - - - - - - - A5 - - F#5 D5 - - .',
    swing('D5', 'F5', 'G5', 'B5', 'D6', 'B5', 'G5', 'F5'),
    'E5 - - G5 Bb5 - - C6 E6 - - C6 Bb5 - - G5',
    'F5 - - - - - - - . . . . C5 - - D5',
    'E5 - - G5 Bb5 - - G5 E5 - - D5 C5 - - .',
  ],
  chords: [F, F2, F, F7, Bb, Bb2, F, D7, G7, C7, F, D7, G7, C7, F, C7],
};

// Kick on one and three, the snare's brush on two and four, the hat
// swung between.
const BEAT = 'k . . h s . . h k . . h s . . h';
const FILL = 'k . . h s . . h k . . s s . s s';
const beat = [BEAT, BEAT, BEAT, FILL];

export const GAMLA_STAN = {
  id: 'gamlastan',
  bpm: 168,
  loopBar: 2,
  instruments: {
    lead: { ...BAND.lead, duty: 0.25, gain: 0.08, decay: 0.3, sustain: 0.45 },
    harmony: { ...BAND.harmony, duty: 0.125, gain: 0.05, decay: 0.05, sustain: 0.1 },
    bass: { ...BAND.bass, gain: 0.27 },
  },
  bars: {
    lead: [...intro.lead, ...chorus.lead],
    harmony: [...intro.harmony, ...chorus.chords.map((chord) => chord.harmony)],
    bass: [...intro.bass, ...chorus.chords.map((chord) => chord.bass)],
    drums: [BEAT, FILL, ...beat, ...beat, ...beat, ...beat],
  },
};
