/* ==========================================================================
   AnimalRegistry — a content category (see js/data/_categories.js).
   `name` includes the article for "find" prompts ("Où est LA vache ?");
   `plural` is article-free for the counting game ("trois vaches").
   Image: assets/images/animals/<id>.png  (falls back to emoji if missing)
   Sound: assets/audio/animals/<id>.mp3   (silent if the file is missing)
   ========================================================================== */

const AnimalRegistry = (() => {
  const ANIMALS = [
    { id: 'cow',     emoji: '🐮', tint: '#EFE6D2',
      name: { fr: 'la vache',   nl: 'de koe',     en: 'the cow' },     plural: { fr: 'vaches',     nl: 'koeien',    en: 'cows' } },
    { id: 'duck',    emoji: '🦆', tint: '#DCE9F2',
      name: { fr: 'le canard',  nl: 'de eend',    en: 'the duck' },    plural: { fr: 'canards',    nl: 'eenden',    en: 'ducks' } },
    { id: 'dog',     emoji: '🐶', tint: '#F2E4D8',
      name: { fr: 'le chien',   nl: 'de hond',    en: 'the dog' },     plural: { fr: 'chiens',     nl: 'honden',    en: 'dogs' } },
    { id: 'cat',     emoji: '🐱', tint: '#EDE3EE',
      name: { fr: 'le chat',    nl: 'de kat',     en: 'the cat' },     plural: { fr: 'chats',      nl: 'katten',    en: 'cats' } },
    { id: 'sheep',   emoji: '🐑', tint: '#E8EEE4',
      name: { fr: 'le mouton',  nl: 'het schaap', en: 'the sheep' },   plural: { fr: 'moutons',    nl: 'schapen',   en: 'sheep' } },
    { id: 'rooster', emoji: '🐓', tint: '#F6EBD6',
      name: { fr: 'le coq',     nl: 'de haan',    en: 'the rooster' }, plural: { fr: 'coqs',       nl: 'hanen',     en: 'roosters' } },
    { id: 'horse',   emoji: '🐴', tint: '#EFE1D4',
      name: { fr: 'le cheval',  nl: 'het paard',  en: 'the horse' },   plural: { fr: 'chevaux',    nl: 'paarden',   en: 'horses' } },
    { id: 'pig',     emoji: '🐷', tint: '#F6E3E0',
      name: { fr: 'le cochon',  nl: 'het varken', en: 'the pig' },     plural: { fr: 'cochons',    nl: 'varkens',   en: 'pigs' } },
    { id: 'monkey',  emoji: '🐵', tint: '#F0E6D8',
      name: { fr: 'le singe',   nl: 'de aap',     en: 'the monkey' },  plural: { fr: 'singes',     nl: 'apen',      en: 'monkeys' } },
    { id: 'lion',    emoji: '🦁', tint: '#F5E9CE',
      name: { fr: 'le lion',    nl: 'de leeuw',   en: 'the lion' },    plural: { fr: 'lions',      nl: 'leeuwen',   en: 'lions' } },
    { id: 'elephant',emoji: '🐘', tint: '#E6E9EE',
      name: { fr: "l'éléphant", nl: 'de olifant', en: 'the elephant' },plural: { fr: 'éléphants',  nl: 'olifanten', en: 'elephants' } },
    { id: 'bird',    emoji: '🐦', tint: '#DEEAF0',
      name: { fr: "l'oiseau",   nl: 'de vogel',   en: 'the bird' },    plural: { fr: 'oiseaux',    nl: 'vogels',    en: 'birds' } },
    { id: 'frog',    emoji: '🐸', tint: '#E4EFDD',
      name: { fr: 'la grenouille', nl: 'de kikker', en: 'the frog' },  plural: { fr: 'grenouilles',nl: 'kikkers',   en: 'frogs' } },
    { id: 'wolf',    emoji: '🐺', tint: '#E4E7EC',
      name: { fr: 'le loup',    nl: 'de wolf',    en: 'the wolf' },    plural: { fr: 'loups',      nl: 'wolven',    en: 'wolves' } },
    { id: 'peacock', emoji: '🦚', tint: '#DCEAE6',
      name: { fr: 'le paon',    nl: 'de pauw',    en: 'the peacock' }, plural: { fr: 'paons',      nl: 'pauwen',    en: 'peacocks' } },
    { id: 'chicken', emoji: '🐔', tint: '#F6EBD6',
      name: { fr: 'la poule',   nl: 'de kip',     en: 'the chicken' }, plural: { fr: 'poules',     nl: 'kippen',    en: 'chickens' } },
  ];

  const known = new Set(); // ids whose image file was confirmed to exist
  const missing = new Set();

  /** Build the .art element: <img> if the file exists, emoji otherwise. */
  function artFor(animal) {
    return RegistryKit.imageArt({
      id: animal.id, emoji: animal.emoji, tint: animal.tint,
      alt: nameOf(animal), dir: 'assets/images/animals', known, missing,
    });
  }

  function nameOf(animal)   { return animal.name[I18N.lang]; }
  function pluralOf(animal) { return animal.plural[I18N.lang]; }

  /** Animals can have a sound: play the mp3 if present, else stay silent. */
  function playSound(animal) { return SoundKit.playSound('animals', animal.id); }

  /** n distinct random animals, first one is the "target" by convention. */
  function pick(n) {
    const pool = [...ANIMALS];
    const out = [];
    while (out.length < n && pool.length) {
      out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return out;
  }

  return { id: 'animals', hasSound: true, all: ANIMALS, artFor, nameOf, pluralOf, pick, playSound };
})();
