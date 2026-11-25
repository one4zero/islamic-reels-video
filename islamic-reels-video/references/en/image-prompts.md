# Image prompts (the user generates, you put them into the video)

## How to deliver
- A list: **file name — which scene/phrase** + the full prompt in a code block (copy in one tap).
- Prompts in English (generators understand it best); explanations in the user's language.
- Usually 8–12 images for a 2-minute video; the rest is graphics in code.
- Say right away what you will make in code (infographics, ayah cards, light, particles) so the user doesn't
  generate extra images.

## Required parts of every prompt
1. **Format and composition:** `Vertical 9:16 composition:` + what is where in the frame; where to leave
   "clean space for text" (usually the upper third/half).
2. **No faces / modesty:** `faceless, seen from behind`, `fully covered, modest`, `full modest jilbab`.
3. **Style suffix of the series** — the same in every prompt of a video, so the images form one world:
   - dark documentary space: `Cinematic documentary space aesthetic, photorealistic, deep black and navy
     tones with cool starlight and soft gold accents, calm and solemn mood, modest Islamic aesthetic`
   - warm/brand: `Cinematic, photorealistic, rich emerald green and gold palette with soft pink accents,
     calm, warm and reverent mood, modest Islamic aesthetic`
4. **Exclusions at the end:** `no text, no letters, no watermark` (+ `no people` if there should be none;
   `no calligraphy` / `no readable text` for a mushaf or books).

## Image types
- **9:16 background scene** (the main type): space, room, plain, sky, a close-up object.
- **Cut-out on a transparent background** (a figure, a hand holding something): `Isolated on a transparent
  background, PNG, no background, no ground shadow`. When received, check the alpha
  (`prep_art.py defringe/cutout`); if the generator gave a black background — `prep_art.py fromblack`.
- **A series "in the same frame"** for a time-lapse (seed → sprout → tree): the same opening of the prompt
  about angle and framing, only the object changes. AI doesn't guarantee a match — use a soft crossfade +
  camera motion when switching.
- **A symbol instead of the forbidden:** angels → `soft radiant beams of white-gold light… Only light — no
  figures, no wings, no beings`; the soul → a column of light/particles rising; the Companions → an empty
  room of the era (`simple ancient house in 7th-century Arabia: mud-brick walls, palm-trunk beams, clay oil lamp`).
- **Mushaf** — closed, on a rehal, nothing written on the cover (`no calligraphy`), or open with fully
  blurred pages. The ayah — in code.

## Template
```
Vertical 9:16 composition: <main object and action>, <where in the frame>, <light: from where, what kind>,
<surroundings and atmosphere: smoke, dust, stars, bokeh>. <Space for text: the upper third of the frame is
clean dark space for text>. <People: all people are faceless, seen from behind, modest clothing / no people>.
<Series style suffix>, no text, no letters, no watermark.
```

## Example (a video about why a deceased person's eyes stay open, 9 images)
room_night — an empty bedroom at night, moonlight, curtain; madinah_room — a house of the Prophet's era ﷺ
with nobody inside; light_upward — a column of light from a window into the starry sky; heaven_light —
parting clouds and rays (light only); kafan_perfume — white cloth and a mabkhara with smoke; qirba_drop —
a drop from the mouth of a waterskin; grief_room — women in jilbabs from behind by a lamp; hands_dua —
hands raised in dua, sleeves covering the wrists; grave_light — a simple grave with light from the earth.
The medical part — in code (eyelid diagram, nerve impulses, a timeline of hours).

## After receiving the images
- Match images to names (attachment order may differ — identify by content).
- Backgrounds: `prep_art.py bg` (upscale to 1440×2560 so push-ins don't blur).
- Find the coordinates of key points (horizon, sun, people's heads, the object) — for labels, flares, reticles.
- Problems (a visible face, crooked hands, text in the image, the wrong hijab) — say so and give a fixed prompt.
