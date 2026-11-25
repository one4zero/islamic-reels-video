# The component kit (assets/remotion-kit)

Remotion 4.0.545, 1080×1920, 30 fps. `scripts/new_project.sh <repo> reel1` copies the kit into a new folder
and downloads the fonts.

## Files
| File | Contents |
|---|---|
| `src/timing.ts` | `WORDS` (src/words.json), `f(ms)`, `s(sec)`, `W(para, "word", n)`, `WE(...)`, `wordTimes`, `TOTAL` |
| `src/ui.tsx` | fonts (local!), palette `C`, `SAFE`, `camAt`/`Shot` (picture with a camera), `Scrim`, `Dust`, `Twinkle`, `Grain`, `Watermark` + `WATERMARK`, `SafeProbe` |
| `src/type.tsx` | `Cap` (word-synced caption), `Kicker`, `Quote` (glass ayah/hadith panel) |
| `src/fx.tsx` | light, fog, transitions, ornament, calligraphy, CineBg, Warp, PeopleGalaxy and more (see visual-style.md) |
| `src/info.tsx` | digit counter, PeopleGrid, NameTicker, Reticle, Markers, Orbs, Embers, `toScreen` |
| `src/gfx.tsx` | EmBg, GoldFall, Lantern, BookIcon, Icon, ScoreRing, Route, Badges, NamePlate, Statement, LetterSwarm |
| `src/garden.tsx` | the garden metaphor: Sky, Soil, Seed, Stone, Roots, Sprout, Tree, Rain, Petals, Warmth, Breeze, `plantState` |
| `src/Scenes.tsx` | the edit TEMPLATE (T, shots, Overlays) |
| `src/Reel.tsx`, `Root.tsx`, `Sfx.tsx` | root (`data-reel-root`), the `Reel` composition, sound |
| `public/fonts` | Montserrat (variable), Lora (regular and italic), Amiri (Arabic) — `scripts/get_fonts.py` |
| `public/fx/fog.png` | fog texture (`scripts/gen_fog.py`) |

## Timing
- `W(para, "word", nth)` — the frame where the word starts, found **by prefix** in paragraph `para` (a line
  of script.txt). Short words ("a", "I", "in", or Russian «с», «и», «а», «в») match the start of other words →
  for them **always use `WE`** (exact match) and check nth.
- `wordTimes` (inside Cap/Quote): walks the voiceover from frame `at`; a number "consumes" the next spoken
  word; a sign (ﷺ, —) takes the previous word's time. So a caption's `at` must be ≈ the start of its first word.
- Duration: `TOTAL = s(voice length + ~1.2)`.

## Scenes
```tsx
const shots: ShotDef[] = [
  { key: "earth", from: 0, fin: 0, trans: "cut", bg: <Shot fr={fr} from={0} to={TOTAL} src="art/earth.jpg" cam={CAM.earth} fin={0}>{/* graphics in picture coordinates */}</Shot> },
  { key: "galaxy", from: T.galaxy, trans: "zoom", bg: <CineBg fr={fr} at={T.galaxy} /> },
];
```
- A scene is visible from `from` until `next.from + next.fin` (overlap for the transition).
- Camera `CamKey = [frame, zoom, centerX, centerY]` in the 1080×1920 picture coordinates; `camAt` keeps it
  inside the picture. For custom worlds (the garden) — `gcam` without limits.
- Photo-free screens: `CineBg` (space), `EmBg` (brand), the `Garden`, cards on `Ornament`.

## Text
```tsx
<Cap fr={fr} at={W(3, "Now")} until={W(3, "It") - 2} y={540} text="There are now more than | *8 billion* of us" size={54} />
<Quote fr={fr} at={W(6, "He") - 4} until={T.next + 4} y={300} label="SURAH MARYAM · 19:94"
  arabic="لَقَدْ أَحْصَاهُمْ وَعَدَّهُمْ عَدًّا" text="“He has enumerated them | and *counted* them”" textAt={W(6, "He")} />
<Calligraphy fr={fr} at={T.prophet + 6} until={T.after + 6} y={770} text="قَالَ النَّبِيُّ ﷺ" />
```
`until` — when the block is gone (finishes fading). The next caption's `at` ≥ the previous one's `until`.

## Palette and watermark
- `C` in ui.tsx — change it to the brand (an emerald palette example is in the comment).
- `WATERMARK.text` — the author's handle for their own page; `""` (default) — no watermark.
  `WATERMARK.shots` — 5 appearances of 2 s (time, place, drift) — choose them from the stills: inside the
  safe zone and where there is no text.

## Zone check
`<Reel probe>` renders `SafeProbe`: it measures real text boxes. Scripts: `probe.mjs` + `check_safe.py`.
Give new text blocks `data-safe="name"`; blocks with words — `data-lines={number of lines}` and `data-w` on
the words (Cap/Quote already have them).

## Performance
- Rendering 2 minutes ≈ 5–8 min on 4 cores (`--concurrency=4`). Heavy: blur on hundreds of elements —
  group them and blur the group with one SVG filter; backdrop-filter — only on panels.
- Pictures — via `<Img>` (Remotion waits for loading); Remotion does not wait for SVG `<image>`.
