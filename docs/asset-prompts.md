# Asset generation prompts

Reusable prompts to generate art in one consistent style (based on the chosen
reference: flat kawaii farm animals — round heads, closed smiling eyes, blush,
soft pastels, no outlines). Fill the `[SUBJECT]` slot and paste into any image
generator (Midjourney, DALL·E, Ideogram, Recraft...).

## Base style block (append to every prompt)

> …in a cute flat kawaii vector style for a toddler app: soft pastel colors,
> rounded chubby silhouette, no outlines, flat colors with at most one subtle
> darker flat tone for shading, simple face with closed happy eyes drawn as
> thin downward-curved lines, tiny dot nose or small muzzle, small pink blush
> circles on the cheeks, gentle smile. Minimal detail, large simple forms,
> friendly and calm, no gradients, no texture, no 3D, no photorealism, no text,
> no watermark. Centered on a plain transparent background, square format,
> 1024×1024.

## Templates

### Animal (head/face only — matches the reference)
> A [ANIMAL] head, front-facing, …base style block…

Examples of `[ANIMAL]`: cow with black-and-white patches and pink muzzle ·
yellow chick · brown beaver with two front teeth · white hen with red comb ·
grey goat with small horns · fluffy cream sheep · pink pig · brown foal ·
white rabbit with long ears and whiskers.

### Full-body animal (for future games like feeding / peekaboo)
> A full-body [ANIMAL], standing, front-facing, short stubby legs,
> …base style block…

### Object / nature (trees, fruit, everyday items for color hunt & counting)
> A [OBJECT], e.g. "a round green tree with a brown trunk", "a red apple with
> one leaf", "a wooden fence post", …base style block…

### UI element (buttons, icons)
> A round app button icon showing [SYMBOL] (e.g. "a white speaker symbol on a
> soft yellow circle"), …base style block… — but with NO face and NO blush.

### Background / scene (menu or game backdrop)
> A wide gentle farm landscape background: soft blue sky, big rounded white
> clouds, a smooth green meadow hill in the lower half, a few light grass
> tufts and small pebbles, …base style block… — landscape format 2048×1024,
> opaque (not transparent), NO characters, NO faces, very low detail so
> foreground cards stay readable.

## Consistency tips

- Generate all animals **in one session/thread** with the same style block so
  the model keeps the look coherent; regenerate outliers rather than accepting
  a mismatched one.
- Ask for transparent-background PNG explicitly; if the tool can't, generate
  on plain white and remove the background afterwards.
- Keep the palette close to the app tokens: cream `#FBF7EF`, sage `#A8C5A0`,
  sky `#A9C7DE`, butter `#F5D98B`, coral `#EFA48B`, lilac `#C5B3D6`.
- Export/downscale to ≤ 1024px, keep each file under ~200 KB.
- Save with the exact filenames from `assets/images/animals/README.md`
  (e.g. `cow.png`) — the app picks them up automatically, no code changes.
