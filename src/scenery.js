// The suburb's furniture, there to be looked at: a bus shelter, parked
// police cars, swings, a slide, benches, street lamps, a bin shed, a
// parking sign, a railway station's name board and a runestone, and the
// period's own: a newsstand kiosk, a carpet rack, a mailbox, a bike rack,
// a moped, a Volvo, an election hut (the parties' or the 1980
// referendum's), a milk stand, a flagpole and a shopping trolley;
// Tungelsta IF's football goal and banner; and a club's velvet rope.
// Each stands in a level's cast, on the bottom of the tile at its column
// and row, its left edge at the tile's left edge; it is drawn behind everyone and stops nothing. A
// named piece (the name board) shows the level's `stationName`. Pure: no
// DOM.
export const SCENERY = {
  busStop: { width: 48, height: 40 },
  policeCar: { width: 48, height: 22 },
  swings: { width: 40, height: 32 },
  slide: { width: 40, height: 32 },
  bench: { width: 24, height: 16 },
  // Its lamp lights a pool round its foot in a dark passage (darkness.js).
  streetLamp: { width: 12, height: 56, light: { x: 7, y: 32, inner: 18, outer: 50 } },
  binShed: { width: 32, height: 24 },
  parkingSign: { width: 12, height: 32 },
  stationSign: { width: 128, height: 40, named: true },
  runestone: { width: 16, height: 28 },
  // The period's pieces, each as tall as its sheet's drawing.
  kiosk: { width: 40, height: 36 },
  carpetRack: { width: 32, height: 24 },
  mailbox: { width: 10, height: 28 },
  bikeRack: { width: 40, height: 15 },
  moped: { width: 28, height: 17 },
  volvo: { width: 48, height: 21 },
  electionHut: { width: 32, height: 32 },
  referendumHut: { width: 32, height: 32 },
  milkStand: { width: 20, height: 16 },
  flagpole: { width: 12, height: 64 },
  trolley: { width: 18, height: 16 },
  footballGoal: { width: 64, height: 32 },
  clubBanner: { width: 80, height: 32 },
  // The sign on the roof of Fornborgs Färg och Parfym in Skogås centrum,
  // its orange castle tower by the name.
  fornborgSign: { width: 96, height: 32 },
  // The velvet rope at a club's door on Stureplan, drawn in code until
  // delivered (art/velvetrope.js).
  velvetRope: { width: 40, height: 16 },
};

// Where a piece standing at col, row is drawn: its top left corner; a
// named piece carries its text.
export function createScenery(type, col, row, tile, text = null) {
  const piece = SCENERY[type];
  if (!piece) throw new Error(`Unknown scenery type '${type}'`);
  const placed = { type, x: col * tile, y: (row + 1) * tile - piece.height, w: piece.width, h: piece.height };
  return piece.named ? { ...placed, text } : placed;
}
