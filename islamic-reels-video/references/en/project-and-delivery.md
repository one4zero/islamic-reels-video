# Project, rendering, delivery

## Repository
- Each video is its own folder at the root: `reel1/`, `reel2/`… (next free number). Don't mix code and
  assets of different videos.
- Inside: `src/`, `public/{audio,art,sfx,fx,fonts}`, `scripts/` (scripts of this video), `audio_src/`
  (client sources: ogg, logo, pictures), `script.txt` (text as spoken), `out/reelN.mp4`, README.
- `.gitignore`: node_modules, dist, build, .env, .remotion/, __pycache__/. **Don't ignore `out/`** if the
  final MP4 is committed.
- Keys and tokens — only from environment variables, never in files.
- A root `CLAUDE.md` with the project rules (folders, MP4 size limit, keys, sound without instruments).

## Rendering
```bash
npx remotion render Reel out/reelN.mp4 --crf=20 --audio-bitrate=192k --concurrency=4   # final
npx remotion render Reel /tmp/preview.mp4 --scale=0.5 --crf=26                          # motion preview
npx remotion render Reel /tmp/part.mp4 --frames=0-359 --scale=0.5                       # a part
```
- A 2–2.5-minute video at CRF 20 is ~45–70 MB. GitHub warns about files > 50 MB and rejects > 100 MB —
  keep it ≤ 90 MB (raise CRF to 22–24 if needed). Don't commit intermediate renders.
- After rendering: `ffprobe` (1080×1920, 30 fps, duration), loudness (audio.md), a sheet of frames from the MP4.
- Link for the user: `https://github.com/<owner>/<repo>/blob/<branch>/reelN/out/reelN.mp4`.

## What to give the user
1. Before rendering: sheets of key frames (+ a sheet with the safe zone), a 540×960 preview if needed.
2. Final: the link, file parameters, a short list of scenes, what was checked, what they should check
   (text vs voiceover discrepancies, disputed wording).
3. On request: an Instagram description (hook + list of ayat/hadith with sources), a cover prompt.

## Known pitfalls (already solved)
- **Fonts** must load locally via `@remotion/fonts` (in closed environments the render can't download
  Google Fonts). Lora regular/italic, Montserrat variable, Amiri — in `public/fonts` (`scripts/get_fonts.py`).
- **The Remotion template** adds `out` to .gitignore — remove it if you commit the MP4.
- **faster-whisper**: decode with ffmpeg to f32 and pass the array (av.open fails on some files).
- **Diacritics** in text with `background-clip: text` get clipped — vertical padding is required.
- **Measuring text** in flex containers via Range used to be offset — `SafeProbe` measures text nodes
  relative to `[data-reel-root]`.
- **CSS `filter: url(#svgFilter)`** on `<Img>` works in the render (heat, dissolve).
- **Deleting by a variable glob** — write `"${DIR:?}"/*.jpg` so an empty variable never becomes `/*`.
- **Messenger voice messages** are quiet (≈ −30 LUFS) — prep_voice raises them; add `--denoise`.
- **Long renders** — run in the background and wait for completion; don't poll in a loop.
