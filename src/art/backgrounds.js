// The backdrop's layers: their order, parallax and fill, and where the
// horizon's landmark stands. Each layer repeats sideways and moves by a
// share of the camera's movement (factor), so nearer layers pass faster:
// parallax. Every picture is the factory's sheet (BACKGROUND_SPRITES and
// HORIZON_SPRITE in src/sprites.js), but those drawn in code until the
// factory delivers them (DRAWN_LAYERS): the city's (art/city.js, batch 23)
// and the small town's low houses (art/lowrise.js). Pure: no DOM.
import { colour } from '../palette.js';
import { CITY_ART } from './city.js';
import { LOWRISE_ART } from './lowrise.js';

// The layers drawn in code, by name.
export const DRAWN_LAYERS = { ...CITY_ART, ...LOWRISE_ART };

// Far off on the horizon, between the clouds and the flats: a landmark from
// the asset factory's sheet (HORIZON_SPRITE; nothing stands in for it in
// code). It stands by its origin on base, below the flats' bottom edge so
// its foot is always behind them, first at x and again every period
// pixels of the layer, far enough apart that it never shows twice at once,
// and moves by factor as a layer does.
export const HORIZON = { name: 'horizon', factor: 0.17, base: 188, x: 168, period: 512 };

// Back to front. top is where the layer's top edge sits on the view when the
// camera is as low as the level lets it go; fill is the colour below the
// layer, for when the view reaches under it (the bottom row of its sheet).
// Every sheet is a whole number of tiles wide, as the page draws layers in
// tile-wide columns.
// A backdrop shows some of them (BACKDROPS in backdrop.js), in this
// order; the first it shows is its sky, still and covering the view.
export const BACKGROUND_LAYERS = [
  { name: 'sky', factor: 0, top: 0, fill: colour('sky_4') },
  { name: 'night_sky', factor: 0, top: 0, fill: colour('blue_2') },
  { name: 'dawn_sky', factor: 0, top: 0, fill: colour('urine_4') },
  { name: 'clouds', factor: 0.1, top: 6, fill: null },
  { name: 'hanveden', factor: 0.15, top: 74, fill: colour('water_2') },
  { name: 'skyline', factor: 0.15, top: 46, fill: colour('ink') },
  { name: 'flats', factor: 0.25, top: 72, fill: colour('grey_5') },
  { name: 'city_blocks', factor: 0.25, top: 72, fill: colour('ink') },
  { name: 'low_flats', factor: 0.25, top: 96, fill: colour('grass_3') },
  { name: 'fields', factor: 0.3, top: 100, fill: colour('grass_3') },
  { name: 'gardens', factor: 0.5, top: 120, fill: colour('grass_1') },
  { name: 'street', factor: 0.5, top: 120, fill: colour('grey_1') },
];
