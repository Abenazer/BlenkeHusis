// Who is placed where, outside the levels' own text: for each level's id,
// the characters in it, each by its type (an enemy in src/enemies.js or a
// citizen in src/citizens.js) and the column it stands in. It stands on
// the highest floor of that column; give it a `row` too where it should
// stand lower down. Moving a character to another level, or taking it out,
// is changing its line here; the level's rows stay as they are.
//
// The subcultures stand in the try-out level, `figurer` (?bana=figurer),
// one after the other; the punk and the headbanger are also written into
// Handen's rows, at Ultrakåken, and the hippie and the synth into
// Tungelsta's, at Gula Villan.
export const CAST = {
  // Each level's own boss, in the middle of the arena before its finish,
  // 14 tiles before the gate. A section put in or taken out before the
  // arena moves the arena, and the boss's column has to move with it
  // (tests/level.test.js holds him to the arena).
  tungelsta: [{ type: 'teetotaller', col: 450 }],
  krigslida: [{ type: 'drugWarGeneral', col: 350 }],
  vasterhaninge: [{ type: 'judge', col: 342 }],
  jordbro: [{ type: 'socialSecretary', col: 422 }],
  handen: [{ type: 'councillor', col: 398 }],
  skogas: [{ type: 'warden', col: 350 }],
  trangsund: [{ type: 'radiationInspector', col: 358 }],
  villastad: [{ type: 'minister', col: 350 }],
  figurer: [
    { type: 'hippie', col: 30 },
    { type: 'headbanger', col: 58 },
    { type: 'punk', col: 86 },
    { type: 'synth', col: 114 },
    { type: 'breakdancer', col: 142 },
    { type: 'raver', col: 168 },
    { type: 'goth', col: 198 },
    { type: 'raggare', col: 230 },
    { type: 'proggActivist', col: 270 },
    { type: 'skater', col: 296 },
  ],
};
