// The suburb's furniture, there to be looked at: a bus shelter, parked
// police cars, swings, a slide, benches, street lamps, a bin shed, a
// parking sign, a railway station's name board and a runestone, and the
// period's own: a newsstand kiosk, a carpet rack, a mailbox, a bike rack,
// a moped, a Volvo, an election hut (the parties' or the 1980
// referendum's), a milk stand, a flagpole and a shopping trolley; and
// Tungelsta IF's football goal and banner. Each is written into a
// level as one character in the tile it stands on the bottom of, its left
// edge at the tile's left edge; it is drawn behind everyone and stops
// nothing. A named piece (the name board) shows the level's
// `stationName`. Pure: no DOM.
export const SCENERY = {
  busStop: { char: '1', width: 48, height: 40 },
  policeCar: { char: '2', width: 48, height: 22 },
  swings: { char: '3', width: 40, height: 32 },
  slide: { char: '4', width: 40, height: 32 },
  bench: { char: '5', width: 24, height: 16 },
  streetLamp: { char: '6', width: 12, height: 56 },
  binShed: { char: '7', width: 32, height: 24 },
  parkingSign: { char: '8', width: 12, height: 32 },
  stationSign: { char: '9', width: 128, height: 40, named: true },
  runestone: { char: '0', width: 16, height: 28 },
  // Every digit is taken, so the period's pieces use what is left; each
  // is as tall as its sheet's drawing.
  kiosk: { char: 'J', width: 40, height: 36 },
  carpetRack: { char: '+', width: 32, height: 24 },
  mailbox: { char: 'j', width: 10, height: 28 },
  bikeRack: { char: '&', width: 40, height: 15 },
  moped: { char: '<', width: 28, height: 17 },
  volvo: { char: 'z', width: 48, height: 21 },
  electionHut: { char: '(', width: 32, height: 32 },
  referendumHut: { char: ')', width: 32, height: 32 },
  milkStand: { char: '*', width: 20, height: 16 },
  flagpole: { char: 'l', width: 12, height: 64 },
  trolley: { char: '/', width: 18, height: 16 },
  footballGoal: { char: 'ê', width: 64, height: 32 },
  clubBanner: { char: 'ë', width: 80, height: 32 },
};

// Level character to scenery type.
export const SCENERY_CHARS = Object.fromEntries(Object.entries(SCENERY).map(([type, piece]) => [piece.char, type]));

// Where a piece written at col, row is drawn: its top left corner; a
// named piece carries its text.
export function createScenery(type, col, row, tile, text = null) {
  const piece = SCENERY[type];
  if (!piece) throw new Error(`Unknown scenery type '${type}'`);
  const placed = { type, x: col * tile, y: (row + 1) * tile - piece.height, w: piece.width, h: piece.height };
  return piece.named ? { ...placed, text } : placed;
}
