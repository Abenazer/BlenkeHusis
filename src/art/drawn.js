// The characters and what they throw that the asset factory has yet to
// deliver, drawn in code (src/art/) and hung as a delivered sheet would
// be; each goes, with its code, once its sheet is delivered (a test holds
// it so). Pure: no DOM.
import { BOUNCER_ART } from './bouncer.js';
import { BRAT_ART, CORK_ART } from './brat.js';
import { CHESS_PLAYER_ART } from './chess.js';
import { COMMISSIONER_ART } from './commissioner.js';
import { INSPECTOR_ART } from './inspector.js';
import { INSPECTOR_CHIEF_ART } from './inspectorchief.js';
import { NIGHT_WALKER_ART } from './nightwalker.js';
import { SINGER_ART } from './singers.js';
import { PAINT_ART, TAGGER_ART } from './tagger.js';

// By enemy type, one look per variant: { move: [frame], act, defeated },
// each frame { image, originX, originY }, facing right.
export const DRAWN_ENEMIES = {
  tagger: [TAGGER_ART],
  ticketInspector: [INSPECTOR_ART],
  brat: [BRAT_ART],
  bouncer: [BOUNCER_ART],
  socialCommissioner: [COMMISSIONER_ART],
  inspectorChief: [INSPECTOR_CHIEF_ART],
};

// By projectile type: { fps, frames: [frame] }, placed by their middle.
export const DRAWN_PROJECTILES = {
  paint: PAINT_ART,
  cork: CORK_ART,
};

// By citizen type: { stand, wave }, each { frames: [frame], fps }.
export const DRAWN_CITIZENS = {
  chessPlayer: CHESS_PLAYER_ART,
  nightWalker: NIGHT_WALKER_ART,
  ...SINGER_ART,
};
