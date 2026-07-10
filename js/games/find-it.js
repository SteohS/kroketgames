/* ==========================================================================
   Game: Find it
   Category-agnostic "where is it?" game. A spoken prompt names one item
   ("Où est le rond ?", "Trouve le ballon rouge !", "Où est la vache ?");
   three cards appear. Right = celebrate + reinforce the name, wrong = gentle
   wiggle. Runs over any category (shapes/colors/animals/fruit) via the uniform
   `R.findCard(raw)` facade every registry exposes. Rolling mode via opts.
   ========================================================================== */

(() => {
  const CARD_COUNT = 3;
  const kit = GameKit.session();
  let container = null;
  let opts = {};
  let R = null;               // the content category (registry)
  let target = null;          // the normalized card to find
  let correctCount = 0;
  let busy = false;

  async function playPrompt() {
    if (!kit.alive) return;
    await SoundKit.speak(target.prompt);
  }

  function newRound() {
    if (!kit.alive) return;
    busy = false;

    const cards = R.pick(CARD_COUNT).map(raw => R.findCard(raw));
    target = cards[0];
    const shuffled = [...cards].sort(() => Math.random() - 0.5);

    container.innerHTML = '';
    const bar = GameKit.promptBar(target.prompt, () => { if (!busy) playPrompt(); });

    const row = document.createElement('div');
    row.className = 'card-row fade-in';
    shuffled.forEach(card => {
      const el = document.createElement('button');
      el.className = 'animal-card'; // shared card style
      el.appendChild(card.art);
      el.addEventListener('click', () => onTap(el, card, row));
      row.appendChild(el);
    });

    container.append(bar, row);
    playPrompt();
  }

  async function onTap(el, card, row) {
    if (busy || !kit.alive) return;

    if (card.id !== target.id) {
      SoundKit.nope();
      GameKit.wiggle(el);
      return;
    }

    busy = true;
    correctCount++;
    el.classList.add('bounce');
    App.confetti();
    await SoundKit.success();
    if (!kit.alive) return;
    await SoundKit.speak(target.name); // reinforce what was found
    if (!kit.alive) return;
    await SoundKit.speak(I18N.praise());
    if (!kit.alive) return;

    row.classList.add('fade-out');
    kit.advance(500, { count: correctCount, opts, next: newRound });
  }

  Games.register({
    id: 'find-it',
    icon: '🔍',
    age: 2,
    start(el, o = {}) {
      container = el;
      opts = o;
      R = o.category || AnimalRegistry;
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
