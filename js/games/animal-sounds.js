/* ==========================================================================
   Game: Animal Sounds
   A sound plays + a spoken prompt ("Où est la vache ?").
   Three cards appear; tapping the right one celebrates, a wrong one
   wiggles gently (boring on purpose). Big replay button repeats the prompt.
   ========================================================================== */

(() => {
  const CARD_COUNT = 3;
  let container = null;
  let opts = {};
  let target = null;
  let correctCount = 0;
  let busy = false;      // ignore taps during celebration/transition
  let alive = false;     // false once the game is stopped

  function promptText() {
    return I18N.t('whereIs', { name: AnimalRegistry.nameOf(target) });
  }

  async function playPrompt() {
    if (!alive) return;
    await SoundKit.speak(promptText());
    if (!alive) return;
    await SoundKit.playAnimal(target.id);
  }

  function newRound() {
    if (!alive) return;
    busy = false;

    const picked = AnimalRegistry.pick(CARD_COUNT);
    target = picked[0];
    const shuffled = [...picked].sort(() => Math.random() - 0.5);

    container.innerHTML = '';

    // prompt bar: one big replay button
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

    // cards
    const row = document.createElement('div');
    row.className = 'card-row fade-in';
    shuffled.forEach(animal => {
      const card = document.createElement('button');
      card.className = 'animal-card';
      card.appendChild(AnimalRegistry.artFor(animal));
      card.addEventListener('click', () => onTap(card, animal, row));
      row.appendChild(card);
    });

    container.append(bar, row);
    playPrompt();
  }

  async function onTap(card, animal, row) {
    if (busy || !alive) return;

    if (animal.id !== target.id) {
      // wrong: gentle, boring wiggle + soft thud — no lockout, no comment
      SoundKit.nope();
      card.classList.remove('wiggle');
      void card.offsetWidth; // restart animation
      card.classList.add('wiggle');
      return;
    }

    // correct!
    busy = true;
    correctCount++;
    card.classList.add('bounce');
    App.confetti();
    await SoundKit.success();
    if (!alive) return;
    await SoundKit.speak(I18N.praise());
    if (!alive) return;
    await SoundKit.playAnimal(target.id);
    if (!alive) return;

    row.classList.add('fade-out');
    setTimeout(() => {
      if (!alive) return;
      if (opts.rounds && correctCount >= opts.rounds && opts.onCycleComplete) {
        opts.onCycleComplete();
      } else {
        newRound();
      }
    }, 500);
  }

  Games.register({
    id: 'animal-sounds',
    icon: '🐮',
    age: 3,
    start(el, o = {}) {
      container = el;
      opts = o;
      correctCount = 0;
      alive = true;
      newRound();
    },
    stop() {
      alive = false;
      busy = false;
    },
  });
})();
