/* ==========================================================================
   Game: Color hunt
   Fully procedural (no assets). A spoken prompt asks for a colored balloon
   ("Trouve le ballon rouge !"); three differently-colored balloons appear.
   Right = celebrate + speak the color name to reinforce it, wrong = gentle
   wiggle. Supports rolling mode via opts (see app.js).
   ========================================================================== */

(() => {
  const CARD_COUNT = 3;
  let container = null;
  let opts = {};
  let target = null;          // the color to find
  let correctCount = 0;
  let busy = false;
  let alive = false;

  async function playPrompt() {
    if (!alive) return;
    await SoundKit.speak(I18N.t('colorPrompt', { adj: ColorRegistry.adjOf(target) }));
  }

  function newRound() {
    if (!alive) return;
    busy = false;

    const picked = ColorRegistry.pick(CARD_COUNT);
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

    const row = document.createElement('div');
    row.className = 'card-row fade-in';
    shuffled.forEach(color => {
      const card = document.createElement('button');
      card.className = 'animal-card'; // shared card style
      card.appendChild(ColorRegistry.artFor(color));
      card.addEventListener('click', () => onTap(card, color, row));
      row.appendChild(card);
    });

    container.append(bar, row);
    playPrompt();
  }

  async function onTap(card, color, row) {
    if (busy || !alive) return;

    if (color.id !== target.id) {
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
    await SoundKit.speak(ColorRegistry.nameOf(target)); // reinforce the color
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
    id: 'color-hunt',
    icon: '🎈',
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
