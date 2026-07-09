/* ==========================================================================
   RegistryKit — shared helpers for the content registries (animals, objects…).
   Currently just the image-with-emoji-fallback `.art` builder that AnimalRegistry
   and CountRegistry used to duplicate verbatim.
   ========================================================================== */

const RegistryKit = (() => {
  /**
   * Build the `.art` element: an <img> if the file exists, the emoji otherwise.
   * Shows the emoji immediately, then swaps in the image once it loads; on a
   * 404 it marks the id missing so we never retry. `known`/`missing` are the
   * caller's own Sets (per registry), so results are cached across cards.
   */
  function imageArt({ id, emoji, tint, alt, dir, known, missing }) {
    const div = document.createElement('div');
    div.className = 'art';
    div.style.setProperty('--tint', tint);
    div.textContent = emoji; // fallback shown immediately

    if (!missing.has(id)) {
      const img = document.createElement('img');
      // Carries the accessible name once it replaces the emoji (card's only content).
      img.alt = alt;
      img.src = `${dir}/${id}.png`;
      img.onload = () => { div.textContent = ''; div.appendChild(img); known.add(id); };
      img.onerror = () => { missing.add(id); };
      if (known.has(id)) { div.textContent = ''; div.appendChild(img); }
    }
    return div;
  }

  return { imageArt };
})();
