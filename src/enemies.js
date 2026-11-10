// The people Blenke is sent after, as data: each one's level character,
// size, speed, points and what it carries, the slogans the ideologue
// shouts and what the prosecutor says. How they move and attack is in
// ai.js. Pure: no DOM.
//
// The points are the satire again: putting a "dangerous citizen" out of
// action scores a tenth of a crumb of cannabis, the stoner, who harms
// nobody, counts like the rest, and the prosecutor himself is worth half
// of what his whole case is about.
//
// The subcultures (from the hippie on) are flagged by a `sign`, what the
// police's old brochure "Tecken på narkotikamissbruk" told officers to
// look for, shown when one is put out of action. Any enemy can have
// `lines`, said in turn when Blenke comes within `talkRange`, and a
// `sway`, how many frames a second it plays standing still.
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
  // The miniboss: waits in his courtroom until Blenke comes, then lobs
  // thick binders of charges at him and sends documents skimming along
  // the floor. It takes `health` stomps (or cones), and each makes him
  // angrier. The evidence falls out when he is beaten.
  prosecutor: {
    char: 'R',
    width: 14,
    height: 30,
    speed: 30,
    points: 500,
    health: 3,
    boss: true,
    throws: 'binder',
    throwEvery: 1.8,
    range: 260,
    wakeRange: 190,
    carries: 'possession',
  },
  // Wanders slowly and now and then sits down to play the guitar. Near
  // him everything is mellow: Blenke walks slower. Harmless otherwise.
  hippie: {
    char: 'f',
    width: 10,
    height: 21,
    speed: 12,
    points: 50,
    harmless: true,
    carries: 'herbalTea',
    sitEvery: 5,
    sitTime: 3,
    strumEvery: 0.75,
    mellow: { range: 56, speed: 0.6 },
    sign: 'LÅNGT HÅR',
    lines: ['PEACE, KONSTAPELN!', 'ALLT ÄR KÄRLEK'],
    talkRange: 80,
  },
  // Headbangs on the spot to his cassette player. When Blenke comes near
  // he stage-dives at him in a long arc, then gets up and bangs on.
  headbanger: {
    char: 'x',
    width: 10,
    height: 22,
    speed: 0,
    points: 100,
    carries: 'cassette',
    sway: 4,
    diveRange: 96,
    diveLift: 300,
    diveFlight: 0.6,
    diveSpeed: 160,
    diveRest: 2.5,
    sign: 'LYSSNAR PÅ HÅRDROCK',
    lines: ['HÅRDROCK ÄR INGET BROTT!', 'SPELA BAKLÄNGES: TA DET LUGNT'],
    talkRange: 140,
  },
  // Pogos: bounces high on the spot and, when the music takes her,
  // sideways. Her mohawk is sharp: landing on her on the way up hurts.
  punk: {
    char: 'N',
    width: 10,
    height: 22,
    speed: 45,
    points: 100,
    carries: 'fanzine',
    pogoLift: 280,
    pogoWait: 0.15,
    sideways: 0.35,
    spikyRising: true,
    sign: 'SÄKERHETSNÅLAR',
    lines: ['INGEN FRAMTID!', 'STAT OCH KAPITAL!'],
    talkRange: 120,
  },
  // Moves like a machine, a beat walking and a beat standing, and plays
  // arpeggios that leave his keytar as square waves, stepping up and down.
  synth: {
    char: 'y',
    width: 10,
    height: 22,
    speed: 30,
    jerk: 0.3,
    points: 100,
    throws: 'wave',
    throwEvery: 2.4,
    range: 200,
    carries: 'floppy',
    sign: 'SVART SMINK',
    lines: ['SYNTAR ÄR INGEN DROG!', 'JAG ÄR EN MASKIN'],
    talkRange: 140,
  },
  // Spins on his back and head on a piece of cardboard, his legs flying:
  // landing on him then hurts too. Between spins he freezes in a pose,
  // and only then can he be stomped.
  breakdancer: {
    char: 'e',
    width: 12,
    height: 20,
    speed: 15,
    points: 100,
    carries: 'mixtape',
    sway: 10,
    spinTime: 2.2,
    freezeTime: 1.3,
    freezeLine: 'FRYS!',
    spikySpinning: true,
    sign: 'KEPS',
    lines: ['DET HÄR ÄR KULTUR!'],
    talkRange: 120,
  },
  // Dances, hopping as she goes, and lobs glow sticks towards Blenke. They
  // hurt nobody: they lie glowing and show what is hidden near them.
  raver: {
    char: 'o',
    width: 10,
    height: 21,
    speed: 25,
    hop: 220,
    hopEvery: 0.7,
    points: 100,
    throws: 'glowStick',
    throwEvery: 2,
    range: 180,
    carries: 'waterBottle',
    sign: 'VISSELPIPA',
    lines: ['VI DANSAR BARA!', 'HÄMTA VATTEN, KONSTAPELN!'],
    talkRange: 120,
  },
  // Stands in the shadows, unseen until Blenke comes close; then he fades
  // in and drifts slowly towards him, and fades again once Blenke has
  // gone. Unseen, he can neither hurt nor be hurt.
  goth: {
    char: 'n',
    width: 10,
    height: 22,
    speed: 18,
    points: 100,
    hidden: true,
    appearRange: 72,
    vanishRange: 130,
    fadeTime: 0.5,
    carries: 'candle',
    sign: 'KLÄR SIG I SVART',
    lines: ['LIVET ÄR MÖRKT', 'DU STÖR MIN SORG'],
    talkRange: 72,
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

// What the prosecutor says: as he wakes, as he attacks (in turn) and as
// he is hit.
export const PROSECUTOR_LINES = {
  wake: 'ÅTAL VÄCKS!',
  attack: [
    'RINGA NARKOTIKABROTT!',
    'BEVISNINGEN: 0,01 GRAM!',
    'STRAFFSKALAN ÄR TYDLIG!',
    'SAMHÄLLET KRÄVER DET!',
  ],
  hit: ['INVÄNDNING!', 'JAG BEGÄR UPPSKOV!'],
};

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
    // The hits it takes before it is defeated; after one it is stunned,
    // and neither hurts nor can be hurt, for hitTime.
    health: enemy.health ?? 1,
    hitTime: 0,
    // A boss waits until Blenke comes; attacks counts its attacks.
    awake: !enemy.boss,
    attacks: 0,
    defeated: false,
    defeatedTime: 0,
    // Which of its lines it says next, and how long until it talks again.
    talk: 0,
    talkWait: 0,
    // What it is doing, where that is more than walking (the headbanger's
    // dive), and how long it has been doing it (the hippie walking before
    // he sits down, the headbanger resting before he dives again).
    state: null,
    stateTime: 0,
    // How much of it can be seen, 0 to 1: the goth starts unseen.
    shown: enemy.hidden ? 0 : 1,
  };
}
