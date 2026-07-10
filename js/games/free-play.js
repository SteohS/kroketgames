/* ==========================================================================
   Game: Discover the animals ("Découvre")
   A calm round of THREE animals with a spoken question at the top
   ("Découvre les animaux !"). Tapping an animal speaks its name and then plays
   its sound (if the category has one) — pure exploration, no quiz, no wrong
   answers, no confetti. Works with any item category (animals, fruit, …).
   Once all three have been discovered a fresh trio slides in.
   A completed trio counts as ONE "answer" (discovering 3 animals is one round),
   so the game honors rolling mode and the session limit: after `opts.rounds`
   completed trios it calls opts.onCycleComplete() (see app.js). stop() silences
   it immediately.
   ========================================================================== */

(() => {
  const CARD_COUNT = 3;
  const kit = GameKit.session();
  let container = null;
  let opts = {};
  let R = null;            // the content category (registry) for this session
  let roundCount = 0;      // completed trios this session (the "answer" count)
  let remaining = 0;       // animals not yet discovered in the current trio
  let busy = false;        // true while a transition is pending or the cap is hit

  function promptText() {
    return I18N.t('discoverPrompt', { cat: R.id });
  }

  async function playPrompt() {
    if (!kit.alive) return;
    await SoundKit.speak(promptText());
  }

  function newTrio() {
    if (!kit.alive) return;
    busy = false;
    remaining = CARD_COUNT;

    const picked = R.pick(CARD_COUNT);

    container.innerHTML = '';
    const bar = GameKit.promptBar(promptText(), () => { if (!busy) playPrompt(); });

    const row = document.createElement('div');
    row.className = 'card-row fade-in';
    picked.forEach(animal => {
      const card = document.createElement('button');
      card.className = 'animal-card';
      card.appendChild(R.artFor(animal));
      card.addEventListener('click', () => onTap(card, animal, row));
      row.appendChild(card);
    });

    container.append(bar, row);
    playPrompt();
  }

  async function onTap(card, animal, row) {
    if (!kit.alive) return;
    // Re-tapping an already-discovered animal just replays it (no count, no
    // rotation) — but ignore taps entirely once a transition/cap is pending.
    const firstTime = !card.classList.contains('discovered');
    if (busy && firstTime) return;

    GameKit.restartAnim(card, 'count-pop');

    // A completed trio is one round. Mark it now (synchronously) so no later
    // tap can double-count it or double-fire onCycleComplete.
    let trioDone = false;
    if (firstTime) {
      card.classList.add('discovered');
      remaining--;
      if (remaining <= 0) { busy = true; trioDone = true; }
    }

    // Name first, then the sound (if this category has one — fruit stay silent).
    await SoundKit.speak(R.nameOf(animal));
    if (!kit.alive) return;
    await R.playSound(animal);
    if (!kit.alive) return;

    if (!trioDone) return;

    // Whole trio discovered = one "answer" toward the rolling leg / session cap.
    roundCount++;
    if (opts.rounds && roundCount >= opts.rounds && opts.onCycleComplete) {
      opts.onCycleComplete();
    } else {
      // Gently swap in a fresh trio.
      row.classList.add('fade-out');
      kit.after(500, newTrio);
    }
  }

  Games.register({
    id: 'free-play',
    icon: '🐾',
    age: 2,
    start(el, o = {}) {
      container = el;
      opts = o;
      R = o.category || AnimalRegistry; // fallback keeps the game runnable standalone
      roundCount = 0;
      busy = false;
      kit.start();
      newTrio();
    },
    stop() {
      busy = false;
      kit.stop();
    },
  });
})();
