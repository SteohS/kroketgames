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

## Deploy to GitHub Pages (first time)

1. Create a new repository on github.com (e.g. `kroketgames`), public.
2. Push this folder to it:
   ```bash
   cd kroketgames
   git init
   git add .
   git commit -m "First version: menu + animal sounds game"
   git branch -M main
   git remote add origin https://github.com/<your-username>/kroketgames.git
   git push -u origin main
   ```
3. On github.com: repo → **Settings** → **Pages** →
   Source: **Deploy from a branch** → Branch: **main**, folder **/ (root)** → Save.
4. Wait ~1 minute. Your app is live at
   `https://<your-username>.github.io/kroketgames/`.
5. Every future `git push` updates the site automatically.

## Install on the iPad like an app

Open the URL in Safari → Share → **Add to Home Screen**.
Launches fullscreen (no browser bars). For full toddler lockdown, also enable
**Guided Access** (Settings → Accessibility) and triple-click the side button
when handing over the iPad.

## In-app parent controls

- Language dropdown (FR/NL/EN) at the bottom of the menu screen.
- **Questions** dropdown next to it: ∞ (default, plays forever) or a cap of
  5/10/15/20. When set, any game — including Surprise mode — stops after that
  many correct answers and shows a "well done!" screen. The choice is remembered.
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
