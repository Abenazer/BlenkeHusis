// What Blenke collects: urine samples in three sizes, minor possession,
// evidence and bonus items. Each is written into a level as one character,
// like a tile. Pure data and no DOM.
//
// The points are the satire: a hundredth of a gram outscores any amount of
// actual police work, and a big jar counts as several samples, because the
// statistics are what matter.
export const ITEMS = {
  sampleCup: {
    char: 'u',
    category: 'sample',
    points: 10,
    samples: 1,
    messages: [],
  },
  sampleJar: {
    char: 'U',
    category: 'sample',
    points: 50,
    samples: 5,
    messages: [
      'URINPROV SÄKRAT. SAMHÄLLET ÄR TRYGGARE.',
      'STORT PROV. STOR INSATS. STORT TACK.',
    ],
  },
  // Hidden: not drawn until Blenke comes close.
  sampleCanister: {
    char: 'h',
    category: 'sample',
    points: 200,
    samples: 20,
    hidden: true,
    messages: ['HEMLIGT FYND! EN HEL DUNK. STATISTIKEN JUBLAR.'],
  },
  possession: {
    char: 'p',
    category: 'possession',
    points: 1000,
    samples: 0,
    messages: [
      'HOTNIVÅ: 0,02 GRAM.',
      'PRESTATION UPPLÅST: NARKOTIKAFRITT KVARTER!',
      'BESLAG: 0,01 GRAM. PRESSKONFERENS INKALLAD.',
      'HOTNIVÅ: 0,03 GRAM. NYTT REKORD!',
    ],
  },
  bag: {
    char: 'b',
    category: 'evidence',
    points: 250,
    samples: 0,
    messages: ['BEVIS SÄKRAT: EN PLASTPÅSE. MISSTANKEN STÄRKS.'],
  },
  emptyCan: {
    char: 'c',
    category: 'evidence',
    points: 250,
    samples: 0,
    messages: ['EN TOM BURK. VAD HAR DEN INNEHÅLLIT?'],
  },
  spoon: {
    char: 's',
    category: 'evidence',
    points: 250,
    samples: 0,
    messages: ['EN SKED. SKICKAS PÅ ANALYS.'],
  },
  testTube: {
    char: 't',
    category: 'evidence',
    points: 250,
    samples: 0,
    messages: ['MISSTÄNKT LABBUTRUSTNING. KEMILÄRAREN FÖRHÖRS.'],
  },
  coffee: {
    char: 'k',
    category: 'bonus',
    points: 50,
    samples: 0,
    messages: ['POLISKAFFE. ARBETSMORALEN ÅTERSTÄLLD.'],
  },
  paperwork: {
    char: 'r',
    category: 'bonus',
    points: 100,
    samples: 0,
    messages: ['BLANKETT 47B IFYLLD I TRE EXEMPLAR.'],
  },
  directive: {
    char: 'd',
    category: 'bonus',
    points: 150,
    samples: 0,
    messages: ['NYTT DIREKTIV: FLER PROV, SAMMA RESULTAT.'],
  },
  money: {
    char: '$',
    category: 'bonus',
    points: 300,
    samples: 0,
    messages: ['SKATTEPENGAR VÄL ANVÄNDA.'],
  },
};

// Level character to item type.
export const ITEM_CHARS = Object.fromEntries(Object.entries(ITEMS).map(([type, item]) => [item.char, type]));

// The part of its tile an item can be picked up from: most of it, so a jump
// that brushes an item takes it. An item is drawn standing on the bottom of
// that tile.
export const INSET = 2;

export function createItem(type, col, row, tile) {
  const item = ITEMS[type];
  if (!item) throw new Error(`Unknown item type '${type}'`);
  return {
    type,
    col,
    row,
    x: col * tile + INSET,
    y: row * tile + INSET,
    w: tile - 2 * INSET,
    h: tile - 2 * INSET,
    px: col * tile + INSET,
    py: row * tile + INSET,
    collected: false,
    revealed: !item.hidden,
    // Items bob where they rest, each a little out of step with the next.
    phase: col * 0.15,
    falling: false,
    vx: 0,
    vy: 0,
  };
}

// An item an enemy drops: tossed from x, y (its middle) and falling until
// it lands.
export function createDroppedItem(type, x, y, vx, vy, tile) {
  const item = createItem(type, 0, 0, tile);
  item.x = x - item.w / 2;
  item.y = y - item.h / 2;
  item.px = item.x;
  item.py = item.y;
  item.col = Math.floor(x / tile);
  item.row = Math.floor(y / tile);
  item.phase = x / tile * 0.15;
  item.revealed = true;
  item.falling = true;
  item.vx = vx;
  item.vy = vy;
  return item;
}

export function overlaps(a, b) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}
