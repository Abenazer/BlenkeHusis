// The asset factory's sprite sheets (../../gameassetfactory, delivered to
// assets/sprites/ and listed in its delivered.json): which of the game's
// pictures each one replaces, and how to read its description, a
// TexturePacker "JSON hash". What isn't delivered is drawn in code
// (src/art/), and so is anything whose sheet fails to load. Pure: no DOM;
// main.js loads the files.

export const SPRITES_PATH = 'assets/sprites';
export const MANIFEST = 'delivered.json';

export const PLAYER_SPRITE = 'player';
// The checkpoint: a phone booth, dark until Blenke passes, then lit.
export const CHECKPOINT_SPRITE = 'checkpoint';
// The goal: a flagpole, its flag waving.
export const GOAL_SPRITE = 'goal';
// Delivered props, each named after the prop it draws (PROPS in
// src/props.js), and the signpost Blenke reads.
export const PROP_SPRITES = ['cone'];
export const SIGN_SPRITE = 'sign';
// Delivered tiles, by the level character each one draws.
export const TILE_SPRITES = {
  ground_grass: '#',
  brick: 'B',
  concrete: 'Z',
  asphalt: 'A',
  tape: '=',
  pipe: 'O',
  balcony: '-',
  plank: '_',
  water: '~',
  slime: '%',
  syringes: '^',
  puddle: ',',
  crate: '?',
  crate_open: '!',
  gate: '|',
  room: ';',
};
// Delivered pieces laid side by side or stacked: a moving platform's
// tile-wide piece and a leaking pipe's tile-high stream.
export const PLATFORM_SPRITE = 'platform';
export const LEAK_SPRITE = 'leak';
// Delivered enemies, by the type (ENEMIES in src/enemies.js) and colour
// variant each one draws: the party people's three are a sheet each.
export const ENEMY_SPRITES = {
  stoner: { type: 'stoner', variant: 0 },
  dealer: { type: 'dealer', variant: 0 },
  party_person_1: { type: 'partyPerson', variant: 0 },
  party_person_2: { type: 'partyPerson', variant: 1 },
  party_person_3: { type: 'partyPerson', variant: 2 },
  bureaucrat: { type: 'bureaucrat', variant: 0 },
  technician: { type: 'technician', variant: 0 },
  ideologue: { type: 'ideologue', variant: 0 },
  prosecutor: { type: 'prosecutor', variant: 0 },
};
// What is still drawn only in code, waiting to be ordered from the
// factory: the subcultures (by enemy type) and what they carry and throw
// (by item and projectile type). A test holds every other enemy, item and
// projectile to a sheet of its own, and these to none yet.
export const AWAITING = {
  enemies: ['hippie'],
  items: ['herbalTea'],
  projectiles: [],
};
// Delivered projectiles, each named after the type it draws (PROJECTILES
// in src/projectiles.js).
export const PROJECTILE_SPRITES = ['paper', 'tube', 'binder', 'brief', 'shout'];
// Delivered collectibles and power-ups, by the item each one draws (ITEMS
// in src/items.js); the HUD's icons for samples, possession and the
// power-up at work are the same pictures.
export const ITEM_SPRITES = {
  sample_cup: 'sampleCup',
  sample_jar: 'sampleJar',
  sample_canister: 'sampleCanister',
  possession: 'possession',
  bag: 'bag',
  empty_can: 'emptyCan',
  spoon: 'spoon',
  test_tube: 'testTube',
  coffee: 'coffee',
  paperwork: 'paperwork',
  directive: 'directive',
  money: 'money',
  police_coffee: 'policeCoffee',
  paperwork_shield: 'paperworkShield',
  mandatory_testing: 'mandatoryTesting',
  budget_increase: 'budgetIncrease',
  super_bladder: 'superBladder',
  helicopter: 'helicopter',
};
// Delivered HUD icons: each sheet's frames, by the icon each one draws
// (HUD_ICONS in src/art/items.js), placed by their top left.
export const HUD_SPRITES = {
  lives: { lives: 'lives' },
  health: { full: 'health', lost: 'healthLost' },
};
// Delivered power-up effects, by the effect each one draws (EFFECT_ART in
// src/art/effects.js); the swollen sample bag is `sample_bag`, since `bag`
// is the carrier-bag item.
export const EFFECT_SPRITES = { rotor: 'rotor', steam: 'steam', shield: 'shield', note: 'note', sample_bag: 'bag', sparkle: 'sparkle' };
// Delivered citizens, each named after the type it draws (CITIZENS in
// src/citizens.js).
export const CITIZEN_SPRITES = ['pensioner'];
// The police station past the goal: its house and the filling pump, by
// the part each one draws (STATION_ART in src/art/station.js); the game
// draws the gauge's needle and the hose itself.
export const STATION_SPRITES = { station_house: 'house', pump: 'pump' };
// Delivered scenery, by the piece each one draws (SCENERY in
// src/scenery.js).
export const SCENERY_SPRITES = {
  bus_stop: 'busStop',
  police_car: 'policeCar',
  swings: 'swings',
  slide: 'slide',
  bench: 'bench',
  street_lamp: 'streetLamp',
  bin_shed: 'binShed',
  parking_sign: 'parkingSign',
};
// Delivered backdrop layers, each named after the layer it draws
// (BACKGROUND_LAYERS in src/art/backgrounds.js).
// The landmark far off on the horizon, behind the flats (HORIZON in
// src/art/backgrounds.js); only drawn when delivered.
export const HORIZON_SPRITE = 'horizon';
export const BACKGROUND_SPRITES = ['sky', 'clouds', 'flats', 'gardens'];

// The sheets a manifest lists, one per sprite, each with its picture and
// its description: [{ sprite, category, image, description }], paths
// relative to SPRITES_PATH. A sprite missing either file is refused.
export function deliveredSheets(manifest) {
  const sheets = new Map();
  for (const { sprite, path } of manifest.files) {
    const sheet = sheets.get(sprite) ?? { sprite, category: path.split('/')[0], image: null, description: null };
    if (path.endsWith('.png')) sheet.image = path;
    else if (path.endsWith('.json')) sheet.description = path;
    sheets.set(sprite, sheet);
  }
  for (const sheet of sheets.values()) {
    if (!sheet.image || !sheet.description) throw new Error(`Sprite '${sheet.sprite}' is delivered without its picture or description`);
  }
  return [...sheets.values()];
}

// Each frame's rectangle on the sheet and its origin (the point it is
// placed by, from its top left corner), in pixels:
// { name: { x, y, w, h, originX, originY } }.
export function sheetFrames(description) {
  return Object.fromEntries(
    Object.entries(description.frames).map(([name, { frame, origin }]) => [
      name,
      { x: frame.x, y: frame.y, w: frame.w, h: frame.h, originX: origin.x, originY: origin.y },
    ]),
  );
}

function framesStarting(description, prefix) {
  return Object.keys(description.frames).filter((name) => name.startsWith(`${prefix}_`));
}

// A tile sheet as the renderer uses a tile: the frame names for its top
// and for its fill, and fps when they are frames to play rather than
// variants by place. A sheet with only a top look ("one look, top and
// fill") uses it under solid tiles too.
export function tileLook(description, solid) {
  const animations = description.animations ?? {};
  const top = animations.top ?? framesStarting(description, 'top');
  const ownFill = animations.fill ?? framesStarting(description, 'fill');
  if (top.length === 0) throw new Error(`Tile sheet '${description.meta.sprite}' has no top frames`);
  const fill = ownFill.length > 0 ? ownFill : solid ? top : undefined;
  const fps = description.meta.playback?.top?.fps;
  return fps ? { top, fill, fps } : { top, fill };
}

// A backdrop sheet's one frame, named after its layer.
export function backgroundFrame(description) {
  const frame = sheetFrames(description)[description.meta.sprite];
  if (!frame) throw new Error(`Background sheet '${description.meta.sprite}' has no frame named after it`);
  return frame;
}

// A character sheet's animations (name to frame names, in playing order)
// and their playback ({ fps, loop }), as animation.js plays them.
export function characterLook(description) {
  return { animations: description.animations, playback: description.meta.playback };
}

// An enemy's sheet as the renderer uses it: the frames it plays as it
// moves, the one it shows throwing or shouting (null if it does neither)
// and the one it shows defeated.
export function enemyLook(description) {
  const { move, act, defeated } = description.animations ?? {};
  if (!move?.length || !defeated?.length) throw new Error(`Enemy sheet '${description.meta.sprite}' needs a move and a defeated animation`);
  return { move, act: act?.[0] ?? null, defeated: defeated[0] };
}

// A projectile's sheet as the renderer uses it: the frames it plays as it
// flies, at fps.
export function projectileLook(description) {
  return playedAnimation(description, 'fly', 'Projectile');
}

// One animation's frames and the rate they are played at, refused if
// either is missing; kind names the sheet in the error.
function playedAnimation(description, animation, kind) {
  const frames = description.animations?.[animation];
  if (!frames?.length) throw new Error(`${kind} sheet '${description.meta.sprite}' needs a ${animation} animation`);
  const fps = description.meta.playback?.[animation]?.fps;
  if (!(fps > 0)) throw new Error(`${kind} sheet '${description.meta.sprite}' has no playback for ${animation}`);
  return { frames, fps };
}

// A sheet with one look (a piece of scenery, the horizon's landmark): the
// frame the renderer cuts.
export function onlyFrame(description) {
  const names = Object.keys(description.frames);
  if (names.length !== 1) throw new Error(`Sheet '${description.meta.sprite}' needs one frame, has ${names.length}`);
  return names[0];
}

// The checkpoint's sheet as the renderer uses it: the frame it shows
// unlit, and the frames it plays lit, at fps.
export function checkpointLook(description) {
  const { unlit, lit } = description.animations ?? {};
  if (!unlit?.length || !lit?.length) throw new Error(`Checkpoint sheet '${description.meta.sprite}' needs an unlit and a lit animation`);
  const fps = description.meta.playback?.lit?.fps;
  if (!(fps > 0)) throw new Error(`Checkpoint sheet '${description.meta.sprite}' has no playback for lit`);
  return { unlit: unlit[0], lit, fps };
}

// The goal's sheet as the renderer uses it: the frames its flag waves
// through, at fps.
export function goalLook(description) {
  return playedAnimation(description, 'wave', 'Goal');
}

// A citizen's sheet as the renderer uses it: standing, and waving while
// it pleads, each with its frames and fps.
export function citizenLook(description) {
  return { stand: playedAnimation(description, 'stand', 'Citizen'), wave: playedAnimation(description, 'wave', 'Citizen') };
}

// An effect's sheet as the renderer uses it: its one animation's frames
// at its fps, or a still effect's one frame.
export function effectLook(description) {
  const animations = Object.keys(description.animations ?? {});
  if (animations.length > 1) throw new Error(`Effect sheet '${description.meta.sprite}' has more than one animation`);
  if (animations.length === 1) return playedAnimation(description, animations[0], 'Effect');
  return { frames: [onlyFrame(description)], fps: 1 };
}

// The leak's sheet as the renderer uses it: the frames its stream runs
// through, at fps, every stacked piece showing the same one.
export function leakLook(description) {
  return playedAnimation(description, 'run', 'Leak');
}
