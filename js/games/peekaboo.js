/* ==========================================================================
   Game: Peekaboo
   One animal per round hides behind a soft scalloped "blanket", peeking out
   at the top. Tapping anywhere lifts the blanket away: the animal bounces,
   confetti falls, its sound plays and its name is spoken. There is no wrong
   answer — every tap reveals (like free-play), and each reveal counts as one
   correct answer, so rolling mode and the session limit work via opts
   (see app.js). Fully asset-free (emoji + TTS fallbacks).
   ========================================================================== */

(() => {
  // Calm pastel blankets, rotated per round for a little variety.
  const COVERS = GameKit.PALETTE;

  const kit = GameKit.session();
  let container = null;
  let opts = {};
  let current = null;         // the hiding animal
  let coverColor = null;
  let correctCount = 0;
  let busy = false;           // ignore taps during the reveal/transition

  function promptText() {
    return I18N.t('peekPrompt');
  }

  async function playPrompt() {
    if (!kit.alive) return;
    await SoundKit.speak(promptText());
  }

  function newRound() {
    if (!kit.alive) return;
    busy = false;

    current = AnimalRegistry.pick(1)[0];
    coverColor = COVERS[Math.floor(Math.random() * COVERS.length)];

    container.innerHTML = '';
    const bar = GameKit.promptBar(promptText(), () => { if (!busy) playPrompt(); });

    // the hiding stage: a single big card with the animal + a blanket cover
    const stage = document.createElement('div');
    stage.className = 'peek-stage fade-in';

    const card = document.createElement('button');
    card.className = 'peek-card';
    card.appendChild(AnimalRegistry.artFor(current));

    const cover = document.createElement('div');
    cover.className = 'peek-cover';
    cover.style.setProperty('--cover-color', coverColor);
    card.appendChild(cover);

    card.addEventListener('click', () => onReveal(card, cover, stage));
    stage.appendChild(card);

    container.append(bar, stage);
    playPrompt();
  }

  async function onReveal(card, cover, stage) {
    if (busy || !kit.alive) return;

    busy = true;
    correctCount++;
    cover.classList.add('peek-lift');
    SoundKit.pop();
    card.classList.add('bounce');
    App.confetti();

    await SoundKit.playAnimal(current.id);
    if (!kit.alive) return;
    await SoundKit.speak(AnimalRegistry.nameOf(current)); // reinforce the name
    if (!kit.alive) return;
    await SoundKit.speak(I18N.praise());
    if (!kit.alive) return;

    stage.classList.add('fade-out');
    kit.advance(500, { count: correctCount, opts, next: newRound });
  }

  Games.register({
    id: 'peekaboo',
    icon: '🙈',
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
