// The characters, what they throw and the scenery the asset factory has
// yet to deliver, drawn in code (src/art/) and hung as a delivered sheet would
// be; each goes, with its code, once its sheet is delivered (a test holds
// it so). Pure: no DOM.
import { ANIMAL_ART } from './animals.js';
import { BOUNCER_ART } from './bouncer.js';
import { BRAT_ART, CORK_ART } from './brat.js';
import { BUSKER_ART } from './busker.js';
import { CHESS_PLAYER_ART } from './chess.js';
import { CLUBBER_ART } from './clubber.js';
import { CLUB_KING_ART } from './clubking.js';
import { DANCER_ART } from './dancer.js';
import { COMMISSIONER_ART } from './commissioner.js';
import { CUSTOMS_CHIEF_ART } from './customschief.js';
import { GUARD_CHIEF_ART } from './guardchief.js';
import { INSPECTOR_ART } from './inspector.js';
import { INSPECTOR_CHIEF_ART } from './inspectorchief.js';
import { LICENSING_INSPECTOR_ART } from './licensing.js';
import { NIGHT_BUS_RIDER_ART } from './nightbus.js';
import { NIGHT_WALKER_ART } from './nightwalker.js';
import { RAVE_CHIEF_ART } from './ravechief.js';
import { SINGER_ART } from './singers.js';
import { POLICE_VAN_ART } from './policevan.js';
import { PAINT_ART, TAGGER_ART } from './tagger.js';
import { TOURIST_ART } from './tourist.js';
import { VELVET_ROPE_ART } from './velvetrope.js';

// By enemy type, one look per variant: { move: [frame], act, defeated },
// each frame { image, originX, originY }, facing right.
export const DRAWN_ENEMIES = {
  tagger: [TAGGER_ART],
  ticketInspector: [INSPECTOR_ART],
  brat: [BRAT_ART],
  bouncer: [BOUNCER_ART],
  socialCommissioner: [COMMISSIONER_ART],
  customsChief: [CUSTOMS_CHIEF_ART],
  inspectorChief: [INSPECTOR_CHIEF_ART],
  licensingInspector: [LICENSING_INSPECTOR_ART],
  guardChief: [GUARD_CHIEF_ART],
  clubKing: [CLUB_KING_ART],
  raveChief: [RAVE_CHIEF_ART],
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
  clubber: CLUBBER_ART,
  dancer: DANCER_ART,
  tourist: TOURIST_ART,
  nightBusRider: NIGHT_BUS_RIDER_ART,
  busker: BUSKER_ART,
  ...SINGER_ART,
  ...ANIMAL_ART,
};

// By scenery type: { fps, frames: [frame] }, each placed by its bottom
// left corner.
export const DRAWN_SCENERY = {
  velvetRope: VELVET_ROPE_ART,
  policeVan: POLICE_VAN_ART,
};
