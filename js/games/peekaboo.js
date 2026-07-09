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
  const COVERS = ['#A8C5A0', '#A9C7DE', '#F5D98B', '#EFA48B', '#C9B8DD'];

  let container = null;
  let opts = {};
  let current = null;         // the hiding animal
  let coverColor = null;
  let correctCount = 0;
  let busy = false;           // ignore taps during the reveal/transition
  let alive = false;          // false once the game is stopped

  function promptText() {
    return I18N.t('peekPrompt');
  }

  async function playPrompt() {
    if (!alive) return;
    await SoundKit.speak(promptText());
  }

  function newRound() {
    if (!alive) return;
    busy = false;

    current = AnimalRegistry.pick(1)[0];
    coverColor = COVERS[Math.floor(Math.random() * COVERS.length)];

    container.innerHTML = '';

    // prompt bar: one big replay button (mirrors the other games)
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
    if (busy || !alive) return;

    busy = true;
    correctCount++;
    cover.classList.add('peek-lift');
    SoundKit.pop();
    card.classList.add('bounce');
    App.confetti();

    await SoundKit.playAnimal(current.id);
    if (!alive) return;
    await SoundKit.speak(AnimalRegistry.nameOf(current)); // reinforce the name
    if (!alive) return;
    await SoundKit.speak(I18N.praise());
    if (!alive) return;

    stage.classList.add('fade-out');
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
    id: 'peekaboo',
    icon: '🙈',
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
