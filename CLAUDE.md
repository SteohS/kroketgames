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
- **Content categories**: games are content-agnostic. A **category** (Animals, Fruit,
  Shapes, Colors) supplies the items; the parent picks categories first on the config
  screen, and each game runs over a single compatible category per play. See the
  "Content categories" section below.
- **Sound is optional per item**: a missing `assets/audio/<category>/<id>.mp3` simply plays
  **no sound** — there is no spoken-onomatopoeia substitute. Fruit is a soundless category.
- **Stack**: plain HTML + CSS + vanilla JS. Each concern is a global-script IIFE
  (`Games`, `App`, `SoundKit`, `I18N`, the registries, `Content`, `GameKit`, `RegistryKit`)
  — not ES modules. No frameworks, no bundler.

## Architecture

```
index.html            shell: config screen (game picker + settings) + game container
css/styles.css        design tokens + all styling
js/app.js             config screen, game selection, navigation, settings, long-press exit, confetti
js/audio.js           SoundKit: TTS wrapper + WebAudio synth dings + file playback + stop()
js/i18n.js            all user-facing strings & praise phrases (fr/nl/en)
js/data/_registry.js  RegistryKit: shared image-with-emoji-fallback .art builder
js/data/_categories.js Content: category taxonomy (which games render which category)
js/data/animals.js    item registry — Animals category (singular+plural names, sound)
js/data/fruit.js      item registry — Fruit category (soundless)
js/data/shapes.js     procedural Shapes registry (SVG; rendered by find-it)
js/data/colors.js     procedural Colors registry (SVG balloons; rendered by find-it)
js/games/_kit.js      GameKit: prompt bar, wiggle, palette, per-game lifecycle (session)
js/games/*.js         one file per mini-game, registered via Games.register(...)
assets/images/<cat>/  illustrations per category (see naming conventions in each README)
assets/audio/<cat>/   per-category sounds + ui/ sounds (optional overrides for synth)
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
4. **Be category-agnostic**: read the injected registry as `const R = opts.category` and
   drive the round through its interface (`R.pick(n)`, `R.artFor(item)`, `R.nameOf`,
   `R.pluralOf`, `R.hasSound`, `R.playSound(item)`, `R.findCard(item)`) rather than a
   hardcoded global. List the game under each category it supports in
   `js/data/_categories.js`. `find-it` shows the widest reach: because **every** registry
   (item **and** procedural) exposes the uniform `findCard` facade, one game can span all
   four categories with no branching. A game that instead needs a registry's raw structure
   (e.g. a future shape-sorter consuming `pick`'s `{shape,color}` pairs directly) can stay
   1:1 with that registry. See the "Content categories" section.
5. **Support rolling mode**: `opts` may contain `{ rounds, onCycleComplete, category }`.
   After `rounds` correct answers, call `opts.onCycleComplete()` instead of starting a new
   round (see shapes.js for the pattern). `stop()` must silence the game immediately.

### Content categories

`js/data/_categories.js` defines `Content` — the taxonomy the config picker is built from.
Each descriptor is `{ id, icon, registry, games:[...] }`; `Content.categoriesForGame(id)`
is the reverse lookup. The four categories today:

- **Animals** (`AnimalRegistry`, has sound) → find-it, counting, free-play, peekaboo, animal-sounds
- **Fruit** (`FruitRegistry`, soundless) → find-it, counting, free-play, peekaboo
- **Shapes** (`ShapeRegistry`, procedural) → find-it
- **Colors** (`ColorRegistry`, procedural) → find-it

**Item registries** (Animals, Fruit) share one interface: `id, hasSound, all, pick(n),
artFor(item), nameOf(item)` (singular w/ article), `pluralOf(item)` (article-free plural,
for counting), `playSound(item)` (Promise; no-op for soundless categories), and
`findCard(item)` (see below). The app injects the chosen registry as `opts.category`;
`app.js`'s `pickCategoryFor(game)` resolves one enabled, compatible category per play (and
per rolling leg, so legs can vary the category). The sound-quiz (`animal-sounds`) is listed
only under Animals, so soundless categories never include it. Any category-named prompt
(e.g. `discoverPrompt`) must key off the category (`I18N.t('discoverPrompt', { cat: R.id })`)
— never hardcode "animals".

**Find-it card facade**: the category-agnostic `find-it` game runs over *all four*
categories, so **every** registry (item **and** procedural — shapes/colors) also exposes
`findCard(raw)` → `{ id, art, prompt, name }`: `raw` is one element from that registry's
`pick(n)` ( `{shape,color}` for shapes, a plain item elsewhere), `art` is the `.art`
element, `prompt` is the fully-resolved spoken question (each registry chooses its own form
— `whereIs` for shapes/animals/fruit, `colorPrompt` for colors), and `name` is what the game
speaks to reinforce a correct tap. This lets `js/games/find-it.js` stay fully generic
(`R.pick(n).map(R.findCard)`) with no per-category branching.

**Adding a category**: create `js/data/<id>.js` (item interface above), add one descriptor
line in `js/data/_categories.js`, add its `<script>` before `_categories.js` in `index.html`,
add `categories.<id>` label to `i18n.js`, and (optionally) drop art/sound under
`assets/{images,audio}/<id>/`. No game changes needed.

### Config screen (home) & rolling mode

The home screen is a parent-facing **configuration** page (`renderConfig` in app.js).
The **first** choice is a row of tickable **content-category** cards (persisted as
`selectedCategories`, default all); below it the tickable **game** cards grouped by age band
(`ageBands` labels), persisted as `selectedGames`; then the voice + questions options and a
**Start** button. A game card is greyed/disabled when no enabled category can render it
(`isEligible`); only *playable* games (ticked **and** with an enabled compatible category)
count. Start:
- **one playable game** → plays it straight (`playGame`);
- **several** → shuffles them and rotates, `ROLLING_ROUNDS` (3) correct
  answers per game, looping forever until the parent exits (`startRolling`/`rollNext`).

Each launch resolves a compatible category via `pickCategoryFor` and injects it as
`opts.category`. (There is no separate 🎲 button anymore — ticking every game is the old
"surprise" behavior.)

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

Games must work with **zero assets present**. `AnimalRegistry.artFor()` (and every item
registry) falls back to a big emoji when the PNG is missing; `SoundKit.playSound(category,
id)` plays **nothing** when the mp3 is missing (no TTS substitute). Dropping real files into
`assets/` upgrades the experience with no code change.

## Game backlog

The five shipped games (menu order = registration order in `index.html`):

1. ✅ **Find it** (`find-it`) — the category-agnostic "where is it?" game: a spoken
   prompt names one item ("Où est le rond ?", "Trouve le ballon rouge !", "Où est la
   vache ?") over 3 cards; right = celebrate + reinforce the name, wrong = gentle wiggle.
   Runs over shapes/colors/animals/fruit via each registry's `findCard` facade. Fully
   asset-free for shapes/colors (procedural SVG); emoji fallback for animals/fruit.
   (Merged the former separate `shapes` and `color-hunt` games — see "Find-it card facade".)
2. ✅ **Sounds** (`animal-sounds`, titled "Which sound? / Quel bruit ?") — a sound plays
   plus a sound-first prompt that does **not** name the animal ("Qui fait ce bruit ?");
   tap the right card, which then celebrates and speaks the animal's name so the child
   hears what made the noise. Animals only (the sound is the clue); an animal with no mp3
   just relies on the spoken prompt. Emoji fallback for missing art.
3. ✅ **Counting** (`counting`) — "tap three apples!", voice counts along each tap,
   celebrate when all are counted. Runs on any item category (animals/fruit); uses
   `R.pluralOf`. Asset-free via emoji; upgrade by dropping files in the category's dir.
4. ✅ **Discover 3** (`free-play`) — a category-aware spoken question ("Discover the
   animals!" / "Découvre les fruits !") over a trio of 3 items; tapping any speaks its
   name then plays its sound (if the category has one). No quiz, no fail states. Once all
   3 are discovered a fresh trio fades in. Each completed trio counts as one "answer" so
   rolling mode and the session limit work unchanged.
5. ✅ **Peekaboo** (`peekaboo`) — one item (animal/fruit/…) hides behind a soft pastel
   blanket; tapping lifts it, bounces it, speaks its name then plays its sound (if any).
   No wrong answer (each reveal = one "answer"). Asset-free via emoji.

Ideas not yet built (roughly in order):

6. **Pop the bubbles** — floating bubbles with animals/numbers inside.
7. **Feed the animal** — tap the right food for the hungry animal.
8. **Shape sorter** — tap-based (not drag), match shape to hole; reuse ShapeRegistry.
9. Later/more complex: simple piano, memory pairs, puzzles.

## Art & asset generation

Target art style: flat kawaii vector (round heads, closed curved-line smiling
eyes, cheek blush, soft pastels, no outlines). **Reusable image-generation
prompt templates live in `docs/asset-prompts.md`** — use them for any new
animal/fruit/UI art so the style stays consistent. Asset naming conventions
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
