/* ==========================================================================
   GameKit — shared building blocks for the mini-games, so each game file only
   holds its own unique logic. Provides:
     - PALETTE      : the soft pastel set (single source; mirrors the CSS tokens)
     - restartAnim  : re-trigger a CSS animation (remove → reflow → add)
     - wiggle       : the gentle wrong-answer nudge
     - promptBar    : the 🔊 replay button + prompt label at the top of a round
     - session()    : per-game lifecycle (alive flag + one tracked timer) whose
                      stop() clears the timer AND silences all audio in one place.
   ========================================================================== */

const GameKit = (() => {
  // sage, sky, butter, coral, lilac — kept in sync with css/styles.css tokens.
  const PALETTE = ['#A8C5A0', '#A9C7DE', '#F5D98B', '#EFA48B', '#C5B3D6'];

  /** Restart a CSS animation by removing the class, forcing reflow, re-adding. */
  function restartAnim(el, className) {
    el.classList.remove(className);
    void el.offsetWidth; // force reflow so the animation replays
    el.classList.add(className);
  }

  /** Gentle, boring wrong-answer wiggle (no lockout, no comment). */
  function wiggle(card) { restartAnim(card, 'wiggle'); }

  /** Prompt bar: a big 🔊 replay button + the spoken prompt as visible text. */
  function promptBar(text, onReplay) {
    const bar = document.createElement('div');
    bar.className = 'prompt-bar';
    const replay = document.createElement('button');
    replay.type = 'button';
    replay.className = 'replay-button';
    replay.textContent = '🔊';
    replay.setAttribute('aria-label', text); // spoken button repeats the prompt
    replay.addEventListener('click', onReplay);
    const label = document.createElement('span');
    label.className = 'prompt-text';
    label.textContent = text;
    bar.append(replay, label);
    return bar;
  }

  /**
   * Per-game lifecycle controller. Tracks `alive` and a single pending timer so
   * that stop() can cancel the timer and silence audio together — this is what
   * makes the documented "go silent immediately" contract hold.
   */
  function session() {
    let alive = false;
    let timer = null;
    return {
      get alive() { return alive; },
      start() { alive = true; },
      /** Tracked, alive-guarded setTimeout (only one pending at a time). */
      after(ms, fn) {
        timer = setTimeout(() => { timer = null; if (alive) fn(); }, ms);
      },
      /** Shared round-advance: after `ms`, finish the leg or start the next round. */
      advance(ms, { count, opts, next }) {
        this.after(ms, () => {
          if (opts.rounds && count >= opts.rounds && opts.onCycleComplete) opts.onCycleComplete();
          else next();
        });
      },
      stop() {
        alive = false;
        if (timer) { clearTimeout(timer); timer = null; }
        SoundKit.stop();
      },
    };
  }

  return { PALETTE, restartAnim, wiggle, promptBar, session };
})();
