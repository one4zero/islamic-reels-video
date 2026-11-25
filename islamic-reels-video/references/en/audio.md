# Audio

## Voice (`scripts/prep_voice.py`)
- **Speed-up** usually +2 % (ElevenLabs) … +4 % (a client's live voice). Only rubberband
  (`formant=preserved`, `pitchq=quality`) and only to WAV — atempo and re-encoding give a "metallic" sound.
  If unsure, let the user listen to 15–20 s first.
- **Pauses:** longer than 0.6 s are shortened to ~0.45 s; keep meaningful transitions (scene change, after a
  strong number) longer with `--keep time:length`. Cuts happen in silence with a 12 ms crossfade.
- **Cleanup:** `highpass 60 Hz`; `--denoise` (afftdn) for messenger voice messages.
- **Loudness:** voice ≈ −16 LUFS mono, limiter −1.5 dBFS. In Remotion's stereo mix mono sounds ~3 dB louder
  → the final video is ≈ −13…−14 LUFS, which is fine for Instagram.
- **Timings** are measured on the processed file (prep_voice first, then transcribe/align).
- A mistake in the voiceover (wrong hadith wording, a word) — suggest regenerating one sentence in
  ElevenLabs and splicing it in (ffmpeg concat with short crossfades).

## Background
- **A nasheed without instruments** (the user sends it): `scripts/mix_bed.py` — loop with a 4 s crossfade,
  base level −13 dB, ducking under the voice (sidechain, ~5–6 dB), result ≈ −31 LUFS (~15 dB below the
  voice), smooth in and out. The nasheed must not "jump out" during 2–3 s pauses.
- **Music-free ambience** (if there is no nasheed or the client asks): wind for the whole video
  (`gen_sfx.py --ambient`, ≈ −34 LUFS), per scene — rain, birds, distant fire; volume in Remotion 0.2–0.75
  with smooth fades.
- No instrumental music, beats or songs; no constant hiss or noise.

## Sound effects (`scripts/gen_sfx.py`)
All synthesized from noise (no musical tones): whoosh (transitions), tick (numbers, lanterns, labels),
lock (reticle), boom (soft hit on a key number), roll (counter spinning), riser (build-up), thud (fall),
crack (crack), leaf (rustle), sparkle/shimmer (calligraphy, ayah), birds, rain, fire.

Levels in Remotion (`volume`): whoosh 0.03–0.04, tick 0.02–0.05, shimmer 0.03–0.04, lock 0.05–0.06,
thud/boom 0.1–0.12, rain 0.2. Effects that are too loud are the most common complaint — quieter is better.
Put an effect on a word/event, not "everywhere": at most one effect per 2–4 seconds.

## Checking the final MP4
```bash
ffmpeg -i out.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -A20 Summary   # I ≈ −13…−16 LUFS, Peak ≤ −1 dB
ffmpeg -ss 40 -t 5 -i out.mp4 -af volumedetect -f null -                    # levels in pauses/speech
```
