# Captions, quotes and the Reels safe zone

## Narration captions (`Cap` in type.tsx)
- **Font:** Montserrat 600, all caps, tracking 0.045em, cream color (#f3efe7), shadow for readability.
- **Accents:** `*word*` — gold (#e6c27a); for "fire" — `tone="ember"`. 1–2 accents per phrase.
- **Reveal:** each word appears exactly when it is spoken (rise of 16 px + blur → sharp, 10 frames). No
  bouncing, rotation or "springs" — keep it strict.
- **Exit:** the whole block fades in ~9 frames with a slight rise; the next caption starts after the old one
  has gone.
- **Lines:** break manually with ` | `, 2 lines (3 at most), roughly equal lengths ("line line / line" is
  bad). Block width is 820 px. Guide: at size 54 — up to ~19 characters per line, at 48 — ~21, at 46 — ~23.
  Longer — break it or reduce the size (not below 44).
- **Phrases:** one meaningful phrase of the voiceover = one caption (3–8 words). Don't keep one caption for
  more than ~4 s.
- **Numbers:** write digits ("117 billion", "7%", "3,700 years"): the aligner matches them to the spoken
  words automatically.
- **The Prophet's name:** "The Prophet ﷺ said:" — the ﷺ glyph comes from the Amiri font automatically.
- **No additions:** the caption = what the voice says (not the written version, if they differ).

## Ayah and hadith quotes (`Quote`)
- A glass panel: dark translucent background with blur, a gold frame that draws itself around the
  perimeter, diamonds in the corners.
- On top — the source in tracked caps: "SURAH MARYAM · 19:94", "AL-BUKHARI 7512 · MUSLIM 1016".
- Arabic (Amiri, gold, shine) — **only typeset text**, verified against the mushaf/collection. A long ayah —
  on 2 lines (`textWrap: balance`); ۝ between ayat is fine.
- The translation — Lora italic 600, sentence case (not caps: long sacred text is hard to read in caps),
  quotation marks, words in sync with the voice; gold accents.
- Marks of respect: "Aisha (رَضِيَ اللَّهُ عَنْهَا)" — a small line via `arabicSub`; "He answered" — `arabicSub="ﷺ"`.

## Calligraphy (`Calligraphy`)
Salam, «الْحَمْدُ لِلَّهِ», «قَالَ النَّبِيُّ ﷺ», «رَبِيعَ قُلُوبِنَا» — large, gold with a running shine.
Diacritics (harakat) must be visible: text with `background-clip: text` needs vertical padding (the kit
already sets `padding: 0.45em`), otherwise the marks above/below the letters are clipped.

## Labels, numbers, plates
- `Kicker` — a small caps label (21–24 px, tracking 0.3em) with gold lines on both sides.
- Numbers — Montserrat 250, `tabular-nums`, gold with glow; the 117,000,000,000 counter — no bigger than 92 px.
- `NamePlate` — "MY NAME IS / Name / 42 YEARS" (name in Lora serif with a shine).
- `Statement` — a big serif phrase for the climax ("The path to the Quran / has no age").

## The Reels safe zone (1080×1920)
```
top     0–250       Reels header                        — no text
bottom  1480–1920   handle, caption, audio, buttons     — no text
right   x > 950 at y 1000–1480  button column           — no text
left    x < 100                                         — no text
```
- All text (captions, quotes, labels, watermark, numbers) stays inside x 100…950, y 250…1480.
- Graphics and backgrounds may extend into the interface zones.
- For the cover in the profile grid, the frame is cropped to 3:4 (y 240…1680) — see covers.md.

## Check (required before showing)
1. Mark text blocks with `data-safe="…"`, captions/quotes with `data-lines` (the kit already does).
2. `node scripts/probe.mjs <project> log.txt 0 <frames> 8` → `python3 scripts/check_safe.py log.txt`.
3. Fix: out of zone — move/shrink; extra line wraps — break lines shorter or reduce size; overlaps longer
   than 1 frame — separate them in time or height.
4. Show the user a frame sheet with the zone drawn: `contact_sheet.py --safe`.
