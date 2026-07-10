/* ==========================================================================
   SoundKit — all audio goes through here.
   - speak(text): speech synthesis in the current language
   - playSound(category, id): plays assets/audio/<category>/<id>.mp3; if the
     file is missing it plays nothing (no TTS substitute)
   - success()/nope(): UI sounds; plays assets/audio/ui/{success,nope}.mp3
     if present, otherwise synthesizes a gentle tone with WebAudio
   Call SoundKit.unlock() from the first user tap (iOS requirement).
   ========================================================================== */

const SoundKit = (() => {
  let ctx = null;               // AudioContext, created on unlock
  let master = null;            // master gain; every synth tone routes through it
  let voices = [];              // cached speechSynthesis voices
  const fileCache = {};         // url -> HTMLAudioElement | 'missing'
  const activeOscillators = new Set(); // synth voices currently scheduled/playing

  // iOS loads voices asynchronously
  function refreshVoices() { voices = speechSynthesis.getVoices(); }
  if ('speechSynthesis' in window) {
    refreshVoices();
    speechSynthesis.onvoiceschanged = refreshVoices;
  }

  function pickVoice() {
    const target = I18N.speechLang();           // e.g. 'fr-FR'
    const prefix = target.slice(0, 2);
    return (
      voices.find(v => v.lang === target) ||
      voices.find(v => v.lang.startsWith(prefix)) ||
      null
    );
  }

  function unlock() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        ctx = new AC();
        master = ctx.createGain();
        master.connect(ctx.destination);
      }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    // Warm up TTS on iOS with a silent utterance
    if ('speechSynthesis' in window && !unlock.warmed) {
      const u = new SpeechSynthesisUtterance('');
      speechSynthesis.speak(u);
      unlock.warmed = true;
    }
  }

  /** Silence everything immediately: cancel speech, halt file playback, and
      stop any scheduled/playing synth tones. Games call this from stop() so the
      contract ("go silent immediately") holds even mid-utterance/mid-sound. */
  function stop() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    for (const el of Object.values(fileCache)) {
      if (el && el !== 'missing') { el.pause(); el.currentTime = 0; }
    }
    for (const o of activeOscillators) {
      try { o.stop(); } catch { /* already stopped */ }
      try { o.disconnect(); } catch { /* noop */ }
    }
    activeOscillators.clear();
  }

  function speak(text, { rate = 0.9 } = {}) {
    return new Promise(resolve => {
      if (!('speechSynthesis' in window) || !text) return resolve();
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = I18N.speechLang();
      const v = pickVoice();
      if (v) u.voice = v;
      u.rate = rate;            // slightly slow, toddler-friendly

      // The games advance by awaiting this promise (and hold a `busy` flag until
      // it resolves), so it MUST always settle. iOS Safari intermittently drops
      // onend/onerror when speak() is called right after cancel() while another
      // utterance is still in flight — e.g. tapping an answer before the round
      // prompt finishes speaking. Without a fallback the await would hang and
      // the game would freeze. A watchdog guarantees forward progress; a
      // generous length estimate keeps it from clipping normal speech.
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(watchdog);
        resolve();
      };
      u.onend = finish;
      u.onerror = finish;
      const watchdog = setTimeout(finish, 2000 + (text.length / rate) * 120);
      speechSynthesis.speak(u);
    });
  }

  /** Try to play an audio file; resolve(true) if played, resolve(false) if missing. */
  function playFile(url) {
    return new Promise(resolve => {
      if (fileCache[url] === 'missing') return resolve(false);
      let el = fileCache[url];
      if (!el) {
        el = new window.Audio(url);
        fileCache[url] = el;
      }
      el.currentTime = 0;
      const onEnd = () => { cleanup(); resolve(true); };
      const onErr = () => { cleanup(); fileCache[url] = 'missing'; resolve(false); };
      function cleanup() {
        el.removeEventListener('ended', onEnd);
        el.removeEventListener('error', onErr);
      }
      el.addEventListener('ended', onEnd);
      el.addEventListener('error', onErr);
      el.play().catch(() => { onErr(); });
    });
  }

  /** Play a category item's sound: assets/audio/<category>/<id>.mp3.
      If the file is missing there is simply no sound (no TTS substitute). Only
      sound-bearing categories (animals) reach here — see the registries. */
  function playSound(category, id) {
    return playFile(`assets/audio/${category}/${id}.mp3`);
  }

  /* ---------- synthesized UI sounds (used when no file present) ---------- */

  function tone(freq, start, dur, type = 'sine', gainPeak = 0.18) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, ctx.currentTime + start);
    g.gain.linearRampToValueAtTime(gainPeak, ctx.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
    o.connect(g).connect(master);
    o.start(ctx.currentTime + start);
    o.stop(ctx.currentTime + start + dur + 0.05);
    activeOscillators.add(o);
    o.onended = () => activeOscillators.delete(o);
  }

  async function success() {
    if (await playFile('assets/audio/ui/success.mp3')) return;
    if (!ctx) return;
    // gentle rising major arpeggio
    tone(523.25, 0.00, 0.25);   // C5
    tone(659.25, 0.10, 0.25);   // E5
    tone(783.99, 0.20, 0.35);   // G5
  }

  async function nope() {
    if (await playFile('assets/audio/ui/nope.mp3')) return;
    if (!ctx) return;
    // soft, boring low thud — deliberately not funny
    tone(180, 0, 0.18, 'triangle', 0.1);
  }

  async function pop() {
    if (await playFile('assets/audio/ui/pop.mp3')) return;
    if (!ctx) return;
    tone(880, 0, 0.09, 'sine', 0.15);
  }

  return { unlock, stop, speak, playSound, success, nope, pop };
})();
