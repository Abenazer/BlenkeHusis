// How a backdrop layer is drawn cheaply, without changing a pixel: its rows
// in bands. A row that is one opaque colour all the way across looks the
// same however far the layer has slid sideways, so a band of such rows is
// filled across the view in one go (the sky's colours, the lawn, the foot
// of the flats). The other rows are drawn tile-wide column by column, as
// before, but a column with nothing in it is skipped (most of the clouds
// and the horizon). Filling and skipping matter at a large canvas, where
// every scaled picture costs the browser in proportion to its area.
// Pure: no DOM; the page passes in the layer's pixels.

// Which layers each backdrop shows, by name (BACKGROUND_LAYERS and HORIZON
// in src/art/backgrounds.js), so a level's backdrop fits its place and its
// years. A level names its own (its `backdrop`), or shows the suburb's.
export const BACKDROPS = {
  // The suburb as it is now, the Globe on the horizon.
  suburb: ['sky', 'clouds', 'horizon', 'flats', 'gardens'],
  // The suburb before the Globe was built (1986–89).
  seventies: ['sky', 'clouds', 'flats', 'gardens'],
  // Red cottages and trees, no blocks of flats.
  countryside: ['sky', 'clouds', 'gardens'],
};
export const DEFAULT_BACKDROP = 'suburb';

function colourAt(data, index) {
  const hex = (value) => value.toString(16).padStart(2, '0');
  return `#${hex(data[index])}${hex(data[index + 1])}${hex(data[index + 2])}`;
}

// The row's one colour, if every pixel in it is that colour and opaque.
function uniformColour(data, width, row) {
  const start = row * width * 4;
  if (data[start + 3] !== 255) return null;
  for (let x = 1; x < width; x++) {
    const index = start + x * 4;
    for (let channel = 0; channel < 4; channel++) if (data[index + channel] !== data[start + channel]) return null;
  }
  return colourAt(data, start);
}

// Which tile-wide columns have anything in rows from..to (to excluded).
function columnsUsed(data, width, from, to, columnWidth) {
  const used = [];
  for (let column = 0; column < width / columnWidth; column++) {
    let any = false;
    for (let row = from; row < to && !any; row++) {
      for (let x = column * columnWidth; x < (column + 1) * columnWidth && !any; x++) {
        if (data[(row * width + x) * 4 + 3] !== 0) any = true;
      }
    }
    used.push(any);
  }
  return used;
}

// data: the layer's RGBA pixels, row by row (as getImageData gives them).
// Returns its bands, top to bottom: { from, to, colour } to fill (rows
// from..to, to excluded, a '#rrggbb' colour), or { from, to, columns } to
// draw in columns, columns[i] saying whether column i has anything in it.
export function backdropBands(data, width, height, columnWidth) {
  const bands = [];
  for (let row = 0; row < height; row++) {
    const colour = uniformColour(data, width, row);
    const last = bands.at(-1);
    if (last && last.to === row && last.colour === colour) last.to = row + 1;
    else bands.push({ from: row, to: row + 1, colour });
  }
  return bands.map((band) => (band.colour
    ? band
    : { from: band.from, to: band.to, columns: columnsUsed(data, width, band.from, band.to, columnWidth) }));
}
