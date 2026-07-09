/* ==========================================================================
   CountRegistry — everyday countable objects for the counting game (and
   future games like bubbles / color hunt). Same pattern as AnimalRegistry.
   Names are PLURAL and article-free ("trois pommes", "drie appels"), since
   the counting prompt always asks for 2 or more.
   Image: assets/images/objects/<id>.png  (falls back to emoji if missing)
   ========================================================================== */

const CountRegistry = (() => {
  const OBJECTS = [
    { id: 'apple',      emoji: '🍎', tint: '#F3D9D2', name: { fr: 'pommes',   nl: 'appels',       en: 'apples' } },
    { id: 'banana',     emoji: '🍌', tint: '#F5E9C6', name: { fr: 'bananes',  nl: 'bananen',      en: 'bananas' } },
    { id: 'orange',     emoji: '🍊', tint: '#F6E0C8', name: { fr: 'oranges',  nl: 'sinaasappels', en: 'oranges' } },
    { id: 'strawberry', emoji: '🍓', tint: '#F3D3D3', name: { fr: 'fraises',  nl: 'aardbeien',    en: 'strawberries' } },
    { id: 'star',       emoji: '⭐', tint: '#F6EBCB', name: { fr: 'étoiles',  nl: 'sterren',      en: 'stars' } },
    { id: 'flower',     emoji: '🌼', tint: '#EFEAD6', name: { fr: 'fleurs',   nl: 'bloemen',      en: 'flowers' } },
    { id: 'fish',       emoji: '🐟', tint: '#D9E7F0', name: { fr: 'poissons', nl: 'visjes',       en: 'fish' } },
    { id: 'leaf',       emoji: '🍃', tint: '#E1EBDB', name: { fr: 'feuilles', nl: 'blaadjes',     en: 'leaves' } },
  ];

  const known = new Set();   // ids whose image file was confirmed to exist
  const missing = new Set();

  /** Build the .art element: <img> if the file exists, emoji otherwise. */
  function artFor(obj) {
    const div = document.createElement('div');
    div.className = 'art';
    div.style.setProperty('--tint', obj.tint);
    div.textContent = obj.emoji; // fallback shown immediately

    if (!missing.has(obj.id)) {
      const img = document.createElement('img');
      img.alt = '';
      img.src = `assets/images/objects/${obj.id}.png`;
      img.onload = () => { div.textContent = ''; div.appendChild(img); known.add(obj.id); };
      img.onerror = () => { missing.add(obj.id); };
      if (known.has(obj.id)) { div.textContent = ''; div.appendChild(img); }
    }
    return div;
  }

  function nameOf(obj) { return obj.name[I18N.lang]; }

  /** One random object (all copies in a round share the same type). */
  function pick() { return OBJECTS[Math.floor(Math.random() * OBJECTS.length)]; }

  return { all: OBJECTS, artFor, nameOf, pick };
})();
