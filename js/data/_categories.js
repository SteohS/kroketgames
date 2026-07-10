/* ==========================================================================
   Content — the content-category taxonomy shown in the parent config picker.
   Each category names a data registry and lists which games can render it.
   The chosen registry is injected into a game via opts.category (see app.js).

   Adding a category = new js/data/<id>.js (item registry) + one line here.
   A category with `hasSound` items (via its registry) enables sound-only games
   like animal-sounds; soundless categories (fruit) simply don't list them.

   Loads AFTER every registry and BEFORE app.js (see index.html).
   ========================================================================== */

const Content = (() => {
  const CATEGORIES = [
    { id: 'animals', icon: '🐮', registry: AnimalRegistry,
      games: ['counting', 'free-play', 'peekaboo', 'animal-sounds'] },
    { id: 'fruit',   icon: '🍓', registry: FruitRegistry,
      games: ['counting', 'free-play', 'peekaboo'] },
    { id: 'shapes',  icon: '🔷', registry: ShapeRegistry,
      games: ['shapes'] },
    { id: 'colors',  icon: '🎨', registry: ColorRegistry,
      games: ['color-hunt'] },
  ];

  function get(id) { return CATEGORIES.find(c => c.id === id) || null; }

  /** Categories that a given game can render (reverse of the games[] lists). */
  function categoriesForGame(gameId) {
    return CATEGORIES.filter(c => c.games.includes(gameId));
  }

  return { all: CATEGORIES, get, categoriesForGame };
})();
