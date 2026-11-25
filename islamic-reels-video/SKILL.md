---
name: islamic-reels-video
description: End-to-end production of vertical Islamic Reels/Shorts/TikTok videos (1080×1920) with Remotion, from script and voiceover to the final MP4 — checking ayat and hadith, motion design, word-synced captions, the Reels safe zone, voice processing (distortion-free speed-up, pause trimming), nasheed-only or ambient background, quiet SFX, prompts for AI images and covers, plus scripts and a reusable component kit. Use this skill whenever the user sends a voiceover or script for a video, asks to "make a reel/short/video", "what images should I prepare", "image prompts", "cover prompt", "render", "captions", "watermark", or works with Remotion, ElevenLabs voiceovers, nasheeds, Quran or hadith in video — even if they don't name the skill. Также для запросов на русском — «сделай ролик/рилс по озвучке», «какие картинки подготовить», «промты для обложки», «отрендери».
---

# Islamic Reels with Remotion — end to end

This skill was distilled from real work on a series of Islamic reels (an author's own page and commissioned
videos for Quran schools). It contains the process, the rules and ready-made tools. Details live in
`references/en/` (English) and `references/ru/` (Russian, identical content) — read the one that matches
the user's language when you reach that step. Code: `assets/remotion-kit/` and `scripts/`.

Talk to the user in their language. Captions follow the voiceover language (English, Russian, Arabic text
in quotes — fonts and Whisper support all of them). Russian version of this file: `SKILL.ru.md`.

## What matters most (and why)

1. **Show first, render later.** Key-frame screenshots (plus a half-resolution preview if motion matters) →
   feedback → the final MP4 only after the user says "render". Exception: the user explicitly says
   "render right away". Rendering is slow and changes after it are expensive.
2. **Motion design, not "text over pictures".** A slideshow of still images looks cheap. Every scene is a
   background + motion (camera, light, particles, fog) + graphics (infographics, frames, lines,
   transitions); put graphic screens on animated backgrounds between photos. → `references/en/visual-style.md`
3. **Clean, elegant all-caps captions**, word-for-word with the voiceover, balanced lines, everything inside
   the Reels safe zone. → `references/en/captions-and-safe-zone.md`
4. **Sharia care.** Never depict the Prophet ﷺ, the Companions or angels; people are faceless, women wear a
   full jilbab; Arabic ayat/hadith text is always typeset in code, never taken from an AI image; every
   ayah and hadith is checked against its source. → `references/en/religious-content.md`
5. **Sound:** a clean, intelligible voice; background is only a nasheed without musical instruments or a
   quiet music-free ambience; sound effects are barely audible. → `references/en/audio.md`
6. **People and complex objects come from AI images** (the user generates them from your prompts);
   abstraction, infographics, plants, light and ornament are made in code. Don't draw characters in code —
   it looks crude and cartoonish. → `references/en/image-prompts.md`

## Process

### 0. Intake
- Voiceover (often an ElevenLabs mp3 with tags like `[calm]`, `[whispers]`, or a client's voice message
  ogg) and the text.
- For a client: logo, brand colors, organization name.
- Find out and record the video settings:
  - **watermark** — the author's handle (`WATERMARK.text` in ui.tsx) or none (client work);
  - **palette** — default "dark space + gold" or brand colors (`C` in ui.tsx);
  - **background** — a nasheed without instruments (they will send it) or a quiet ambience;
  - **voice speed-up** — usually +2…4 %;
  - **"Subscribe" at the end** — keep or cut.
- No script yet? If the `islamic-reel-script` skill is available, let it write the script.

### 1. Content check (before any images)
Check every ayah (surah:ayah, Arabic text) and hadith (collection and number, exact wording), every number
and scientific claim. If something differs, say so plainly and propose a fix (e.g. "in the hadith of
al-Bara' the angel says 'O good soul' — 'O tranquil soul' is ayah 89:27; regenerate this sentence").
→ `references/en/religious-content.md`

### 2. Plan, style and the image list
- Split the video into scenes by meaning (3–10 s each). For each: background (image or graphics),
  motion/effect, infographics, transition. Hook in the first 2 seconds.
- Offer 2–3 styles (style-board stills can be made in code) or follow the page/brand style.
- Give the user the **full list of images with ready-to-copy prompts**. → `references/en/image-prompts.md`
- For a client — a script by timecodes: "time · text · visuals".

### 3. Project
```bash
bash <skill>/scripts/new_project.sh <repo> reel1    # scaffold from assets/remotion-kit + fonts (get_fonts.py)
```
Repository layout and rules → `references/en/project-and-delivery.md`. Components → `references/en/remotion-kit.md`.

### 4. Audio and timing
```bash
python3 scripts/prep_voice.py voice.mp3 reel1/public/audio/voice.wav --tempo 1.02 [--denoise] [--keep 30.6:0.6]
python3 scripts/transcribe.py reel1/public/audio/voice.wav /tmp/w.json [--lang en]   # words with timings
python3 scripts/align.py /tmp/w.json reel1/script.txt reel1/src/words.json        # text → timings
python3 scripts/gen_sfx.py reel1/public/sfx [--ambient reel1/public/audio/amb_wind.mp3 --duration 155]
python3 scripts/mix_bed.py nasheed.mp3 reel1/public/audio/voice.wav reel1/public/audio/bed.mp3 --duration 122
```
`script.txt` is the text **as it was spoken** (if the voice says "those" but the text says "all", caption
what was spoken and tell the user). One paragraph per line → that line number is the `para` in
`W(para, "word")`.

### 5. Images
```bash
python3 scripts/prep_art.py bg src.png reel1/public/art/name.jpg        # 9:16 background with upscale
python3 scripts/prep_art.py defringe src.png reel1/public/art/cut.png   # clean cut-out edges
python3 scripts/prep_art.py fromblack logo.jpg reel1/public/art/logo.png
```
Find the coordinates of key points in the images (sun, people's heads, horizon) — from a grid preview or by
brightness (numpy) — for labels, flares and reticles.

### 6. Building scenes
`src/Scenes.tsx`: `T` (scene boundaries via `W()`/`WE()`), `shots` (background + camera + transition),
`Overlays` (captions, quotes, infographics). Full working example: `assets/examples/rolik4-Scenes.tsx`
(space + infographics).

### 7. Review
```bash
node scripts/stills.mjs reel1 /tmp/st 30 200 450 ...       # key frames
python3 scripts/contact_sheet.py /tmp/st sheet.jpg [--safe] # sheet for the user
node scripts/probe.mjs reel1 /tmp/probe.txt 0 <frames> 8 && python3 scripts/check_safe.py /tmp/probe.txt
npx remotion render Reel /tmp/preview.mp4 --scale=0.5 --crf=26   # motion preview (not final)
```
Look at the sheets yourself before sending: text overflow, Arabic diacritics, "empty" frames, repetition.
Send the sheets (and preview) and briefly say what happens where.

### 8. Final
```bash
cd reel1 && npx remotion render Reel out/reel1.mp4 --crf=20 --audio-bitrate=192k
```
Check: duration, size (keep ≤ 90 MB if it is committed to git), loudness (≈ −14…−16 LUFS, peak ≤ −1 dB),
frames from the finished MP4. Commit and push, give the link. Offer an Instagram description with hadith
sources and a cover prompt. → `references/en/project-and-delivery.md`, `references/en/covers.md`

## Install requirements
Node.js 20+, ffmpeg (with the rubberband filter), Python 3.10+ with `numpy pillow faster-whisper`, curl.
Remotion downloads its render browser itself. Remotion has its own license (remotion.dev/license).

## References (read per step; `en/` and `ru/` have the same content)
| File | When |
|---|---|
| `visual-style.md` | choosing a style, scenes, transitions, effects, what to avoid |
| `captions-and-safe-zone.md` | captions, quotes, calligraphy, safe zone, checks |
| `religious-content.md` | sharia rules, checking ayat/hadith, Arabic text |
| `audio.md` | voice, speed-up, pauses, nasheed, ambience, SFX, levels |
| `image-prompts.md` | rules and templates for image prompts |
| `covers.md` | cover: composition, title, prompt |
| `remotion-kit.md` | the component kit and how to use it |
| `project-and-delivery.md` | repository layout, rendering, delivery, known pitfalls |
