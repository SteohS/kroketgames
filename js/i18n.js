/* ==========================================================================
   i18n — every user-facing / spoken string lives here.
   Games call I18N.t('key', {name}) or I18N.praise().
   ========================================================================== */

const I18N = (() => {
  const STRINGS = {
    fr: {
      menuTitle: 'Petits jeux',
      voiceLabel: 'Voix',
      limitLabel: 'Questions',
      creditsLabel: 'Crédits',
      creditsTitle: 'Crédits & sources',
      creditsClose: 'Fermer',
      surpriseTitle: 'Surprise !',
      allDone: 'C’est fini ! Bravo !',
      games: {
        'shapes': 'Les formes',
        'animal-sounds': 'Les animaux',
        'counting': 'Compter',
        'free-play': 'La ferme',
        'color-hunt': 'Les couleurs',
      },
      whereIs: ({ name }) => `Où est ${name} ?`,
      countPrompt: ({ n, name }) => `Touche ${n} ${name} !`,
      colorPrompt: ({ adj }) => `Trouve le ballon ${adj} !`,
      numbers: { 1: 'un', 2: 'deux', 3: 'trois', 4: 'quatre', 5: 'cinq' },
      praise: ['Bravo !', 'Super !', 'Oui, c\u2019est ça !', 'Très bien !'],
      // Spoken onomatopoeia fallback when no audio file exists for an animal
      animalSoundWords: {
        cow: 'Meuh, meuh !', duck: 'Coin coin !', dog: 'Ouaf ouaf !',
        cat: 'Miaou !', sheep: 'Bêêê !', chicken: 'Cot cot cot !',
        horse: 'Hiii hiii !', pig: 'Groin groin !',
      },
    },
    nl: {
      menuTitle: 'Spelletjes',
      voiceLabel: 'Stem',
      limitLabel: 'Vragen',
      creditsLabel: 'Bronnen',
      creditsTitle: 'Bronnen & credits',
      creditsClose: 'Sluiten',
      surpriseTitle: 'Verrassing!',
      allDone: 'Klaar! Goed gedaan!',
      games: {
        'shapes': 'De vormen',
        'animal-sounds': 'De dieren',
        'counting': 'Tellen',
        'free-play': 'De boerderij',
        'color-hunt': 'De kleuren',
      },
      whereIs: ({ name }) => `Waar is ${name}?`,
      countPrompt: ({ n, name }) => `Tik op ${n} ${name}!`,
      colorPrompt: ({ adj }) => `Vind de ${adj} ballon!`,
      numbers: { 1: 'één', 2: 'twee', 3: 'drie', 4: 'vier', 5: 'vijf' },
      praise: ['Goed zo!', 'Super!', 'Ja, juist!', 'Heel goed!'],
      animalSoundWords: {
        cow: 'Boe, boe!', duck: 'Kwak kwak!', dog: 'Woef woef!',
        cat: 'Miauw!', sheep: 'Bèèè!', chicken: 'Tok tok tok!',
        horse: 'Hinnik hinnik!', pig: 'Knor knor!',
      },
    },
    en: {
      menuTitle: 'Mini Games',
      voiceLabel: 'Voice',
      limitLabel: 'Questions',
      creditsLabel: 'Credits',
      creditsTitle: 'Credits & sources',
      creditsClose: 'Close',
      surpriseTitle: 'Surprise!',
      allDone: 'All done! Well done!',
      games: {
        'shapes': 'Shapes',
        'animal-sounds': 'Animals',
        'counting': 'Counting',
        'free-play': 'The farm',
        'color-hunt': 'Colors',
      },
      whereIs: ({ name }) => `Where is ${name}?`,
      countPrompt: ({ n, name }) => `Tap ${n} ${name}!`,
      colorPrompt: ({ adj }) => `Find the ${adj} balloon!`,
      numbers: { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five' },
      praise: ['Well done!', 'Great job!', 'Yes, that\u2019s it!', 'Wonderful!'],
      animalSoundWords: {
        cow: 'Moo, moo!', duck: 'Quack quack!', dog: 'Woof woof!',
        cat: 'Meow!', sheep: 'Baa baa!', chicken: 'Cluck cluck!',
        horse: 'Neigh neigh!', pig: 'Oink oink!',
      },
    },
  };

  let lang = localStorage.getItem('lang') || 'fr';

  return {
    get lang() { return lang; },
    setLang(l) {
      if (STRINGS[l]) {
        lang = l;
        localStorage.setItem('lang', l);
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
