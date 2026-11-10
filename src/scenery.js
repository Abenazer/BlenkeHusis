// The suburb's furniture, there to be looked at: a bus shelter, parked
// police cars, swings, a slide, benches, street lamps, a bin shed, a
// parking sign and a railway station's name board. Each is written into a level as one character in the tile
// it stands on the bottom of, its left edge at the tile's left edge; it is
// drawn behind everyone and stops nothing. Pure: no DOM.
export const SCENERY = {
  busStop: { char: '1', width: 48, height: 40 },
  policeCar: { char: '2', width: 48, height: 22 },
  swings: { char: '3', width: 40, height: 32 },
  slide: { char: '4', width: 40, height: 32 },
  bench: { char: '5', width: 24, height: 11 },
  streetLamp: { char: '6', width: 12, height: 56 },
  binShed: { char: '7', width: 32, height: 24 },
  parkingSign: { char: '8', width: 12, height: 32 },
  stationSign: { char: '9', width: 128, height: 40 },
};

// Level character to scenery type.
export const SCENERY_CHARS = Object.fromEntries(Object.entries(SCENERY).map(([type, piece]) => [piece.char, type]));

// Where a piece written at col, row is drawn: its top left corner.
export function createScenery(type, col, row, tile) {
  const piece = SCENERY[type];
  if (!piece) throw new Error(`Unknown scenery type '${type}'`);
  return { type, x: col * tile, y: (row + 1) * tile - piece.height, w: piece.width, h: piece.height };
}
