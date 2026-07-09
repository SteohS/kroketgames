# Toddler Mini-Games

Calm little web games for a 2.5-year-old. Static HTML/CSS/JS — no build step.
See `CLAUDE.md` for product decisions, architecture and the game backlog.

## Run locally

```bash
cd kroketgames
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening `index.html` directly via file:// mostly works too, but audio-file
fallback detection is more reliable over http.)

## Test on your iPad/iPhone (same Wi-Fi)

1. Run the local server as above.
2. Find your computer's local IP (`ipconfig getifaddr en0` on macOS).
3. On the iPad, open `http://<that-ip>:8000` in Safari.

## Deploy to GitHub Pages

The repo is already set up to publish from the `main` branch
(**Settings → Pages → Deploy from a branch → main, folder / (root)**), so:

```bash
git push          # every push to main updates the live site (~1 min later)
```

The app is live at `https://<your-username>.github.io/kroketgames/`.

> Bump the `?v=` query on the CSS/JS `<script>`/`<link>` tags in `index.html`
> whenever you change those files, so Safari doesn't serve a stale cached copy.

## Install on the iPad like an app

Open the URL in Safari → Share → **Add to Home Screen**.
Launches fullscreen (no browser bars). For full toddler lockdown, also enable
**Guided Access** (Settings → Accessibility) and triple-click the side button
when handing over the iPad.

## In-app parent controls

- Language dropdown (FR/NL/EN) at the bottom of the menu screen.
- Tick the games you want. One ticked → it plays on its own; several ticked →
  they rotate (a fresh game every few correct answers) until you exit.
- **Questions** dropdown next to it: ∞ (default, plays forever) or a cap of
  5/10/15/20. When set, play — whether a single game or the multi-game rotation —
  stops after that many correct answers and shows a "well done!" screen. The
  choice is remembered.
- To exit a game (or the well-done screen): **press and hold the top-left corner
  for 3 seconds** (a small ring fills up as you hold). This is the only way out.
- **Credits** link (also in the menu footer) opens a popup listing the third-party
  assets used. See below.

## Credits & third-party assets

Attribution for assets sourced from elsewhere. This list is mirrored in-app by the
**Credits** popup on the menu screen — keep the two in sync (the app reads from the
`ASSET_CREDITS` array in `js/app.js`).

- **Animal sounds** — free sound effects by [Mixkit](https://mixkit.co/free-sound-effects/animals/).
  Mixkit's free license requires no attribution; credited here anyway.
- **Animal sounds** — jungle & farm animal sounds from
  [Animal-Sounds.org](https://www.animal-sounds.org/jungle-animal-sounds.html).

When you add assets from a new source, add an entry both here and in the
`ASSET_CREDITS` array in `js/app.js` (no other code changes needed).
