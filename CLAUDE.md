# Toddler Mini-Games

A small web app of mini-games for a 2.5-year-old. Static HTML/CSS/vanilla JS, no build step,
hosted on GitHub Pages, used on iPad & iPhone (Safari).

## Product decisions (agreed with the parent — do not re-litigate)

- **Audience**: 2.5-year-old who cannot read. Everything must be spoken aloud.
- **Languages**: French, Dutch, English. Selectable via a dropdown on the menu screen.
  All spoken prompts go through `js/i18n.js` — never hardcode strings in games.
- **No fail states**: wrong answers get a gentle, *boring* wiggle. Right answers celebrate
  (bounce + confetti + praise). No timers, no scores, no rewards/progression system.
- **Calm visual style**: printed children's book, not casino. Soft pastels, chunky rounded
  cards, slow gentle animations. Not "adulty" (no glassmorphism etc.), not overstimulating.
- **Toddler-proof controls**: no visible back/menu buttons inside a game. Exit = long-press
  (3 s) on the top-left corner zone, which shows a small "exit" label + a filling ring for
  the parent (the label is intentionally tiny and un-shiny, not toddler-facing). Pinch-zoom,
  text selection, pull-to-refresh and double-tap zoom are disabled.
- **Audio unlock**: iOS blocks audio until a user gesture — tapping a game tile on the
  config screen (or Start) counts as that gesture; TTS/audio is initialized on first tap.
- **Real illustrations, not emoji**: emoji are only a *fallback* while image assets are
  missing (see asset conventions below). Parent will source CC0 art (e.g. Kenney.nl).
- **No offline / service worker for now.** PWA manifest yes (fullscreen on home screen).
- **Stack**: plain HTML + CSS + vanilla JS. Each concern is a global-script IIFE
  (`Games`, `App`, `SoundKit`, `I18N`, the registries, `GameKit`, `RegistryKit`) —
  not ES modules. No frameworks, no bundler.

## Architecture

```
index.html            shell: config screen (game picker + settings) + game container
css/styles.css        design tokens + all styling
js/app.js             config screen, game selection, navigation, settings, long-press exit, confetti
js/audio.js           SoundKit: TTS wrapper + WebAudio synth dings + file playback + stop()
js/i18n.js            all user-facing strings & praise phrases (fr/nl/en)
js/data/_registry.js  RegistryKit: shared image-with-emoji-fallback .art builder
js/data/animals.js    shared animal registry (names per language, asset paths, emoji fallback)
js/games/_kit.js      GameKit: prompt bar, wiggle, palette, per-game lifecycle (session)
js/games/*.js         one file per mini-game, registered via Games.register(...)
assets/images/...     illustrations (see naming conventions in each folder's README)
assets/audio/...      animal sounds + UI sounds (optional overrides for synth sounds)
```

### Adding a new game

1. Create `js/games/<name>.js`, call
   `Games.register({ id, icon, age, start(container, opts), stop() })`.
   `age` (2/3/4) picks which age band the game is grouped under on the config screen.
   (Every game currently ships as `age: 2` — bands 3/4 exist in `i18n.js` but are
   reserved/unused for now; see commit 64170c7 which collapsed classification.)
2. Add its `<script>` tag to `index.html` **after `js/games/_kit.js`** (registration
   order = order within its age band) and its title to `js/i18n.js` (`games.<id>`).
   If you introduce a new age band, add its label to `i18n.js` (`ageBands.<n>`).
3. Reuse `SoundKit` for all audio and the `js/data/*` registries — assets are shared.
   Use `GameKit` for the boilerplate every game shares: `GameKit.promptBar(text, onReplay)`,
   `GameKit.wiggle(card)`, `GameKit.PALETTE`, and `const kit = GameKit.session()` whose
   `kit.stop()` clears the pending timer **and** calls `SoundKit.stop()` (so audio goes
   silent immediately — call it from your game's `stop()`). See any game file for the shape.
4. **Support rolling mode**: `opts` may contain `{ rounds, onCycleComplete }`. After
   `rounds` correct answers, call `opts.onCycleComplete()` instead of starting a new
   round (see shapes.js for the pattern). `stop()` must silence the game immediately.

### Config screen (home) & rolling mode

The home screen is a parent-facing **configuration** page (`renderConfig` in app.js):
games are shown as tickable cards grouped by age band (`ageBands` labels), plus the
voice + questions options and a **Start** button. The ticked set is persisted as
`selectedGames` (defaults to all on first visit). Start:
- **one game ticked** → plays it straight (`playGame`);
- **several ticked** → shuffles them and rotates, `ROLLING_ROUNDS` (3) correct
  answers per game, looping forever until the parent exits (`startRolling`/`rollNext`).

Games only need to honor the opts contract above. (There is no separate 🎲 button
anymore — ticking every game is the old "surprise" behavior.)

### Session limit ("Questions" dropdown)

Optional parent control on the config screen (persisted as `questionLimit`): ∞ (default,
unlimited) or a cap of 5/10/15/20 correct answers. app.js implements it purely
through the existing `rounds`/`onCycleComplete` contract — **games need no changes**.
Single game: launched with `rounds = limit`. Rolling: each leg runs
`min(ROLLING_ROUNDS, remaining)` so the session ends exactly on the limit. On
completion, `finishSession()` swaps the game container for a boring-calm congrats
screen (🎉 + `allDone` string); it has no buttons — the long-press corner is the
only exit. This is a session-length cap, not scores/progression.

### Asset fallback rule

Games must work with **zero assets present**. `AnimalRegistry.imageFor()` falls back to a
big emoji; `SoundKit.playAnimal()` falls back to TTS onomatopoeia. Dropping real files into
`assets/` upgrades the experience with no code change.

## Game backlog (build in roughly this order)

1. ✅ **Shapes** (`shapes`) — "where is the circle?", 3 procedural SVG shape cards.
   Fully asset-free — this is the flagship game while art is being produced.
2. ✅ **Animal sounds** (`animal-sounds`) — hear a sound, tap the right animal
   (works asset-free via emoji + TTS fallbacks; upgrade by dropping files in assets/).
3. ✅ **Counting taps** (`counting`) — "tap three apples!", voice counts along each
   tap, celebrate when all are counted (asset-free via emoji; upgrade by dropping
   files in assets/images/objects/).
4. ✅ **Discover the animals** (`free-play`) — a spoken question ("Discover the
   animals!") over a trio of 3 animals; tapping any plays its sound then speaks
   its name (no quiz, no fail states). Once all 3 are discovered a fresh trio
   fades in. Asset-free via emoji + TTS fallbacks. Each completed trio counts as
   one "answer" so rolling mode and the session limit work unchanged.
5. ✅ **Color hunt** (`color-hunt`) — "find the red balloon!", 3 differently-
   colored balloons; right = celebrate + speak the color name to reinforce it,
   wrong = gentle wiggle. Fully procedural SVG (6 colors), zero assets.
6. ✅ **Peekaboo** (`peekaboo`) — one animal hides behind a soft pastel blanket;
   tapping lifts it, bounces the animal, plays its sound and speaks its name. No
   wrong answer (each reveal = one "answer"). Asset-free via emoji + TTS fallbacks.
7. **Pop the bubbles** — floating bubbles with animals/numbers inside.
8. **Feed the animal** — tap the right food for the hungry animal.
9. **Shape sorter** — tap-based (not drag), match shape to hole; reuse ShapeRegistry.
10. Later/more complex: simple piano, memory pairs, puzzles.

## Art & asset generation

Target art style: flat kawaii vector (round heads, closed curved-line smiling
eyes, cheek blush, soft pastels, no outlines). **Reusable image-generation
prompt templates live in `docs/asset-prompts.md`** — use them for any new
animal/object/UI art so the style stays consistent. Asset naming conventions
are in each `assets/*/README.md`; the app auto-detects files, no code changes.

## Style guide (tokens live in styles.css)

- Paper `#FBF7EF`, ink `#4A4440`, sage `#A8C5A0`, sky `#A9C7DE`,
  butter `#F5D98B`, coral `#EFA48B`, card `#FFFEFB`.
- Font: Nunito (rounded, friendly). Radius 28px on cards. Soft shadows only.
- Touch targets ≥ 120px. `prefers-reduced-motion` respected.

## Testing notes

- Primary targets: Safari on iPad & iPhone. Test TTS voices per language there
  (`speechSynthesis.getVoices()` loads async on iOS — SoundKit handles this).
- Serve locally with `python3 -m http.server` (ES-module-free, but file:// blocks audio
  fetches in some browsers, so prefer a local server).
