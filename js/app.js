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

  // Third-party asset attribution, shown in the parent-facing Credits modal.
  // Add a new entry here whenever assets from a new source are dropped in —
  // no other code changes needed. Keep it in sync with README's Credits section.
  const ASSET_CREDITS = [
    {
      kind: 'Animal sounds',
      detail: 'Free sound effects by Mixkit — no attribution required, credited here anyway.',
      url: 'https://mixkit.co/free-sound-effects/animals/',
    },
    {
      kind: 'Animal sounds',
      detail: 'Jungle & farm animal sounds from Animal-Sounds.org.',
      url: 'https://www.animal-sounds.org/jungle-animal-sounds.html',
    },
  ];

  let currentGame = null;
  let rolling = null; // { order: [...games], idx } while surprise mode is active

  // Optional parent-set session limit: after N correct answers ("questions")
  // the game stops and a congrats screen appears whose only exit is the
  // long-press parent corner. null = unlimited (play forever).
  function loadLimit() {
    const n = parseInt(localStorage.getItem('questionLimit'), 10);
    // Only a positive integer is a real cap; anything else = unlimited.
    return Number.isInteger(n) && n > 0 ? n : null;
  }
  let session = { limit: loadLimit(), answered: 0 };

  const $ = sel => document.querySelector(sel);

  /* ---------- game selection (config screen) ---------- */

  // Which games are ticked to be included in a session. Persisted so the parent
  // doesn't re-tick every time. Default (first visit / bad data): all ticked.
  function loadSelection() {
    const raw = localStorage.getItem('selectedGames');
    if (raw) {
      try {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return new Set(arr);
      } catch { /* fall through to default */ }
    }
    return new Set(Games.all.map(g => g.id));
  }
  // Populated in boot — games register after this script loads, so Games.all is
  // still empty here; a first-visit default must be computed once they exist.
  let selected = new Set();

  function saveSelection() {
    localStorage.setItem('selectedGames', JSON.stringify([...selected]));
  }

  /* ---------- config screen ---------- */

  // Builds the age-grouped, tickable game cards plus the labels around them.
  // Called on boot and whenever the language changes.
  function renderConfig() {
    $('#menu-title').textContent = I18N.t('menuTitle');
    $('#choose-games').textContent = I18N.t('chooseGames');
    $('#lang-label').textContent = I18N.t('voiceLabel');
    $('#limit-label').textContent = I18N.t('limitLabel');
    $('#credits-btn').textContent = I18N.t('creditsLabel');
    $('#start-btn').textContent = I18N.t('startLabel');

    const list = $('#game-list');
    list.innerHTML = '';

    const bands = [...new Set(Games.all.map(g => g.age ?? 2))].sort((a, b) => a - b);
    bands.forEach(age => {
      const group = document.createElement('section');
      group.className = 'age-group';
      const heading = document.createElement('h2');
      heading.className = 'age-heading';
      heading.textContent = I18N.t(`ageBands.${age}`);
      const grid = document.createElement('div');
      grid.className = 'game-grid';
      Games.all
        .filter(g => (g.age ?? 2) === age)
        .forEach(game => grid.appendChild(makeGameToggle(game)));
      group.append(heading, grid);
      list.appendChild(group);
    });

    updateStartState();
  }

  // A single tickable game card. Toggling it updates the persisted selection.
  function makeGameToggle(game) {
    const idx = Games.all.indexOf(game);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'game-toggle';
    btn.style.setProperty('--accent', ACCENTS[idx % ACCENTS.length]);

    const check = document.createElement('span');
    check.className = 'game-check';
    check.textContent = '✓';
    const icon = document.createElement('span');
    icon.className = 'game-icon';
    icon.textContent = game.icon;
    const label = document.createElement('span');
    label.className = 'game-toggle-label';
    label.textContent = I18N.t(`games.${game.id}`);
    btn.append(icon, label, check);

    const sync = () => {
      const on = selected.has(game.id);
      btn.classList.toggle('selected', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    };
    sync();

    // First tap also unlocks iOS audio for the coming session
    btn.addEventListener('pointerdown', () => SoundKit.unlock(), { once: true });
    btn.addEventListener('click', () => {
      if (selected.has(game.id)) selected.delete(game.id);
      else selected.add(game.id);
      saveSelection();
      sync();
      updateStartState();
    });
    return btn;
  }

  function updateStartState() {
    $('#start-btn').disabled = selected.size === 0;
  }

  /** Start playing the ticked games. One game → play it straight; several →
      rotate through them (shuffled) like the old surprise mode. */
  function startSelected() {
    SoundKit.unlock();
    const chosen = Games.all.filter(g => selected.has(g.id));
    if (chosen.length === 0) return;
    session.answered = 0;
    if (chosen.length === 1) playGame(chosen[0]);
    else startRolling(chosen);
  }

  /* ---------- navigation ---------- */

  function openGame(game, opts = {}) {
    SoundKit.unlock();
    if (currentGame?.stop) currentGame.stop();
    SoundKit.stop(); // silence the outgoing game before the next one starts
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
    SoundKit.stop(); // cut any in-flight speech / animal sound immediately
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
    SoundKit.stop(); // silence the game before the congrats sound plays
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

  function startRolling(games = Games.all) {
    rolling = {
      order: [...games].sort(() => Math.random() - 0.5),
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
      renderConfig();
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

  /* ---------- credits modal (parent-facing) ---------- */

  function setupCredits() {
    const btn = $('#credits-btn');
    const modal = $('#credits-modal');
    const close = $('#credits-close');

    function render() {
      $('#credits-heading').textContent = I18N.t('creditsTitle');
      close.textContent = I18N.t('creditsClose');
      const body = $('#credits-body');
      body.innerHTML = '';
      ASSET_CREDITS.forEach(c => {
        const item = document.createElement('div');
        item.className = 'credit-item';
        const kind = document.createElement('div');
        kind.className = 'credit-kind';
        kind.textContent = c.kind;
        const detail = document.createElement('div');
        detail.className = 'credit-detail';
        detail.textContent = c.detail;
        item.append(kind, detail);
        if (c.url) {
          const link = document.createElement('a');
          link.href = c.url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = c.url;
          item.appendChild(link);
        }
        body.appendChild(item);
      });
    }

    const open = () => { render(); modal.classList.remove('hidden'); };
    const hide = () => modal.classList.add('hidden');

    btn.addEventListener('click', open);
    close.addEventListener('click', hide);
    // Tapping the dim backdrop (but not the card) closes it
    modal.addEventListener('click', e => { if (e.target === modal) hide(); });
  }

  /* ---------- shared confetti ---------- */

  function confetti(count = 26) {
    const colors = GameKit.PALETTE; // single source of the pastel set
    const layer = $('#confetti-layer');
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = 1.6 + Math.random() * 1.4 + 's';
      p.style.animationDelay = Math.random() * 0.3 + 's';
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      layer.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  }

  /* ---------- boot ---------- */

  document.addEventListener('DOMContentLoaded', () => {
    selected = loadSelection();
    renderConfig();
    setupSettings();
    setupExitZone();
    setupCredits();
    $('#start-btn').addEventListener('click', startSelected);
  });

  return { confetti, exitToMenu };
})();
