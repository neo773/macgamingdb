import { writeFileSync } from 'node:fs';

const SEEDS = [
  'mac gaming',
  'mac games',
  'best mac games',
  'games for mac',
  'mac compatible games',
  'macbook gaming',
  'm4 mac gaming',
  'apple silicon gaming',
  'crossover mac',
  'parallels gaming',
  'game porting toolkit',
  'mac game performance',
  'macbook air gaming',
  'mac mini gaming',
  'best mac games m4',
  'mac games crossover',
  'mac gaming compatibility',
];

const CATEGORIES = [
  [
    'compatibility-hub',
    /list|wiki|database|compatib|which games|what games|all mac games/i,
  ],
  [
    'chip-landing',
    /\bm[1-5]\b|apple silicon|macbook air|macbook pro|mac mini|mac studio/i,
  ],
  [
    'tool-landing',
    /crossover|parallels|porting toolkit|gptk|whisky|rosetta|wine/i,
  ],
  [
    'best-of-genre',
    /^best |^top |good games|free games|aaa|rpg|fps games|strategy|racing|zombie|horror|multiplayer|co-?op/i,
  ],
  ['store-platform', /steam|epic|app store|apple arcade|gog|battle\.?net/i],
];

const RELEVANT =
  /(mac|macbook|apple silicon|\bm[1-5]\b|crossover|parallels|rosetta|porting toolkit|whisky)/i;
const NOISE =
  /laptop|keyboard|mouse|controller|monitor|chair|desk|headset|price|buy|repair|cheap|macro|\bmace\b|emulator|bootcamp|booster|battery/i;
const GAMING = /game|gaming|play|run/i;

const suggest = async (query) => {
  const url =
    'https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=' +
    encodeURIComponent(query);
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    return (await response.json())[1] ?? [];
  } catch {
    return [];
  }
};

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
const probes = SEEDS.flatMap((seed) => [
  seed,
  ...alphabet.map((letter) => `${seed} ${letter}`),
]);

const frequencies = new Map();
for (let index = 0; index < probes.length; index += 12) {
  const batches = await Promise.all(
    probes.slice(index, index + 12).map(suggest),
  );
  for (const batch of batches) {
    for (const suggestion of batch) {
      const key = suggestion.toLowerCase();
      frequencies.set(key, (frequencies.get(key) ?? 0) + 1);
    }
  }
}

const keywords = [...frequencies.entries()]
  .filter(
    ([keyword]) =>
      RELEVANT.test(keyword) && !NOISE.test(keyword) && GAMING.test(keyword),
  )
  .sort((a, b) => b[1] - a[1]);

const grouped = Object.fromEntries([
  ...CATEGORIES.map(([name]) => [name, []]),
  ['other', []],
]);
for (const [keyword] of keywords) {
  const match = CATEGORIES.find(([, pattern]) => pattern.test(keyword));
  grouped[match ? match[0] : 'other'].push(keyword);
}

const lines = [
  '# MacGamingDB — keyword gap',
  '',
  `Harvested ${new Date().toISOString().slice(0, 10)} from Google Autocomplete (${probes.length} alphabet-soup probes).`,
  `${keywords.length} relevant keywords. These are queries Google actively autocompletes, so real people type them.`,
  '',
  'Regenerate: `node scripts/keyword-gap.mjs`',
  '',
];
for (const [category, list] of Object.entries(grouped)) {
  lines.push(`## ${category} (${list.length})`, '');
  lines.push(...list.map((keyword) => `- ${keyword}`), '');
}

writeFileSync(
  new URL('../docs/keyword-gap.md', import.meta.url),
  lines.join('\n'),
);
console.log(
  `${keywords.length} keywords ->`,
  Object.entries(grouped)
    .map(([c, l]) => `${c}:${l.length}`)
    .join('  '),
);
