import { PLATFORM_THICKNESS } from './platforms.js';

// The people Blenke is sent after, as data: each one's level character,
// size, speed, points and what it carries, the slogans the ideologue
// shouts and what the bosses say. How they move and attack is in
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
// A level's own boss: the prosecutor's size, pace and range, five hits,
// placed only by a level's cast (no character of its own).
function boss(own) {
  return { char: null, width: 14, height: 30, speed: 30, points: 500, health: 5, boss: true, throwEvery: 1.8, range: 260, wakeRange: 190, ...own };
}

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
  // angrier. The evidence falls out when he is beaten. Every boss fights
  // so (ai.js), with its own `bossLines`, what it throws and, every
  // third attack, what it `skims` along the floor.
  prosecutor: {
    char: 'R',
    width: 14,
    height: 30,
    speed: 30,
    points: 500,
    health: 3,
    boss: true,
    throws: 'binder',
    skims: 'brief',
    throwEvery: 1.8,
    range: 260,
    wakeRange: 190,
    carries: 'possession',
    title: 'ÅKLAGAREN',
    bossLines: {
      wake: 'ÅTAL VÄCKS!',
      attack: ['RINGA NARKOTIKABROTT!', 'BEVISNINGEN: 0,01 GRAM!', 'STRAFFSKALAN ÄR TYDLIG!', 'SAMHÄLLET KRÄVER DET!'],
      hit: ['INVÄNDNING!', 'JAG BEGÄR UPPSKOV!'],
    },
  },
  // Each level's own boss, at its end, behind a gate: the prosecutor's
  // size and fight, five hits each, placed by the level's cast rather
  // than a character of its own.
  teetotaller: boss({
    title: 'LOGENS ORDFÖRANDE',
    throws: 'paper',
    carries: 'emptyCan',
    bossLines: {
      wake: 'LOGEN ÄR SAMLAD!',
      attack: ['AVHÅLLSAMHET!', 'SKRIV PÅ LÖFTET!', 'BLÅ BANDET!', 'INTE EN DROPPE!'],
      hit: ['FÖRBANNAT!', 'JAG BER FÖR DIG!'],
    },
  }),
  drugWarGeneral: boss({
    title: 'GENERALEN',
    throws: 'shout',
    carries: 'money',
    bossLines: {
      wake: 'GIV AKT!',
      attack: ['TOTALKRIG!', 'INGEN RETRÄTT!', 'MER ANSLAG!', 'SEGERN ÄR NÄRA!'],
      hit: ['TAKTISK RETRÄTT!', 'BEGÄR FÖRSTÄRKNING!'],
    },
  }),
  judge: boss({
    title: 'DOMAREN',
    throws: 'binder',
    skims: 'brief',
    carries: 'possession',
    bossLines: {
      wake: 'RÄTTEN ÄR SATT!',
      attack: ['SKYLDIG!', 'FÄNGELSE!', 'PRAXIS ÄR PRAXIS!', 'PRÖVNING AVSLÅS!'],
      hit: ['ORDNING I SALEN!', 'OMRÖSTNING!'],
    },
  }),
  socialSecretary: boss({
    title: 'SOCIALSEKRETERAREN',
    throws: 'paper',
    skims: 'brief',
    carries: 'paperwork',
    bossLines: {
      wake: 'DU ÄR ANMÄLD!',
      attack: ['TVÅNGSVÅRD!', 'FYLL I BLANKETTEN!', 'FÖR DITT EGET BÄSTA!', 'UTREDNING INLEDD!'],
      hit: ['DET BLIR EN ANTECKNING!', 'JAG ÄR BARA FÖRMEDLARE!'],
    },
  }),
  councillor: boss({
    title: 'KOMMUNALRÅDET',
    throws: 'binder',
    carries: 'money',
    bossLines: {
      wake: 'KOMMUNEN ÄR INVIGD!',
      attack: ['NOLLTOLERANS!', 'BESLUTAT I NÄMNDEN!', 'BUDGETEN RÄCKER INTE!', 'KLIPP BANDET!'],
      hit: ['VI TILLSÄTTER EN UTREDNING!', 'BORDLÄGG!'],
    },
  }),
  warden: boss({
    title: 'ANSTALTSCHEFEN',
    throws: 'paper',
    skims: 'brief',
    carries: 'spoon',
    bossLines: {
      wake: 'INLÅSNING!',
      attack: ['VISITATION!', 'URINPROV VARJE DAG!', 'INGA PERMISSIONER!', 'BAKOM GALLER!'],
      hit: ['LARM!', 'RYMNINGSFÖRSÖK!'],
    },
  }),
  radiationInspector: boss({
    title: 'STRÅLSKYDDSINSPEKTÖREN',
    throws: 'tube',
    carries: 'testTube',
    bossLines: {
      wake: 'MÄTNING PÅGÅR!',
      attack: ['FÖR HÖGA VÄRDEN!', 'ALLT TESTAS!', 'PROVET ÄR POSITIVT!', 'STRÅLANDE RESULTAT!'],
      hit: ['MÄTFEL!', 'KALIBRERA OM!'],
    },
  }),
  minister: boss({
    title: 'MINISTERN',
    throws: 'binder',
    skims: 'brief',
    carries: 'directive',
    bossLines: {
      wake: 'REGERINGEN HAR BESLUTAT!',
      attack: ['ETT NARKOTIKAFRITT SAMHÄLLE!', 'PROPOSITIONEN ÄR KLAR!', 'HÅRDARE STRAFF!', 'SVERIGE VISAR VÄGEN!'],
      hit: ['INGEN KOMMENTAR!', 'JAG AVGÅR INTE!'],
    },
  }),
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
  // Cruises slowly back and forth in a big American car, a beer in hand.
  // The car's roof is a `deck` that carries Blenke like a moving
  // platform; its side hurts. He can't be beaten (`unbeatable`): alcohol
  // is the legal drug, and the brochure has nothing on him.
  raggare: {
    char: 'a',
    width: 44,
    height: 18,
    speed: 35,
    paceTime: 6,
    points: 0,
    unbeatable: true,
    deck: { width: 36, above: 0 },
    rideLine: 'SKÅL, KONSTAPELN!',
    lines: ['VI ÄR BARA UTE OCH ÅKER'],
    talkRange: 120,
  },
  // Marches back and forth with a banner held high on a pole, a deck
  // Blenke can ride. Under it she can't be stomped (`stompProof`: landing
  // on her hurts); only a thrown cone beats her.
  proggActivist: {
    char: 'q',
    width: 10,
    height: 22,
    speed: 30,
    points: 100,
    stompProof: true,
    deck: { width: 30, above: 14 },
    carries: 'leaflet',
    sign: 'POLITISKT ENGAGEMANG',
    lines: ['MUSIKEN SKA VARA FRI!', 'VI KRÄVER VÅRD, INTE STRAFF!'],
    talkRange: 140,
  },
  // Rolls fast on his skateboard and ollies over gaps of up to `gapReach`
  // tiles, kerbs a tile high and Blenke; turns at anything bigger, and
  // every `turnEvery` seconds. Stomped, he falls off and his `board` rolls
  // on by itself for a while, a deck Blenke can ride.
  skater: {
    char: 'w',
    width: 12,
    height: 21,
    speed: 110,
    turnEvery: 3,
    ollieLift: 300,
    ollieAhead: 40,
    gapReach: 2,
    points: 100,
    carries: 'sprayCan',
    board: { width: 14, height: 3, speed: 120, friction: 25, time: 3 },
    sign: 'VIDA BYXOR',
    lines: ['SKATEBOARD ÄR FÖRBJUDET HÄR?', 'KOLLA, KONSTAPELN!'],
    talkRange: 120,
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


// Where an enemy's deck (what Blenke can stand on: the raggare's roof) is
// now, centred over it, and how far it moved since it was last placed, to
// carry its rider the same distance.
export function placeDeck(enemy) {
  const { deck } = enemy;
  const above = ENEMIES[enemy.type].deck?.above ?? 0;
  deck.px = deck.x;
  deck.py = deck.y;
  deck.x = enemy.x + enemy.w / 2 - deck.w / 2;
  deck.y = enemy.y - above;
  deck.dx = deck.x - deck.px;
  deck.dy = deck.y - deck.py;
}

// Level character to enemy type.
export const ENEMY_CHARS = Object.fromEntries(Object.entries(ENEMIES).filter(([, enemy]) => enemy.char).map(([type, enemy]) => [enemy.char, type]));

// An enemy stands on the bottom of the tile it is written in, in the
// middle, facing left: towards Blenke, who comes from the left. index
// counts the enemies of its type before it, and picks its colours.
export function createEnemy(type, col, row, tile, index = 0) {
  const enemy = ENEMIES[type];
  if (!enemy) throw new Error(`Unknown enemy type '${type}'`);
  const x = (col + 0.5) * tile - enemy.width / 2;
  const y = (row + 1) * tile - enemy.height;
  const created = {
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
    // What Blenke can stand on, a platform moving with it, or null; and
    // whether he stood on it last step.
    deck: enemy.deck ? { x: 0, y: 0, w: enemy.deck.width, h: PLATFORM_THICKNESS, px: 0, py: 0, dx: 0, dy: 0 } : null,
    ridden: false,
  };
  if (created.deck) {
    placeDeck(created);
    placeDeck(created);
  }
  return created;
}
