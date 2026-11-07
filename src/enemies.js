// The people Blenke is sent after, as data: each one's level character,
// size, speed, points and what it carries, and the slogans the ideologue
// shouts. How they move and attack is in ai.js. Pure: no DOM.
//
// The points are the satire again: putting a "dangerous citizen" out of
// action scores a tenth of a crumb of cannabis, and the stoner, who harms
// nobody, counts like the rest.
export const ENEMIES = {
  // Barely moves, harms no one, and now and then drops a sample.
  stoner: {
    char: 'S',
    width: 12,
    height: 20,
    speed: 5,
    points: 50,
    harmless: true,
    carries: 'sampleCup',
    drops: 3,
    dropEvery: 6,
  },
  // Runs from Blenke when he comes near, with the evidence in his pocket.
  dealer: {
    char: 'D',
    width: 10,
    height: 21,
    speed: 20,
    fleeSpeed: 115,
    fleeRange: 112,
    points: 100,
    carries: 'possession',
  },
  // Dances about where the mood takes them; they come in colours.
  partyPerson: {
    char: 'P',
    width: 10,
    height: 21,
    speed: 70,
    hop: 250,
    points: 100,
    carries: 'sampleCup',
    variants: 3,
  },
  // Stands his ground and throws paperwork, which flutters.
  bureaucrat: {
    char: 'Y',
    width: 10,
    height: 22,
    speed: 0,
    points: 100,
    throws: 'paper',
    throwEvery: 2.2,
    range: 200,
    carries: 'paperwork',
  },
  // Walks between experiments and lobs test tubes at Blenke.
  technician: {
    char: 'L',
    width: 10,
    height: 22,
    speed: 25,
    points: 100,
    throws: 'tube',
    throwEvery: 2.6,
    range: 170,
    carries: 'sampleJar',
  },
  // Paces and shouts slogans, and the shouting carries.
  ideologue: {
    char: 'I',
    width: 10,
    height: 22,
    speed: 35,
    points: 100,
    throws: 'shout',
    throwEvery: 3.2,
    range: Infinity,
    carries: null,
  },
};

export const SLOGANS = [
  'NOLLTOLERANS!',
  'ETT NARKOTIKAFRITT SAMHÄLLE!',
  'HÅRDARE TAG!',
  'KNARK ÄR KNARK!',
  'INGA FLUMMIGA EXPERIMENT!',
  'FLER PROV, FÄRRE FRÅGOR!',
];

// Level character to enemy type.
export const ENEMY_CHARS = Object.fromEntries(Object.entries(ENEMIES).map(([type, enemy]) => [enemy.char, type]));

// An enemy stands on the bottom of the tile it is written in, in the
// middle, facing left: towards Blenke, who comes from the left. index
// counts the enemies of its type before it, and picks its colours.
export function createEnemy(type, col, row, tile, index = 0) {
  const enemy = ENEMIES[type];
  if (!enemy) throw new Error(`Unknown enemy type '${type}'`);
  const x = (col + 0.5) * tile - enemy.width / 2;
  const y = (row + 1) * tile - enemy.height;
  return {
    type,
    x,
    y,
    px: x,
    py: y,
    w: enemy.width,
    h: enemy.height,
    vx: 0,
    vy: 0,
    facing: -1,
    onGround: false,
    // Seeds the enemy's own random numbers, so each behaves differently
    // but the same every time.
    seed: ((col + 1) * 73856093) ^ ((row + 1) * 19349663) || 1,
    variant: enemy.variants ? index % enemy.variants : 0,
    // Counts towards turning round or, for the party people, a change of
    // mind; attackTimer towards the next throw or shout.
    timer: 0,
    attackTimer: 0,
    // The party people's wandering: which way, and at what share of speed.
    dir: 0,
    speedShare: 1,
    // Counts down while it throws or shouts, and while a slogan shows.
    acting: 0,
    saying: null,
    sayTime: 0,
    slogan: 0,
    dropsLeft: enemy.drops ?? 0,
    dropTimer: 0,
    walkTime: 0,
    defeated: false,
    defeatedTime: 0,
  };
}
