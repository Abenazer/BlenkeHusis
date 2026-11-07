// Where world positions land on the screen. Everything is placed by the same
// rule, round((position - camera) * scale), straight into screen pixels:
// things that move together stay exactly together on screen (rounding Lelle
// and the camera separately made him shake a pixel back and forth while
// running), and the view scrolls by a fraction of an art pixel when the game
// is scaled up, instead of in steps of a whole one. Pure: no DOM.

export function toScreen(position, camera, scale) {
  return Math.round((position - camera) * scale);
}
