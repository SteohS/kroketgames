/* ==========================================================================
   Game: Sounds ("Who makes this noise?")
   A sound plays + a sound-first spoken prompt ("Qui fait ce bruit ?") that
   deliberately does NOT name the animal — the sound is the whole clue. Three
   cards appear; the right one celebrates and speaks the animal's name (so the
   child hears what made the noise), a wrong one wiggles gently (boring on
   purpose). Big replay button repeats the prompt + sound.
   ========================================================================== */

(() => {
  const CARD_COUNT = 3;
  const kit = GameKit.session();
  let container = null;
  let opts = {};
  let R = null;          // the content category (registry) — only sound-bearing ones
  let target = null;
  let correctCount = 0;
  let busy = false;      // ignore taps during celebration/transition

  function promptText() {
    return I18N.t('soundPrompt');
  }

  async function playPrompt() {
    if (!kit.alive) return;
    await SoundKit.speak(promptText());
    if (!kit.alive || !R.hasSound) return;
    await R.playSound(target);
  }

  function newRound() {
    if (!kit.alive) return;
    busy = false;

    const picked = R.pick(CARD_COUNT);
    target = picked[0];
    const shuffled = [...picked].sort(() => Math.random() - 0.5);

    container.innerHTML = '';
    const bar = GameKit.promptBar(promptText(), () => { if (!busy) playPrompt(); });

    const row = document.createElement('div');
    row.className = 'card-row fade-in';
    shuffled.forEach(animal => {
      const card = document.createElement('button');
      card.className = 'animal-card';
      card.appendChild(R.artFor(animal));
      card.addEventListener('click', () => onTap(card, animal, row));
      row.appendChild(card);
    });

    container.append(bar, row);
    playPrompt();
  }

  async function onTap(card, animal, row) {
    if (busy || !kit.alive) return;

    if (animal.id !== target.id) {
      // wrong: gentle, boring wiggle + soft thud — no lockout, no comment
      SoundKit.nope();
      GameKit.wiggle(card);
      return;
    }

    // correct!
    busy = true;
    correctCount++;
    card.classList.add('bounce');
    App.confetti();
    await SoundKit.success();
    if (!kit.alive) return;
    await SoundKit.speak(R.nameOf(target)); // name what made the noise
    if (!kit.alive) return;
    await SoundKit.speak(I18N.praise());
    if (!kit.alive) return;
    if (R.hasSound) await R.playSound(target);
    if (!kit.alive) return;

    row.classList.add('fade-out');
    kit.advance(500, { count: correctCount, opts, next: newRound });
  }

  Games.register({
    id: 'animal-sounds',
    icon: '👂',
    age: 2,
    start(el, o = {}) {
      container = el;
      opts = o;
      R = o.category || AnimalRegistry; // only ever launched for sound-bearing categories
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
