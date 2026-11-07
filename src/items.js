// What Lelle collects: urine samples in three sizes, minor possession,
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
  // Hidden: not drawn until Lelle comes close.
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
// that brushes an item takes it.
const INSET = 2;

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
    collected: false,
    revealed: !item.hidden,
  };
}

export function overlaps(a, b) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}
