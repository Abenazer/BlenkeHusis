// A menu: a list of choices, one of them marked. Up and down move the mark
// (round from the last to the first) past choices that can't be taken
// now; confirm takes the marked one. Pure: no DOM.
import { wasPressed } from './input.js';

// items: [{ id, label, enabled }], enabled true unless given.
export function createMenu(items) {
  const choices = items.map((item) => ({ enabled: true, ...item }));
  const index = choices.findIndex((item) => item.enabled);
  if (index === -1) throw new Error('A menu needs at least one choice that can be taken');
  return { items: choices, index };
}

function move(menu, direction) {
  const count = menu.items.length;
  let index = menu.index;
  do index = (index + direction + count) % count;
  while (!menu.items[index].enabled);
  menu.index = index;
}

// Moves the mark with the step's input. Returns the id of the choice taken,
// or null. A moved mark and a choice taken go into events, for their sounds.
export function updateMenu(menu, input, events = []) {
  const before = menu.index;
  if (wasPressed(input, 'up')) move(menu, -1);
  if (wasPressed(input, 'down')) move(menu, 1);
  if (menu.index !== before) events.push({ type: 'menuMoved' });
  if (!wasPressed(input, 'confirm')) return null;
  const choice = menu.items[menu.index].id;
  events.push({ type: 'menuChosen', choice });
  return choice;
}
