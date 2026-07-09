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
  (3 s) on the top-left corner zone (shows a filling ring for the parent). Pinch-zoom,
  text selection, pull-to-refresh and double-tap zoom are disabled.
- **Audio unlock**: iOS blocks audio until a user gesture — the menu's game buttons count
  as that gesture; TTS/audio is initialized on first tap.
- **Real illustrations, not emoji**: emoji are only a *fallback* while image assets are
  missing (see asset conventions below). Parent will source CC0 art (e.g. Kenney.nl).
- **No offline / service worker for now.** PWA manifest yes (fullscreen on home screen).
- **Stack**: plain HTML + CSS + JS modules. No frameworks, no bundler.

## Architecture

```
index.html            shell: menu screen + game container + settings
css/styles.css        design tokens + all styling
js/app.js             navigation, settings, long-press exit, confetti
js/audio.js           SoundKit: TTS wrapper + WebAudio synth dings + file playback
js/i18n.js            all user-facing strings & praise phrases (fr/nl/en)
js/data/animals.js    shared animal registry (names per language, asset paths, emoji fallback)
js/games/*.js         one file per mini-game, registered via Games.register(...)
assets/images/...     illustrations (see naming conventions in each folder's README)
assets/audio/...      animal sounds + UI sounds (optional overrides for synth sounds)
```

### Adding a new game

1. Create `js/games/<name>.js`, call `Games.register({ id, icon, start(container, opts), stop() })`.
2. Add its `<script>` tag to `index.html` (registration order = menu order) and its
   title to `js/i18n.js` (`games.<id>`).
3. Reuse `SoundKit` for all audio and the `js/data/*` registries — assets are shared.
4. **Support rolling mode**: `opts` may contain `{ rounds, onCycleComplete }`. After
   `rounds` correct answers, call `opts.onCycleComplete()` instead of starting a new
   round (see shapes.js for the pattern). `stop()` must silence the game immediately.

### Rolling ("Surprise") mode

The 🎲 button on the menu shuffles all registered games and rotates through them,
`ROLLING_ROUNDS` (3) correct answers per game, looping forever until the parent
exits. Implemented in app.js (`startRolling`/`rollNext`); games only need to honor
the opts contract above.

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
4. **Free-play animal board** — grid of animals, tapping any plays its sound (no quiz).
5. **Color hunt** — "find something red!" among everyday objects.
6. **Peekaboo** — animal partially hidden, tap to reveal.
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
