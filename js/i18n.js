/* ==========================================================================
   i18n — every user-facing / spoken string lives here.
   Games call I18N.t('key', {name}) or I18N.praise().
   ========================================================================== */

const I18N = (() => {
  const STRINGS = {
    fr: {
      menuTitle: 'Petits jeux',
      voiceLabel: 'Voix',
      surpriseTitle: 'Surprise !',
      games: {
        'shapes': 'Les formes',
        'animal-sounds': 'Les animaux',
      },
      whereIs: ({ name }) => `Où est ${name} ?`,
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
      surpriseTitle: 'Verrassing!',
      games: {
        'shapes': 'De vormen',
        'animal-sounds': 'De dieren',
      },
      whereIs: ({ name }) => `Waar is ${name}?`,
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
      surpriseTitle: 'Surprise!',
      games: {
        'shapes': 'Shapes',
        'animal-sounds': 'Animals',
      },
      whereIs: ({ name }) => `Where is ${name}?`,
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
