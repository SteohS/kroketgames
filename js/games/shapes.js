/* ==========================================================================
   Game: Shapes
   Fully procedural (no assets at all). A spoken prompt asks for a shape
   ("Où est le rond ?"); three colored shape cards appear. Right = celebrate,
   wrong = gentle wiggle. Supports rolling mode via opts (see app.js).
   ========================================================================== */

(() => {
  const CARD_COUNT = 3;
  const kit = GameKit.session();
  let container = null;
  let opts = {};
  let target = null;          // { shape, color }
  let correctCount = 0;
  let busy = false;

  function promptText() {
    return I18N.t('whereIs', { name: ShapeRegistry.nameOf(target.shape) });
  }

  async function playPrompt() {
    if (!kit.alive) return;
    await SoundKit.speak(promptText());
  }

  function newRound() {
    if (!kit.alive) return;
    busy = false;

    const picked = ShapeRegistry.pick(CARD_COUNT);
    target = picked[0];
    const shuffled = [...picked].sort(() => Math.random() - 0.5);

    container.innerHTML = '';
    const bar = GameKit.promptBar(promptText(), () => { if (!busy) playPrompt(); });

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
    if (busy || !kit.alive) return;

    if (item.shape.id !== target.shape.id) {
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
    await SoundKit.speak(ShapeRegistry.nameOf(target.shape)); // reinforce the shape name
    if (!kit.alive) return;
    await SoundKit.speak(I18N.praise());
    if (!kit.alive) return;

    row.classList.add('fade-out');
    kit.advance(500, { count: correctCount, opts, next: newRound });
  }

  Games.register({
    id: 'shapes',
    icon: '⭐',
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
