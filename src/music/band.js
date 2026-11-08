// The instruments the songs share, so they sound like one game, and the
// patterns they keep reaching for.

export const BAND = {
  // The tune: a square wave that rings and settles.
  lead: { wave: 'pulse', duty: 0.5, gain: 0.09, attack: 0.003, decay: 0.2, sustain: 0.55, release: 0.02 },
  // Chords and stabs under it: a thinner pulse, quieter.
  harmony: { wave: 'pulse', duty: 0.25, gain: 0.04, attack: 0.003, decay: 0.06, sustain: 0.3, release: 0.02 },
  // The stepped triangle bass.
  bass: { wave: 'triangle', gain: 0.28, attack: 0.003, release: 0.02 },
};

// A bar of eighths alternating two notes (off the beat when offbeat).
export const alternate = (a, b) => `${a} ${b} ${a} ${b} ${a} ${b} ${a} ${b}`;
export const offbeat = (a, b) => `. ${a} . ${b} . ${a} . ${b}`;
// Half a bar each of two chords.
export const offbeatSplit = (a1, b1, a2, b2) => `. ${a1} . ${b1} . ${a2} . ${b2}`;
// Oom on the beat: a root and a fifth as quarter notes.
export const oom = (root, fifth) => `${root} - ${fifth} - ${root} - ${fifth} -`;
export const oomSplit = (root1, fifth1, root2, fifth2) => `${root1} - ${fifth1} - ${root2} - ${fifth2} -`;
