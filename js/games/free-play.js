/* ==========================================================================
   Game: Free-play animal board ("La ferme")
   A calm grid of every animal. Tapping any one plays its sound and then
   speaks its name — pure exploration, no quiz, no wrong answers, no confetti.
   Each tap counts as one "answer", so the game still honors rolling mode and
   the session limit: after `opts.rounds` taps it calls opts.onCycleComplete()
   (see app.js). stop() silences it immediately.
   ========================================================================== */

(() => {
  let container = null;
  let opts = {};
  let tapCount = 0;
  let busy = false;   // true once the leg/session cap is hit — ignore later taps
  let alive = false;  // false once the game is stopped

  function build() {
    container.innerHTML = '';
    const board = document.createElement('div');
    board.className = 'animal-board fade-in';
    AnimalRegistry.all.forEach(animal => {
      const tile = document.createElement('button');
      tile.className = 'board-tile';
      tile.appendChild(AnimalRegistry.artFor(animal));
      tile.addEventListener('click', () => onTap(tile, animal));
      board.appendChild(tile);
    });
    container.appendChild(board);
  }

  function pop(el) {
    el.classList.remove('count-pop');
    void el.offsetWidth; // restart animation
    el.classList.add('count-pop');
  }

  async function onTap(tile, animal) {
    if (busy || !alive) return;
    pop(tile);
    tapCount++;

    // Did this tap reach the rolling-leg / session cap? Rotate after the sound
    // so the child always hears the animal they just tapped. busy is set now
    // (synchronously, before awaiting) so no later tap can double-fire it.
    const done = opts.rounds && tapCount >= opts.rounds && opts.onCycleComplete;
    if (done) busy = true;

    await SoundKit.playAnimal(animal.id);
    if (!alive) return;
    await SoundKit.speak(AnimalRegistry.nameOf(animal));
    if (!alive) return;

    if (done) opts.onCycleComplete();
  }

  Games.register({
    id: 'free-play',
    icon: '🐾',
    age: 2,
    start(el, o = {}) {
      container = el;
      opts = o;
      tapCount = 0;
      busy = false;
      alive = true;
      build();
    },
    stop() {
      alive = false;
      busy = false;
    },
  });
})();
