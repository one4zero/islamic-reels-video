#!/usr/bin/env python3
"""EN: Prepares the voiceover: light cleanup, distortion-free speed-up (rubberband), shortening long pauses, loudness ≈ −16 LUFS.
RU: Готовит озвучку: лёгкая чистка, ускорение без искажений (rubberband, тембр сохраняется),
укорачивание слишком длинных пауз, громкость ≈ −16 LUFS с мягким лимитером.
python3 prep_voice.py <in> <out.wav> [--tempo 1.02] [--max-pause 0.45] [--keep 30.6:0.6,112.4:0.85]
  [--lufs -16] [--denoise] [--no-trim]
--keep: паузы, которые оставить длиннее (время в ИСХОДНОЙ записи, сек : длина паузы).
Результат — WAV 48 кГц моно (без повторного сжатия)."""
import argparse, os, subprocess, wave
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('out')
ap.add_argument('--tempo', type=float, default=1.02)
ap.add_argument('--max-pause', type=float, default=0.45)
ap.add_argument('--keep', default='')
ap.add_argument('--lufs', type=float, default=-16.0)
ap.add_argument('--denoise', action='store_true')
ap.add_argument('--no-trim', action='store_true')
a = ap.parse_args()
SR = 48000
KEEP = [tuple(map(float, k.split(':'))) for k in a.keep.split(',') if k]

def ff(*x): subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', *x], check=True)

chain = 'highpass=f=60,' + ('afftdn=nr=10:nf=-58:tn=1,' if a.denoise else '')
chain += f'rubberband=tempo={a.tempo}:pitch=1:formant=preserved:transients=mixed:window=standard:pitchq=quality'
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.src, '-af', chain, '-ar', str(SR), '-ac', '1', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32).copy()
out, cut_total = x, 0.0
if not a.no_trim:
    hop = SR // 100
    db = 20 * np.log10(np.array([np.sqrt(np.mean(x[k:k + hop] ** 2) + 1e-12) for k in range(0, len(x) - hop, hop)]))
    sil = db < np.percentile(db, 15) + 9
    runs, s = [], None
    for k, v in enumerate(sil):
        if v and s is None: s = k
        if (not v or k == len(sil) - 1) and s is not None: runs.append((s * hop, k * hop)); s = None
    segs, pos, XF = [], 0, int(0.012 * SR)
    for r0, r1 in runs:
        dur = (r1 - r0) / SR
        if r0 == 0 or r1 >= len(x) - hop: continue
        keep = a.max_pause
        for t0, kv in KEEP:
            if abs(r0 / SR * a.tempo - t0) < 1.2: keep = kv
        if dur <= keep + 0.05: continue
        half = int(keep * SR / 2)
        segs.append(x[pos:r0 + half]); pos = r1 - half; cut_total += dur - keep
    segs.append(x[pos:])
    out = segs[0]
    for sg in segs[1:]:
        fd = np.linspace(0, 1, XF, dtype=np.float32)
        out = np.concatenate([out[:-XF], out[-XF:] * (1 - fd) + sg[:XF] * fd, sg[XF:]])
tmp = a.out + '.tmp.wav'
with wave.open(tmp, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype('<i2').tobytes())
meas = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', tmp, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
I = float([l for l in meas.splitlines() if l.strip().startswith('I:')][-1].split()[1])
ff('-i', tmp, '-af', f'volume={a.lufs - I:.2f}dB,alimiter=limit=0.84:attack=4:release=60:level=disabled', '-ar', str(SR), '-ac', '1', a.out)
os.remove(tmp)
print(f'{len(x)/SR*a.tempo:.2f}s → темп {a.tempo} → {len(out)/SR:.2f}s (паузы −{cut_total:.2f}s); {I:.1f} → {a.lufs} LUFS → {a.out}')
