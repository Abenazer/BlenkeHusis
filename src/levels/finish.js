// How every level of the game ends: a last few samples, the goal's pole
// and, a short walk on, the police station's filling station, where
// Blenke pours what he carries, a street lamp before the goal and a
// police car past the pump. Written as a level's last section, so the
// ending is the same in every level, whatever comes before it and in
// whichever order the levels are played. The goal stands on the row above
// the ground's three rows.
const ROW_WITH_GOAL = '...uuuu.....G....M......';
const GROUND = '########################';
const SKY = '.'.repeat(ROW_WITH_GOAL.length);

// The section for a level `height` rows high.
export function finish(height) {
  return [...Array(height - 4).fill(SKY), ROW_WITH_GOAL, GROUND, GROUND, GROUND];
}

// The lamp and the police vehicle (its world's `vehicle`, the police car
// unless it parks another), which stand in the level's cast, not its
// rows: their places in a level `width` wide and `height` high that ends
// with the finish.
export function finishCast(width, height, vehicle = 'policeCar') {
  const start = width - ROW_WITH_GOAL.length;
  return [
    { type: 'streetLamp', col: start + 8, row: height - 4 },
    { type: vehicle, col: start + 20, row: height - 4 },
  ];
}
