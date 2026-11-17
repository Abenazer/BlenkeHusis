// Sergels torg's song: trip-hop in C minor, slow under the city at night,
// a broken beat, a deep bass that holds and pushes, slow chords and a
// sparse tune that hangs on its notes. Two bars of the beat and the bass,
// then sixteen that loop: down on Plattan, then up again towards the
// lights.
import { BAND } from './band.js';

const Cm = { harmony: 'G3 - - - Eb4 - - -', bass: 'C2 - - - - - . C2 . . G1 - - - . .' };
const Ab = { harmony: 'Ab3 - - - C4 - - -', bass: 'Ab1 - - - - - . Ab1 . . Eb2 - - - . .' };
const Fm = { harmony: 'F3 - - - Ab3 - - -', bass: 'F1 - - - - - . F1 . . C2 - - - . .' };
const G = { harmony: 'G3 - - - B3 - - -', bass: 'G1 - - - - - . G1 . . D2 - - - B1 -' };

const intro = { lead: ['.', '.'], harmony: ['.', '.'], bass: [Cm.bass, G.bass] };

const plattan = {
  lead: [
    'G5 - - - - - - - Eb5 - - - F5 - G5 -',
    'C5 - - - - - - - - - - - . . . .',
    'Ab5 - - - - - - - G5 - - - F5 - Eb5 -',
    'F5 - - - - - - - . . . . . . . .',
    'G5 - - - - - Bb5 - C6 - - - Bb5 - G5 -',
    'Eb5 - - - - - - - - - - - . . . .',
    'D5 - - - Eb5 - - - F5 - - - G5 - - -',
    'B4 - - - - - - - D5 - - - . . . .',
  ],
  chords: [Cm, Cm, Ab, Fm, Cm, Cm, Fm, G],
};

const lights = {
  lead: [
    'C6 - - - - - - - Bb5 - - - G5 - - -',
    'Ab5 - - - - - - - - - - - G5 - F5 -',
    'G5 - - - - - - - . . . . Eb5 - F5 -',
    'G5 - - - - - - - - - - - . . . .',
    'Eb6 - - - D6 - - - C6 - - - Bb5 - - -',
    'Ab5 - - - - - - - F5 - - - Ab5 - - -',
    'G5 - - - - - - - F5 - - - Eb5 - - -',
    'D5 - - - - - - - B4 - - - . . . .',
  ],
  chords: [Ab, Ab, Cm, Cm, Ab, Fm, Cm, G],
};

// The broken beat: the kick late, the snare on two and four.
const BEAT = 'k . h . s . h k . h k . s . h h';
const OPEN = 'k . h . s . h k . h k . s . o .';
const FILL = 'k . h . s . h k . s k . s s s s';
const beat = [BEAT, OPEN, BEAT, OPEN, BEAT, OPEN, BEAT, FILL];

const sections = [plattan, lights];
const chords = sections.flatMap((section) => section.chords);

export const SERGEL = {
  id: 'sergel',
  bpm: 84,
  loopBar: 2,
  instruments: {
    lead: { ...BAND.lead, duty: 0.25, gain: 0.08, decay: 0.4, sustain: 0.6, release: 0.08 },
    harmony: { ...BAND.harmony, duty: 0.5, gain: 0.03, attack: 0.04, decay: 0.2, sustain: 0.6, release: 0.06 },
    bass: { ...BAND.bass, gain: 0.3 },
  },
  bars: {
    lead: [...intro.lead, ...sections.flatMap((section) => section.lead)],
    harmony: [...intro.harmony, ...chords.map((chord) => chord.harmony)],
    bass: [...intro.bass, ...chords.map((chord) => chord.bass)],
    drums: [BEAT, FILL, ...beat, ...beat],
  },
};
