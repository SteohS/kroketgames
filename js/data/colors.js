/* ==========================================================================
   ColorRegistry — a set of distinct, toddler-nameable colors, each drawn as
   a balloon (inline SVG, zero assets). Same pattern as ShapeRegistry.
   Two spoken forms per color so all three languages stay grammatical:
     name — standalone, for the success reinforcement ("Rouge !")
     adj  — attributive, for the prompt ("le ballon rouge", "de rode ballon")
   ========================================================================== */

const ColorRegistry = (() => {
  const COLORS = [
    { id: 'red',    hex: '#E4572E', name: { fr: 'Rouge',  nl: 'Rood',   en: 'Red' },    adj: { fr: 'rouge',  nl: 'rode',   en: 'red' } },
    { id: 'blue',   hex: '#4F86C6', name: { fr: 'Bleu',   nl: 'Blauw',  en: 'Blue' },   adj: { fr: 'bleu',   nl: 'blauwe', en: 'blue' } },
    { id: 'yellow', hex: '#F0C244', name: { fr: 'Jaune',  nl: 'Geel',   en: 'Yellow' }, adj: { fr: 'jaune',  nl: 'gele',   en: 'yellow' } },
    { id: 'green',  hex: '#6FA96A', name: { fr: 'Vert',   nl: 'Groen',  en: 'Green' },  adj: { fr: 'vert',   nl: 'groene', en: 'green' } },
    { id: 'orange', hex: '#E8863C', name: { fr: 'Orange', nl: 'Oranje', en: 'Orange' }, adj: { fr: 'orange', nl: 'oranje', en: 'orange' } },
    { id: 'purple', hex: '#9B72C0', name: { fr: 'Violet', nl: 'Paars',  en: 'Purple' }, adj: { fr: 'violet', nl: 'paarse', en: 'purple' } },
  ];

  /** Build the .art element containing a balloon of the given color (SVG). */
  function artFor(color) {
    const div = document.createElement('div');
    div.className = 'art';
    div.style.setProperty('--tint', 'transparent');
    div.innerHTML =
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
        style="width:78%;height:78%">
        <path d="M50 78 C50 78 46 82 50 88 C54 82 50 78 50 78 Z" fill="${color.hex}"/>
        <path d="M50 80 C50 90 44 96 50 100" fill="none" stroke="${color.hex}"
              stroke-width="2.4" stroke-linecap="round" opacity="0.55"/>
        <ellipse cx="50" cy="44" rx="30" ry="36" fill="${color.hex}"/>
        <ellipse cx="40" cy="32" rx="8" ry="12" fill="#FFFFFF" opacity="0.28"/>
      </svg>`;
    return div;
  }

  function nameOf(color) { return color.name[I18N.lang]; }
  function adjOf(color)  { return color.adj[I18N.lang]; }

  /** n distinct random colors. */
  function pick(n) {
    const pool = [...COLORS];
    const out = [];
    while (out.length < n && pool.length) {
      out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return out;
  }

  return { all: COLORS, artFor, nameOf, adjOf, pick };
})();
