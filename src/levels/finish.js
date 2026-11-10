// How every level of the game ends: a last few samples, the goal's pole
// and, a short walk on, the police station's filling station, where
// Blenke pours what he carries. Written as a level's last section, so the
// ending is the same in every level, whatever comes before it and in
// whichever order the levels are played. The goal stands on the row above
// the ground's three rows.
const ROW_WITH_GOAL = '...uuuu.6...G....M..2...';
const GROUND = '########################';
const SKY = '.'.repeat(ROW_WITH_GOAL.length);

// The section for a level `height` rows high.
export function finish(height) {
  return [...Array(height - 4).fill(SKY), ROW_WITH_GOAL, GROUND, GROUND, GROUND];
}
