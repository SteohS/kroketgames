/* ==========================================================================
   Game: Shapes
   Fully procedural (no assets at all). A spoken prompt asks for a shape
   ("Où est le rond ?"); three colored shape cards appear. Right = celebrate,
   wrong = gentle wiggle. Supports rolling mode via opts (see app.js).
   ========================================================================== */

(() => {
  const CARD_COUNT = 3;
  let container = null;
  let opts = {};
  let target = null;          // { shape, color }
  let correctCount = 0;
  let busy = false;
  let alive = false;

  function promptText() {
    return I18N.t('whereIs', { name: ShapeRegistry.nameOf(target.shape) });
  }

  async function playPrompt() {
    if (!alive) return;
    await SoundKit.speak(promptText());
  }

  function newRound() {
    if (!alive) return;
    busy = false;

    const picked = ShapeRegistry.pick(CARD_COUNT);
    target = picked[0];
    const shuffled = [...picked].sort(() => Math.random() - 0.5);

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
    shuffled.forEach(item => {
      const card = document.createElement('button');
      card.className = 'animal-card'; // shared card style
      card.appendChild(ShapeRegistry.artFor(item.shape, item.color));
      card.addEventListener('click', () => onTap(card, item, row));
      row.appendChild(card);
    });

    container.append(bar, row);
    playPrompt();
  }

  async function onTap(card, item, row) {
    if (busy || !alive) return;

    if (item.shape.id !== target.shape.id) {
      SoundKit.nope();
      card.classList.remove('wiggle');
      void card.offsetWidth;
      card.classList.add('wiggle');
      return;
    }

    busy = true;
    correctCount++;
    card.classList.add('bounce');
    App.confetti();
    await SoundKit.success();
    if (!alive) return;
    await SoundKit.speak(I18N.praise());
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
    id: 'shapes',
    icon: '⭐',
    age: 2,
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
