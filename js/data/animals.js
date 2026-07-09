/* ==========================================================================
   AnimalRegistry — shared across games (quiz, free-play, feeding, ...).
   Names include the article, since prompts speak full phrases
   ("Où est LA vache ?", "Waar is DE koe?").
   Image: assets/images/animals/<id>.png  (falls back to emoji if missing)
   Sound: assets/audio/animals/<id>.mp3   (falls back to TTS onomatopoeia)
   ========================================================================== */

const AnimalRegistry = (() => {
  const ANIMALS = [
    { id: 'cow',     emoji: '🐮', tint: '#EFE6D2', name: { fr: 'la vache',   nl: 'de koe',    en: 'the cow' } },
    { id: 'duck',    emoji: '🦆', tint: '#DCE9F2', name: { fr: 'le canard',  nl: 'de eend',   en: 'the duck' } },
    { id: 'dog',     emoji: '🐶', tint: '#F2E4D8', name: { fr: 'le chien',   nl: 'de hond',   en: 'the dog' } },
    { id: 'cat',     emoji: '🐱', tint: '#EDE3EE', name: { fr: 'le chat',    nl: 'de kat',    en: 'the cat' } },
    { id: 'sheep',   emoji: '🐑', tint: '#E8EEE4', name: { fr: 'le mouton',  nl: 'het schaap', en: 'the sheep' } },
    { id: 'rooster', emoji: '🐓', tint: '#F6EBD6', name: { fr: 'le coq',     nl: 'de haan',   en: 'the rooster' } },
    { id: 'horse',   emoji: '🐴', tint: '#EFE1D4', name: { fr: 'le cheval',  nl: 'het paard', en: 'the horse' } },
    { id: 'pig',     emoji: '🐷', tint: '#F6E3E0', name: { fr: 'le cochon',  nl: 'het varken', en: 'the pig' } },
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

  function nameOf(animal) { return animal.name[I18N.lang]; }

  /** n distinct random animals, first one is the "target" by convention. */
  function pick(n) {
    const pool = [...ANIMALS];
    const out = [];
    while (out.length < n && pool.length) {
      out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return out;
  }

  return { all: ANIMALS, artFor, nameOf, pick };
})();
