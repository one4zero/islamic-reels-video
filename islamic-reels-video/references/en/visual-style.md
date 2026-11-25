# Visual style and motion design

## Contents
1. Principles
2. Proven styles
3. How to build a scene
4. Transitions
5. Catalog of effects and graphics
6. Special scenes (the Prophet's name ﷺ, dialogues, hook, ending)
7. What to avoid (common mistakes)

## 1. Principles
- **Every scene = background + motion + graphics.** A picture without motion and graphics looks like
  "text over a picture" — the main reason a video looks weak.
- **No more than two photos in a row** without a graphic screen between them. A graphic screen is an
  animated "cinematic" background (light, fog, bokeh, sparks) + infographics/typography.
- **One core metaphor.** The best videos were built on one image that develops with the voiceover:
  counter 117,000,000,000 → 8 billion → 7 %; seed → roots → sprout → tree → fruit → blossom.
- **Sync.** Every on-screen event lands on a specific spoken word (`W(para, "word")`).
- **Hook in the first 2 seconds:** a big question + motion (a scrambling digit counter, a warp through
  stars, calligraphy with a shine, an anatomical diagram).
- **Correct proportions**; part of the picture may be cropped by the frame edge — that's fine.

## 2. Proven styles
**A. "Space + documentary infographics"** — for author videos about numbers, history, the Day of Judgement.
Dark navy/black, stars, Earth at night, gold accents (#e6c27a), cold starlight. Infographics: digit counter
(scramble → lock), a 10×10 grid of people icons, a clock dial, scales, reticles, a perspective grid over a
crowd, orbits over Earth, a network of city lights, pulse rings.

**B. "Client brand"** — e.g. a Quran school with an emerald-and-gold identity. Brand palette (emerald, gold,
pink/cream roses), brand motifs (hanging golden lanterns, golden sparkles falling from above, an
eight-pointed star ornament from the logo, a medallion in a wreath), lighter and warmer. Logo from the
client's file (`prep_art.py fromblack` / `medallion`).

**C. Other ideas that were offered:** "plain of gathering" (dawn, a sea of silhouettes), "paper
infographics" (light background, lines, archive look). Show the user 2–3 style-board stills if no style
is set.

## 3. How to build a scene
- **Background:** a 9:16 picture (`Shot` with a camera: slow push-in/pull-out/pan; zoom ≥ 1, the camera never
  leaves the picture — otherwise a dark strip appears) or graphics (`CineBg`, `EmBg`, `Ornament`, the
  garden, etc.).
- **Depth:** above the background, particles and light at different "depths" (Dust, Twinkle, two layers of
  Fog, Bokeh, GoldFall, GodRays, a Flare on the horizon). This gives parallax without cutting the picture.
- **Graphics in picture coordinates:** labels on figures, reticles, threads, grids — attach them to picture
  points and convert through the camera (`toScreen`, `gToScreen`) so they "stick".
- **Scrims** at the top/bottom under text — soft, per scene.
- **Text:** captions at the top (y ≈ 300) or under the infographics; quotes in a glass panel.

## 4. Transitions
`transIn(trans, p)` in `fx.tsx`:
- `iris` — circular reveal with a gold ring (from the center of an object: from a galaxy of dots into a
  graveyard; from a clock dial into an hourglass; into/out of the "The Prophet ﷺ said" card).
- `wipe` — a shutter from the center line with gold edges (change of topic).
- `zoom` — push forward with blur (fly "into" something).
- `sweep` — a diagonal light band (warm, bright scenes).
- `flash` — a flash (an impact: "fire").
- `cut` + dissolve — a crowd crumbles into dust with a front moving top to bottom, revealing the hero.
Alternate; don't repeat the same transition three times in a row.

## 5. Catalog of effects and graphics (assets/remotion-kit/src)
- `fx.tsx`: GodRays, Flare, Flash, Fog, Orbits/CityNet (Earth), PerspGrid, ScanBeam, Ash (dust/ash),
  Trails (light trails), FilterDefs (heat `url(#heat)`, dissolve `url(#dis)`), Ornament (Islamic geometric
  ornament + rosette), Calligraphy (Arabic with a shine), transIn/zoomOut, Bokeh, CineBg, Warp (warp through
  stars), PeopleGalaxy (a disc of dots, "1 dot = N people").
- `info.tsx`: Digits + scramble/padded/plain (counter), PeopleGrid (100 people icons fly up and settle into a
  grid), NameTicker (names ribbon + clock dial), Reticle/Markers, Orbs (lights of deeds), Embers.
- `gfx.tsx`: EmBg (brand-color background), GoldFall, Lantern (golden lantern), BookIcon (open book in line
  art), Icon (flame/mountain/star), ScoreRing (score ring), Route (point A → B → now), Badges, NamePlate
  (name in a serif), Statement (big phrase), LetterSwarm (Arabic alphabet swirling).
- `garden.tsx`: a metaphor world — sky (night → dawn → spring), a soil cross-section, seed, cracking stone,
  roots, sprout, tree (dome, foliage, fruit, blossom), rain/drops of knowledge, warmth, breeze, petals.

## 6. Special scenes
- **"The Prophet ﷺ said"** — NO random images (e.g. a crowd's feet under the Prophet's name ﷺ is a gross
  mistake). A dedicated card: dark background + an ornament drawing itself + calligraphy
  «قَالَ النَّبِيُّ ﷺ» + the caption "THE PROPHET ﷺ SAID:". Enter and exit with `iris`.
- **A dialogue from a hadith** (question/answer, e.g. Aisha رضي الله عنها) — a graphic scene: two glass panels
  "… ASKED" / "HE ANSWERED" with a connecting line, background — a quiet ornament and fog.
- **Ayah/hadith** — a glass panel (`Quote`): the source on top, Arabic (typeset in code) with a shine, the
  translation in italics word-by-word with the voice.
- **Labels for people in a picture** (brother, mother, father…) — a dot above the head, a line, a word in
  caps; on the spoken word — "the thread breaks" (if it fits the meaning).
- **Ending** — return to the hook image (Earth, the first step, the mushaf), a card with logo/"Amin"/
  "Subscribe" (keep it unless the user asks to remove it).

## 7. What to avoid (common mistakes)
- People and characters drawn in code look crude and cartoonish — people only from AI images.
- A non-sharia hijab — in prompts: full modest jilbab/khimar, no figure outline.
- People too small relative to the room — watch the scale; better larger and cropped by the frame edge.
- "A slider": 3 pictures in a row without graphics — insert graphic screens.
- Obvious labels (like "two houses") — label only where it adds meaning.
- Empty frames with no events for more than 2–3 s; unnatural shapes like an "umbrella" tree — check the
  stills and fix.
