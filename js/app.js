/* ==========================================================================
   App shell — game registry, menu, navigation, settings, parent exit,
   shared confetti, and "rolling" surprise mode (games rotate every N rounds).
   Games register themselves via Games.register({ id, icon, start, stop }).

   Game contract:
     start(container, opts) where opts may contain:
       rounds           — after this many correct answers...
       onCycleComplete  — ...call this instead of starting a new round
     stop() — cancel timers/audio; the game must go silent immediately.
   ========================================================================== */

const Games = (() => {
  const registry = [];
  return {
    register(game) { registry.push(game); },
    get all() { return registry; },
  };
})();

const App = (() => {
  const ACCENTS = ['var(--sage)', 'var(--sky)', 'var(--coral)', 'var(--lilac)', 'var(--butter)'];
  const ROLLING_ROUNDS = 3; // rounds per game before rotating in surprise mode

  let currentGame = null;
  let rolling = null; // { order: [...games], idx } while surprise mode is active

  // Optional parent-set session limit: after N correct answers ("questions")
  // the game stops and a congrats screen appears whose only exit is the
  // long-press parent corner. null = unlimited (play forever).
  function loadLimit() {
    const v = localStorage.getItem('questionLimit');
    return v ? parseInt(v, 10) : null;
  }
  let session = { limit: loadLimit(), answered: 0 };

  const $ = sel => document.querySelector(sel);

  /* ---------- menu ---------- */

  function renderMenu() {
    $('#menu-title').textContent = I18N.t('menuTitle');
    $('#lang-label').textContent = I18N.t('voiceLabel');
    $('#limit-label').textContent = I18N.t('limitLabel');

    const list = $('#game-list');
    list.innerHTML = '';

    // Surprise (rolling) button first — plays all games in rotation
    if (Games.all.length > 1) {
      const btn = makeMenuButton('🎲', I18N.t('surpriseTitle'), 'var(--butter)');
      btn.addEventListener('click', startRolling);
      list.appendChild(btn);
    }

    Games.all.forEach((game, i) => {
      const btn = makeMenuButton(game.icon, I18N.t(`games.${game.id}`), ACCENTS[i % ACCENTS.length]);
      btn.addEventListener('click', () => playGame(game));
      list.appendChild(btn);
    });
  }

  function makeMenuButton(iconText, labelText, accent) {
    const btn = document.createElement('button');
    btn.className = 'game-button';
    btn.style.setProperty('--accent', accent);
    const icon = document.createElement('span');
    icon.className = 'game-icon';
    icon.textContent = iconText;
    const label = document.createElement('span');
    label.textContent = labelText;
    btn.append(icon, label);
    btn.addEventListener('pointerdown', () => SoundKit.unlock(), { once: true });
    return btn;
  }

  /* ---------- navigation ---------- */

  function openGame(game, opts = {}) {
    SoundKit.unlock();
    if (currentGame?.stop) currentGame.stop();
    currentGame = game;
    $('#menu-screen').classList.add('hidden');
    $('#game-screen').classList.remove('hidden');
    const container = $('#game-container');
    container.innerHTML = '';
    game.start(container, opts);
  }

  /** Launch a single game from the menu, honoring the session limit if set. */
  function playGame(game) {
    rolling = null;
    session.answered = 0;
    openGame(game, session.limit
      ? { rounds: session.limit, onCycleComplete: finishSession }
      : {});
  }

  function exitToMenu() {
    rolling = null;
    session.answered = 0;
    if (currentGame?.stop) currentGame.stop();
    currentGame = null;
    speechSynthesis?.cancel();
    $('#game-container').innerHTML = '';
    $('#game-screen').classList.add('hidden');
    $('#menu-screen').classList.remove('hidden');
  }

  /** Session limit reached: stop the game and celebrate the whole session.
      Deliberately has NO buttons — the long-press parent corner (still active
      on the game screen) is the only way back to the menu. */
  function finishSession() {
    rolling = null;
    if (currentGame?.stop) currentGame.stop();
    currentGame = null;

    const container = $('#game-container');
    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'congrats fade-in';
    const emoji = document.createElement('div');
    emoji.className = 'congrats-emoji bounce';
    emoji.textContent = '🎉';
    const text = document.createElement('div');
    text.className = 'congrats-text';
    text.textContent = I18N.t('allDone');
    wrap.append(emoji, text);
    container.appendChild(wrap);

    confetti(60);
    SoundKit.success().then(() => SoundKit.speak(I18N.t('allDone')));
  }

  /* ---------- rolling ("surprise") mode ---------- */

  function startRolling() {
    rolling = {
      order: [...Games.all].sort(() => Math.random() - 0.5),
      idx: 0,
    };
    session.answered = 0;
    rollNext();
  }

  function rollNext() {
    if (!rolling) return; // exited meanwhile
    if (session.limit && session.answered >= session.limit) return finishSession();

    // Correct answers to run this leg before rotating: normally ROLLING_ROUNDS,
    // but capped so the session ends exactly on the limit (not a multiple of it).
    const legRounds = session.limit
      ? Math.min(ROLLING_ROUNDS, session.limit - session.answered)
      : ROLLING_ROUNDS;

    const game = rolling.order[rolling.idx % rolling.order.length];
    rolling.idx++;
    openGame(game, {
      rounds: legRounds,
      onCycleComplete: () => { session.answered += legRounds; rollNext(); },
    });
  }

  /* ---------- parent exit: long-press 3s on top-left zone ---------- */

  function setupExitZone() {
    const zone = $('#exit-zone');
    let timer = null;

    const start = e => {
      e.preventDefault();
      zone.classList.add('pressing');
      timer = setTimeout(() => {
        zone.classList.remove('pressing');
        exitToMenu();
      }, 3000);
    };
    const cancel = () => {
      zone.classList.remove('pressing');
      if (timer) { clearTimeout(timer); timer = null; }
    };

    zone.addEventListener('pointerdown', start);
    zone.addEventListener('pointerup', cancel);
    zone.addEventListener('pointerleave', cancel);
    zone.addEventListener('pointercancel', cancel);
  }

  /* ---------- settings ---------- */

  function setupSettings() {
    const select = $('#lang-select');
    select.value = I18N.lang;
    select.addEventListener('change', () => {
      I18N.setLang(select.value);
      renderMenu();
    });

    const limitSel = $('#limit-select');
    limitSel.value = session.limit ? String(session.limit) : '';
    limitSel.addEventListener('change', () => {
      const v = limitSel.value;
      session.limit = v ? parseInt(v, 10) : null;
      if (v) localStorage.setItem('questionLimit', v);
      else localStorage.removeItem('questionLimit');
    });
  }

  /* ---------- shared confetti ---------- */

  const CONFETTI_COLORS = ['#A8C5A0', '#A9C7DE', '#F5D98B', '#EFA48B', '#C5B3D6'];

  function confetti(count = 26) {
    const layer = $('#confetti-layer');
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      p.style.animationDuration = 1.6 + Math.random() * 1.4 + 's';
      p.style.animationDelay = Math.random() * 0.3 + 's';
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      layer.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  }

  /* ---------- boot ---------- */

  document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    setupSettings();
    setupExitZone();
  });

  return { confetti, exitToMenu };
})();
