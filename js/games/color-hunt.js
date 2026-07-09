/* ==========================================================================
   Game: Color hunt
   Fully procedural (no assets). A spoken prompt asks for a colored balloon
   ("Trouve le ballon rouge !"); three differently-colored balloons appear.
   Right = celebrate + speak the color name to reinforce it, wrong = gentle
   wiggle. Supports rolling mode via opts (see app.js).
   ========================================================================== */

(() => {
  const CARD_COUNT = 3;
  const kit = GameKit.session();
  let container = null;
  let opts = {};
  let target = null;          // the color to find
  let correctCount = 0;
  let busy = false;

  function promptText() {
    return I18N.t('colorPrompt', { adj: ColorRegistry.adjOf(target) });
  }

  async function playPrompt() {
    if (!kit.alive) return;
    await SoundKit.speak(promptText());
  }

  function newRound() {
    if (!kit.alive) return;
    busy = false;

    const picked = ColorRegistry.pick(CARD_COUNT);
    target = picked[0];
    const shuffled = [...picked].sort(() => Math.random() - 0.5);

    container.innerHTML = '';
    const bar = GameKit.promptBar(promptText(), () => { if (!busy) playPrompt(); });

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
    if (busy || !kit.alive) return;

    if (color.id !== target.id) {
      SoundKit.nope();
      GameKit.wiggle(card);
      return;
    }

    busy = true;
    correctCount++;
    card.classList.add('bounce');
    App.confetti();
    await SoundKit.success();
    if (!kit.alive) return;
    await SoundKit.speak(ColorRegistry.nameOf(target)); // reinforce the color
    if (!kit.alive) return;
    await SoundKit.speak(I18N.praise());
    if (!kit.alive) return;

    row.classList.add('fade-out');
    kit.advance(500, { count: correctCount, opts, next: newRound });
  }

  Games.register({
    id: 'color-hunt',
    icon: '🎈',
    age: 2,
    start(el, o = {}) {
      container = el;
      opts = o;
      correctCount = 0;
      kit.start();
      newRound();
    },
    stop() {
      busy = false;
      kit.stop();
    },
  });
})();
