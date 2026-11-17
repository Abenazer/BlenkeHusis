// The characters and what they throw that the asset factory has yet to
// deliver, drawn in code (src/art/) and hung as a delivered sheet would
// be; each goes, with its code, once its sheet is delivered (a test holds
// it so). Pure: no DOM.
import { BOUNCER_ART } from './bouncer.js';
import { BRAT_ART, CORK_ART } from './brat.js';
import { INSPECTOR_ART } from './inspector.js';
import { PAINT_ART, TAGGER_ART } from './tagger.js';

// By enemy type, one look per variant: { move: [frame], act, defeated },
// each frame { image, originX, originY }, facing right.
export const DRAWN_ENEMIES = {
  tagger: [TAGGER_ART],
  ticketInspector: [INSPECTOR_ART],
  brat: [BRAT_ART],
  bouncer: [BOUNCER_ART],
};

// By projectile type: { fps, frames: [frame] }, placed by their middle.
export const DRAWN_PROJECTILES = {
  paint: PAINT_ART,
  cork: CORK_ART,
};
