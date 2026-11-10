// Loading the asset factory's delivered sprite sheets in the browser (the
// game's page and the level editor's): the manifest, each sheet's picture
// and description, sorted by what they replace. The rest of the game reads
// them through sprites.js and render.js; this is the only part that
// fetches them.
import {
  BACKGROUND_SPRITES,
  CHECKPOINT_SPRITE,
  CITIZEN_SPRITES,
  deliveredSheets,
  EFFECT_SPRITES,
  ENEMY_SPRITES,
  GOAL_SPRITE,
  HORIZON_SPRITE,
  HUD_SPRITES,
  ITEM_SPRITES,
  LEAK_SPRITE,
  MANIFEST,
  PLATFORM_SPRITE,
  PLAYER_SPRITE,
  PROJECTILE_SPRITES,
  PROP_SPRITES,
  SCENERY_SPRITES,
  SIGN_SPRITE,
  SPRITES_PATH,
  STATION_SPRITES,
  TILE_SPRITES,
} from './sprites.js';

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status} ${response.statusText}`);
  return response.json();
}

async function loadImage(url) {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}

// The asset factory's sheets, by what they replace: { player, checkpoint, goal, sign, platform, leak, props: { type },
// citizens: { type }, station: { part }, effects: { name },
// tiles: { char }, enemies: { type: [by variant] }, projectiles: { type },
// scenery: { type }, backgrounds: { layer }, items: { type }, hud: { sprite },
// horizon }, each
// { description, image }. A
// sheet that fails to load leaves the art drawn in code in its place, so
// the game always runs. base is the way from the page to the repo's root
// ('' for the game, '../' for a page in tools/).
export async function loadSprites(base = '') {
  const sprites = { player: null, checkpoint: null, goal: null, sign: null, platform: null, leak: null, props: {}, citizens: {}, station: {}, effects: {}, tiles: {}, enemies: {}, projectiles: {}, scenery: {}, backgrounds: {}, items: {}, hud: {}, horizon: null };
  let sheets;
  try {
    sheets = deliveredSheets(await fetchJson(`${base}${SPRITES_PATH}/${MANIFEST}`));
  } catch (error) {
    console.warn('No usable sprite delivery; the art is drawn in code', { error });
    return sprites;
  }
  await Promise.all(sheets.map(async (sheet) => {
    try {
      const [description, image] = await Promise.all([
        fetchJson(`${base}${SPRITES_PATH}/${sheet.description}`),
        loadImage(`${base}${SPRITES_PATH}/${sheet.image}`),
      ]);
      if (sheet.sprite === PLAYER_SPRITE) sprites.player = { description, image };
      else if (sheet.sprite === CHECKPOINT_SPRITE) sprites.checkpoint = { description, image };
      else if (sheet.sprite === HORIZON_SPRITE) sprites.horizon = { description, image };
      else if (sheet.sprite === GOAL_SPRITE) sprites.goal = { description, image };
      else if (sheet.sprite === SIGN_SPRITE) sprites.sign = { description, image };
      else if (sheet.sprite === PLATFORM_SPRITE) sprites.platform = { description, image };
      else if (sheet.sprite === LEAK_SPRITE) sprites.leak = { description, image };
      else if (CITIZEN_SPRITES.includes(sheet.sprite)) sprites.citizens[sheet.sprite] = { description, image };
      else if (STATION_SPRITES[sheet.sprite]) sprites.station[STATION_SPRITES[sheet.sprite]] = { description, image };
      else if (EFFECT_SPRITES[sheet.sprite]) sprites.effects[EFFECT_SPRITES[sheet.sprite]] = { description, image };
      else if (PROP_SPRITES.includes(sheet.sprite)) sprites.props[sheet.sprite] = { description, image };
      else if (TILE_SPRITES[sheet.sprite]) sprites.tiles[TILE_SPRITES[sheet.sprite]] = { description, image };
      else if (ENEMY_SPRITES[sheet.sprite]) {
        const { type, variant } = ENEMY_SPRITES[sheet.sprite];
        (sprites.enemies[type] ??= [])[variant] = { description, image };
      } else if (PROJECTILE_SPRITES.includes(sheet.sprite)) sprites.projectiles[sheet.sprite] = { description, image };
      else if (SCENERY_SPRITES[sheet.sprite]) sprites.scenery[SCENERY_SPRITES[sheet.sprite]] = { description, image };
      else if (BACKGROUND_SPRITES.includes(sheet.sprite)) sprites.backgrounds[sheet.sprite] = { description, image };
      else if (ITEM_SPRITES[sheet.sprite]) sprites.items[ITEM_SPRITES[sheet.sprite]] = { description, image };
      else if (HUD_SPRITES[sheet.sprite]) sprites.hud[sheet.sprite] = { description, image };
      else console.info('A delivered sprite the game does not use yet', { sprite: sheet.sprite });
    } catch (error) {
      console.warn(`The sprite sheet '${sheet.sprite}' did not load; it is drawn in code`, { error });
    }
  }));
  return sprites;
}
