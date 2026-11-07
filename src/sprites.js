// The asset factory's sprite sheets (../../gameassetfactory, delivered to
// assets/sprites/ and listed in its delivered.json): which of the game's
// pictures each one replaces, and how to read its description, a
// TexturePacker "JSON hash". What isn't delivered is drawn in code
// (src/art/), and so is anything whose sheet fails to load. Pure: no DOM;
// main.js loads the files.

export const SPRITES_PATH = 'assets/sprites';
export const MANIFEST = 'delivered.json';

export const PLAYER_SPRITE = 'player';
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
};

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

// A character sheet's animations (name to frame names, in playing order)
// and their playback ({ fps, loop }), as animation.js plays them.
export function characterLook(description) {
  return { animations: description.animations, playback: description.meta.playback };
}
