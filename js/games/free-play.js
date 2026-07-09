/* ==========================================================================
   Game: Discover the animals ("Découvre")
   A calm round of THREE animals with a spoken question at the top
   ("Découvre les animaux !"). Tapping an animal plays its sound and then
   speaks its name — pure exploration, no quiz, no wrong answers, no confetti.
   Once all three have been discovered a fresh trio slides in.
   A completed trio counts as ONE "answer" (discovering 3 animals is one round),
   so the game honors rolling mode and the session limit: after `opts.rounds`
   completed trios it calls opts.onCycleComplete() (see app.js). stop() silences
   it immediately.
   ========================================================================== */

(() => {
  const CARD_COUNT = 3;
  let container = null;
  let opts = {};
  let roundCount = 0;      // completed trios this session (the "answer" count)
  let remaining = 0;       // animals not yet discovered in the current trio
  let busy = false;        // true while a transition is pending or the cap is hit
  let alive = false;       // false once the game is stopped

  function promptText() {
    return I18N.t('discoverPrompt');
  }

  async function playPrompt() {
    if (!alive) return;
    await SoundKit.speak(promptText());
  }

  function newTrio() {
    if (!alive) return;
    busy = false;
    remaining = CARD_COUNT;

    const picked = AnimalRegistry.pick(CARD_COUNT);

    container.innerHTML = '';

    const bar = document.createElement('div');
    bar.className = 'prompt-bar';
    const replay = document.createElement('button');
    replay.className = 'replay-button';
    replay.textContent = '🔊';
    replay.addEventListener('click', () => { if (!busy) playPrompt(); });
    bar.appendChild(replay);
    const label = document.createElement('span');
    label.className = 'prompt-text';
    label.textContent = promptText();
    bar.appendChild(label);

    const row = document.createElement('div');
    row.className = 'card-row fade-in';
    picked.forEach(animal => {
      const card = document.createElement('button');
      card.className = 'animal-card';
      card.appendChild(AnimalRegistry.artFor(animal));
      card.addEventListener('click', () => onTap(card, animal, row));
      row.appendChild(card);
    });

    container.append(bar, row);
    playPrompt();
  }

  function pop(el) {
    el.classList.remove('count-pop');
    void el.offsetWidth; // restart animation
    el.classList.add('count-pop');
  }

  async function onTap(card, animal, row) {
    if (!alive) return;
    // Re-tapping an already-discovered animal just replays it (no count, no
    // rotation) — but ignore taps entirely once a transition/cap is pending.
    const firstTime = !card.classList.contains('discovered');
    if (busy && firstTime) return;

    pop(card);

    // A completed trio is one round. Mark it now (synchronously) so no later
    // tap can double-count it or double-fire onCycleComplete.
    let trioDone = false;
    if (firstTime) {
      card.classList.add('discovered');
      remaining--;
      if (remaining <= 0) { busy = true; trioDone = true; }
    }

    await SoundKit.playAnimal(animal.id);
    if (!alive) return;
    await SoundKit.speak(AnimalRegistry.nameOf(animal));
    if (!alive) return;

    if (!trioDone) return;

    // Whole trio discovered = one "answer" toward the rolling leg / session cap.
    roundCount++;
    if (opts.rounds && roundCount >= opts.rounds && opts.onCycleComplete) {
      opts.onCycleComplete();
    } else {
      // Gently swap in a fresh trio.
      row.classList.add('fade-out');
      setTimeout(() => { if (alive) newTrio(); }, 500);
    }
  }

  Games.register({
    id: 'free-play',
    icon: '🐾',
    age: 2,
    start(el, o = {}) {
      container = el;
      opts = o;
      roundCount = 0;
      busy = false;
      alive = true;
      newTrio();
    },
    stop() {
      alive = false;
      busy = false;
    },
  });
})();
