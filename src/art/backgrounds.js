// The backdrop's layers: their order, parallax and fill, and where the
// horizon's landmark stands. Each layer repeats sideways and moves by a
// share of the camera's movement (factor), so nearer layers pass faster:
// parallax. Every picture is the factory's sheet (BACKGROUND_SPRITES and
// HORIZON_SPRITE in src/sprites.js). Pure: no DOM.
import { colour } from '../palette.js';

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
export const BACKGROUND_LAYERS = [
  { name: 'sky', factor: 0, top: 0, fill: colour('sky_4') },
  { name: 'clouds', factor: 0.1, top: 6, fill: null },
  { name: 'hanveden', factor: 0.15, top: 74, fill: colour('water_2') },
  { name: 'flats', factor: 0.25, top: 72, fill: colour('grey_5') },
  { name: 'fields', factor: 0.3, top: 100, fill: colour('grass_3') },
  { name: 'gardens', factor: 0.5, top: 120, fill: colour('grass_1') },
];
