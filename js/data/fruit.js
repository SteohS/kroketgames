/* ==========================================================================
   FruitRegistry — a content category (see js/data/_categories.js).
   Same item interface as AnimalRegistry, but soundless: `playSound` is a
   resolved no-op, so games that would play a sound simply stay quiet.
   `name` includes the article ("la pomme"); `plural` is article-free
   ("trois pommes"). Image: assets/images/fruit/<id>.png (emoji fallback).
   ========================================================================== */

const FruitRegistry = (() => {
  const FRUIT = [
    { id: 'apple',       emoji: '🍎', tint: '#F3D9D2',
      name: { fr: 'la pomme',       nl: 'de appel',        en: 'the apple' },       plural: { fr: 'pommes',       nl: 'appels',        en: 'apples' } },
    { id: 'banana',      emoji: '🍌', tint: '#F5E9C6',
      name: { fr: 'la banane',      nl: 'de banaan',       en: 'the banana' },      plural: { fr: 'bananes',      nl: 'bananen',       en: 'bananas' } },
    { id: 'orange',      emoji: '🍊', tint: '#F6E0C8',
      name: { fr: "l'orange",       nl: 'de sinaasappel',  en: 'the orange' },      plural: { fr: 'oranges',      nl: 'sinaasappels',  en: 'oranges' } },
    { id: 'strawberry',  emoji: '🍓', tint: '#F3D3D3',
      name: { fr: 'la fraise',      nl: 'de aardbei',      en: 'the strawberry' },  plural: { fr: 'fraises',      nl: 'aardbeien',     en: 'strawberries' } },
    { id: 'kiwi',        emoji: '🥝', tint: '#E2EBCF',
      name: { fr: 'le kiwi',        nl: 'de kiwi',         en: 'the kiwi' },        plural: { fr: 'kiwis',        nl: "kiwi's",        en: 'kiwis' } },
    { id: 'lemon',       emoji: '🍋', tint: '#F5EEC2',
      name: { fr: 'le citron',      nl: 'de citroen',      en: 'the lemon' },       plural: { fr: 'citrons',      nl: 'citroenen',     en: 'lemons' } },
    { id: 'cherry',      emoji: '🍒', tint: '#F1D0D3',
      name: { fr: 'la cerise',      nl: 'de kers',         en: 'the cherry' },      plural: { fr: 'cerises',      nl: 'kersen',        en: 'cherries' } },
    { id: 'peach',       emoji: '🍑', tint: '#F6DDCE',
      name: { fr: 'la pêche',       nl: 'de perzik',       en: 'the peach' },       plural: { fr: 'pêches',       nl: 'perziken',      en: 'peaches' } },
    { id: 'watermelon',  emoji: '🍉', tint: '#EBD3D6',
      name: { fr: 'la pastèque',    nl: 'de watermeloen',  en: 'the watermelon' },  plural: { fr: 'pastèques',    nl: 'watermeloenen', en: 'watermelons' } },
    { id: 'mango',       emoji: '🥭', tint: '#F6E0C0',
      name: { fr: 'la mangue',      nl: 'de mango',        en: 'the mango' },       plural: { fr: 'mangues',      nl: "mango's",       en: 'mangoes' } },
    { id: 'melon',       emoji: '🍈', tint: '#E4EDD0',
      name: { fr: 'le melon',       nl: 'de meloen',       en: 'the melon' },       plural: { fr: 'melons',       nl: 'meloenen',      en: 'melons' } },
    { id: 'grape',       emoji: '🍇', tint: '#E6DCEE',
      name: { fr: 'le raisin',      nl: 'de druif',        en: 'the grape' },       plural: { fr: 'raisins',      nl: 'druiven',       en: 'grapes' } },
    { id: 'pear',        emoji: '🍐', tint: '#E7EBCE',
      name: { fr: 'la poire',       nl: 'de peer',         en: 'the pear' },        plural: { fr: 'poires',       nl: 'peren',         en: 'pears' } },
    { id: 'ananas',      emoji: '🍍', tint: '#F3E7BE',
      name: { fr: "l'ananas",       nl: 'de ananas',       en: 'the pineapple' },   plural: { fr: 'ananas',       nl: 'ananassen',     en: 'pineapples' } },
    { id: 'coconut',     emoji: '🥥', tint: '#EADFD3',
      name: { fr: 'la noix de coco', nl: 'de kokosnoot',   en: 'the coconut' },     plural: { fr: 'noix de coco', nl: 'kokosnoten',    en: 'coconuts' } },
    { id: 'blueberries', emoji: '🫐', tint: '#D9DEEE',
      name: { fr: 'la myrtille',    nl: 'de bosbes',       en: 'the blueberry' },   plural: { fr: 'myrtilles',    nl: 'bosbessen',     en: 'blueberries' } },
  ];

  const known = new Set(); // ids whose image file was confirmed to exist
  const missing = new Set();

  /** Build the .art element: <img> if the file exists, emoji otherwise. */
  function artFor(fruit) {
    return RegistryKit.imageArt({
      id: fruit.id, emoji: fruit.emoji, tint: fruit.tint,
      alt: nameOf(fruit), dir: 'assets/images/fruit', known, missing,
    });
  }

  function nameOf(fruit)   { return fruit.name[I18N.lang]; }
  function pluralOf(fruit) { return fruit.plural[I18N.lang]; }

  /** Uniform card for the find-it game: id, art, spoken prompt, name. */
  function findCard(fruit) {
    return {
      id: fruit.id,
      art: artFor(fruit),
      prompt: I18N.t('whereIs', { name: nameOf(fruit) }),
      name: nameOf(fruit),
    };
  }

  /** Fruit have no sound — stay silent (resolved promise keeps callers happy). */
  function playSound() { return Promise.resolve(); }

  /** n distinct random fruit, first one is the "target" by convention. */
  function pick(n) {
    const pool = [...FRUIT];
    const out = [];
    while (out.length < n && pool.length) {
      out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return out;
  }

  return { id: 'fruit', hasSound: false, all: FRUIT, artFor, nameOf, pluralOf, pick, playSound, findCard };
})();
