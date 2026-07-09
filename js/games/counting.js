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
  const kit = GameKit.session();
  let container = null;
  let opts = {};
  let object = null;        // the countable used this round
  let target = 0;           // how many to count
  let counted = 0;          // how many tapped so far
  let correctCount = 0;     // completed rounds (for rolling mode)
  let busy = false;         // ignore taps during celebration/transition

  function promptText() {
    const n = I18N.t('numbers.' + target);
    return I18N.t('countPrompt', { n, name: CountRegistry.nameOf(object) });
  }

  async function playPrompt() {
    if (!kit.alive) return;
    await SoundKit.speak(promptText());
  }

  function newRound() {
    if (!kit.alive) return;
    busy = false;
    counted = 0;
    target = MIN + Math.floor(Math.random() * (MAX - MIN + 1));
    object = CountRegistry.pick();

    container.innerHTML = '';
    const bar = GameKit.promptBar(promptText(), () => { if (!busy) playPrompt(); });

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
    if (busy || !kit.alive) return;
    if (item.classList.contains('counted')) return; // already counted — ignore

    item.classList.add('counted');
    counted++;
    GameKit.restartAnim(item, 'count-pop');
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
    if (!kit.alive) return;
    App.confetti();
    await SoundKit.success();
    if (!kit.alive) return;
    await SoundKit.speak(I18N.praise());
    if (!kit.alive) return;

    stage.classList.add('fade-out');
    kit.advance(600, { count: correctCount, opts, next: newRound });
  }

  Games.register({
    id: 'counting',
    icon: '🔢',
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
