/* ==========================================================================
   i18n — every user-facing / spoken string lives here.
   Games call I18N.t('key', {name}) or I18N.praise().
   ========================================================================== */

const I18N = (() => {
  const STRINGS = {
    fr: {
      menuTitle: 'Petits jeux',
      chooseContent: 'Choisis le thème',
      categories: { animals: 'Les animaux', fruit: 'Les fruits', shapes: 'Les formes', colors: 'Les couleurs' },
      chooseGames: 'Choisis les jeux',
      startLabel: 'Jouer',
      ageBands: { 2: 'Dès 2 ans', 3: 'Dès 3 ans', 4: 'Dès 4 ans' },
      voiceLabel: 'Voix',
      limitLabel: 'Questions',
      creditsLabel: 'Crédits',
      creditsTitle: 'Crédits & sources',
      creditsClose: 'Fermer',
      allDone: 'C’est fini ! Bravo !',
      games: {
        'shapes': 'Les formes',
        'animal-sounds': 'Les sons',
        'counting': 'Compter',
        'free-play': 'Découvre',
        'color-hunt': 'Les couleurs',
        'peekaboo': 'Cache-cache',
      },
      whereIs: ({ name }) => `Où est ${name} ?`,
      countPrompt: ({ n, name }) => `Touche ${n} ${name} !`,
      colorPrompt: ({ adj }) => `Trouve le ballon ${adj} !`,
      discoverPrompt: ({ cat }) => ({ animals: 'Découvre les animaux !', fruit: 'Découvre les fruits !' }[cat] || 'Regarde bien !'),
      peekPrompt: 'Qui se cache ? Touche pour voir !',
      numbers: { 1: 'un', 2: 'deux', 3: 'trois', 4: 'quatre', 5: 'cinq' },
      praise: ['Bravo !', 'Super !', 'Oui, c\u2019est ça !', 'Très bien !'],
    },
    nl: {
      menuTitle: 'Spelletjes',
      chooseContent: 'Kies het thema',
      categories: { animals: 'De dieren', fruit: 'Het fruit', shapes: 'De vormen', colors: 'De kleuren' },
      chooseGames: 'Kies de spelletjes',
      startLabel: 'Spelen',
      ageBands: { 2: 'Vanaf 2 jaar', 3: 'Vanaf 3 jaar', 4: 'Vanaf 4 jaar' },
      voiceLabel: 'Stem',
      limitLabel: 'Vragen',
      creditsLabel: 'Bronnen',
      creditsTitle: 'Bronnen & credits',
      creditsClose: 'Sluiten',
      allDone: 'Klaar! Goed gedaan!',
      games: {
        'shapes': 'De vormen',
        'animal-sounds': 'De geluiden',
        'counting': 'Tellen',
        'free-play': 'Ontdek',
        'color-hunt': 'De kleuren',
        'peekaboo': 'Kiekeboe',
      },
      whereIs: ({ name }) => `Waar is ${name}?`,
      countPrompt: ({ n, name }) => `Tik op ${n} ${name}!`,
      colorPrompt: ({ adj }) => `Vind de ${adj} ballon!`,
      discoverPrompt: ({ cat }) => ({ animals: 'Ontdek de dieren!', fruit: 'Ontdek het fruit!' }[cat] || 'Kijk goed!'),
      peekPrompt: 'Wie verstopt zich? Tik om te kijken!',
      numbers: { 1: 'één', 2: 'twee', 3: 'drie', 4: 'vier', 5: 'vijf' },
      praise: ['Goed zo!', 'Super!', 'Ja, juist!', 'Heel goed!'],
    },
    en: {
      menuTitle: 'Mini Games',
      chooseContent: 'Choose a theme',
      categories: { animals: 'Animals', fruit: 'Fruit', shapes: 'Shapes', colors: 'Colors' },
      chooseGames: 'Choose games',
      startLabel: 'Play',
      ageBands: { 2: 'Age 2+', 3: 'Age 3+', 4: 'Age 4+' },
      voiceLabel: 'Voice',
      limitLabel: 'Questions',
      creditsLabel: 'Credits',
      creditsTitle: 'Credits & sources',
      creditsClose: 'Close',
      allDone: 'All done! Well done!',
      games: {
        'shapes': 'Shapes',
        'animal-sounds': 'Sounds',
        'counting': 'Counting',
        'free-play': 'Discover',
        'color-hunt': 'Colors',
        'peekaboo': 'Peekaboo',
      },
      whereIs: ({ name }) => `Where is ${name}?`,
      countPrompt: ({ n, name }) => `Tap ${n} ${name}!`,
      colorPrompt: ({ adj }) => `Find the ${adj} balloon!`,
      discoverPrompt: ({ cat }) => ({ animals: 'Discover the animals!', fruit: 'Discover the fruit!' }[cat] || 'Take a look!'),
      peekPrompt: 'Who’s hiding? Tap to see!',
      numbers: { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five' },
      praise: ['Well done!', 'Great job!', 'Yes, that\u2019s it!', 'Wonderful!'],
    },
  };

  let lang = localStorage.getItem('lang') || 'fr';
  // Keep the document language in sync so assistive tech matches the spoken one.
  document.documentElement.lang = lang;

  return {
    get lang() { return lang; },
    setLang(l) {
      if (STRINGS[l]) {
        lang = l;
        localStorage.setItem('lang', l);
        document.documentElement.lang = l;
      }
    },
    /** t('whereIs', {name: 'la vache'}) or t('games.animal-sounds') */
    t(key, params = {}) {
      const parts = key.split('.');
      let node = STRINGS[lang];
      for (const p of parts) node = node?.[p];
      if (node === undefined) return key;
      return typeof node === 'function' ? node(params) : node;
    },
    praise() {
      const list = STRINGS[lang].praise;
      return list[Math.floor(Math.random() * list.length)];
    },
    /** BCP-47 tag for speech synthesis */
    speechLang() {
      return { fr: 'fr-FR', nl: 'nl-NL', en: 'en-GB' }[lang];
    },
  };
})();
