/* ==========================================================================
   Game: Counting taps
   A spoken prompt asks the child to tap N objects ("Touche trois pommes !").
   Exactly N identical objects appear; tapping each one counts it aloud
   (un… deux… trois…) and marks it done. When all are counted, celebrate.
   No wrong answers possible — every tap is a happy count. Supports rolling
   mode via opts (see app.js).
   ========================================================================== */

(() => {
  const MIN = 2, MAX = 5;   // count range: 2 keeps French gender-neutral (deux/trois…)
  let container = null;
  let opts = {};
  let object = null;        // the countable used this round
  let target = 0;           // how many to count
  let counted = 0;          // how many tapped so far
  let correctCount = 0;     // completed rounds (for rolling mode)
  let busy = false;         // ignore taps during celebration/transition
  let alive = false;        // false once the game is stopped

  async function playPrompt() {
    if (!alive) return;
    const n = I18N.t('numbers.' + target);
    await SoundKit.speak(I18N.t('countPrompt', { n, name: CountRegistry.nameOf(object) }));
  }

  function popItem(item) {
    item.classList.remove('count-pop');
    void item.offsetWidth; // restart animation
    item.classList.add('count-pop');
  }

  function newRound() {
    if (!alive) return;
    busy = false;
    counted = 0;
    target = MIN + Math.floor(Math.random() * (MAX - MIN + 1));
    object = CountRegistry.pick();

    container.innerHTML = '';

    // prompt bar: one big replay button
    const bar = document.createElement('div');
    bar.className = 'prompt-bar';
    const replay = document.createElement('button');
    replay.className = 'replay-button';
    replay.textContent = '🔊';
    replay.addEventListener('click', () => { if (!busy) playPrompt(); });
    bar.appendChild(replay);

    // N identical objects to tap
    const stage = document.createElement('div');
    stage.className = 'count-stage fade-in';
    for (let i = 0; i < target; i++) {
      const item = document.createElement('button');
      item.className = 'count-item';
      item.appendChild(CountRegistry.artFor(object));
      item.addEventListener('click', () => onTap(item, stage));
      stage.appendChild(item);
    }

    container.append(bar, stage);
    playPrompt();
  }

  async function onTap(item, stage) {
    if (busy || !alive) return;
    if (item.classList.contains('counted')) return; // already counted — ignore

    item.classList.add('counted');
    counted++;
    popItem(item);
    SoundKit.pop();

    const numberWord = I18N.t('numbers.' + counted);

    if (counted < target) {
      // snappy count-aloud; a fast next tap may cut it off — that's fine
      SoundKit.speak(numberWord, { rate: 1 });
      return;
    }

    // reached the target — let the final number ring out, then celebrate
    busy = true;
    correctCount++;
    await SoundKit.speak(numberWord, { rate: 1 });
    if (!alive) return;
    App.confetti();
    await SoundKit.success();
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
    }, 600);
  }

  Games.register({
    id: 'counting',
    icon: '🔢',
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
