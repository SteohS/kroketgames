/* ==========================================================================
   ShapeRegistry — procedurally drawn shapes (inline SVG), zero assets.
   Same pattern as AnimalRegistry: names include the article for spoken
   prompts ("Où est LE rond ?").
   ========================================================================== */

const ShapeRegistry = (() => {
  // Slightly stronger pastels than the UI palette, for figure/ground contrast
  const COLORS = ['#8FB886', '#7FA8C9', '#E8C25C', '#E58A6B', '#A98FC4'];

  const SHAPES = [
    {
      id: 'circle',
      name: { fr: 'le rond', nl: 'de cirkel', en: 'the circle' },
      svg: c => `<circle cx="50" cy="50" r="38" fill="${c}"/>`,
    },
    {
      id: 'square',
      name: { fr: 'le carré', nl: 'het vierkant', en: 'the square' },
      svg: c => `<rect x="14" y="14" width="72" height="72" rx="12" fill="${c}"/>`,
    },
    {
      id: 'triangle',
      name: { fr: 'le triangle', nl: 'de driehoek', en: 'the triangle' },
      svg: c => `<path d="M50 14 L88 82 L12 82 Z" fill="${c}" stroke="${c}"
                   stroke-width="12" stroke-linejoin="round"/>`,
    },
    {
      id: 'star',
      name: { fr: "l'étoile", nl: 'de ster', en: 'the star' },
      svg: c => `<path d="M50 10 L60.5 36.5 L89 38.5 L67 56.5 L74 84 L50 68.5
                   L26 84 L33 56.5 L11 38.5 L39.5 36.5 Z" fill="${c}" stroke="${c}"
                   stroke-width="8" stroke-linejoin="round"/>`,
    },
    {
      id: 'heart',
      name: { fr: 'le cœur', nl: 'het hartje', en: 'the heart' },
      svg: c => `<path d="M50 86 C22 62 10 45 10 31 C10 18 20 10 31 10
                   C39 10 46 14 50 22 C54 14 61 10 69 10 C80 10 90 18 90 31
                   C90 45 78 62 50 86 Z" fill="${c}"/>`,
    },
  ];

  /** Build the .art element containing the shape as inline SVG. */
  function artFor(shape, color) {
    const div = document.createElement('div');
    div.className = 'art';
    div.style.setProperty('--tint', 'transparent');
    div.innerHTML =
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
        style="width:78%;height:78%">${shape.svg(color)}</svg>`;
    return div;
  }

  function nameOf(shape) { return shape.name[I18N.lang]; }

  /** n distinct random shapes, each paired with a distinct color. */
  function pick(n) {
    const pool = [...SHAPES];
    const colors = [...COLORS].sort(() => Math.random() - 0.5);
    const out = [];
    while (out.length < n && pool.length) {
      const shape = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      out.push({ shape, color: colors[out.length % colors.length] });
    }
    return out;
  }

  return { all: SHAPES, artFor, nameOf, pick };
})();
