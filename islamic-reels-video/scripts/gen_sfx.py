#!/usr/bin/env python3
"""EN: Synthesizes quiet, instrument-free sound effects (noise-based) and an optional wind ambience.
RU: Синтез тихих звуков без музыкальных инструментов (шумы, удары, шорохи) и эмбиента.
python3 gen_sfx.py <out_dir public/sfx> [--ambient <public/audio/amb_wind.mp3> --duration 155]
Создаёт: whoosh, riser, thud, tick, pop, lock, boom, roll, crack, leaf, sparkle(shimmer), birds, rain, fire.
Громкости в ролике держите 0.02–0.12 (эффекты почти неслышные), фон — на 15–18 дБ тише голоса."""
import argparse, os, subprocess, wave
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('out')
ap.add_argument('--ambient'); ap.add_argument('--duration', type=float, default=155)
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)
SR = 48000
rng = np.random.default_rng(7)

def save(name, L, R=None, peak=0.6):
    R = L if R is None else R
    st = np.stack([L, R], 1); st = st / (np.abs(st).max() + 1e-9) * peak
    with wave.open(os.path.join(a.out, name), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype('<i2').tobytes())
def t(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR))
def lp(x, fc):
    al = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - al) * v + al * s; y[i] = s
    return y
def hp(x, fc): return x - lp(x, fc)
def svf(x, fc, q=0.7, mode='bp'):
    fc = np.broadcast_to(np.asarray(fc, float), x.shape); l = b = 0.0; y = np.empty_like(x); dmp = 1 / q
    for i in range(len(x)):
        f = 2 * np.sin(np.pi * min(fc[i], SR / 6) / SR); h = x[i] - l - dmp * b; b += f * h; l += f * b
        y[i] = b if mode == 'bp' else l if mode == 'lp' else h
    return y
def fade(x, i=0.005, o=0.03):
    e = np.ones(len(x)); ni, no = int(i * SR), int(o * SR)
    if ni: e[:ni] = np.linspace(0, 1, ni)
    if no: e[-no:] = np.linspace(1, 0, no)
    return x * e

# whoosh — полосовой шум с проходом частоты и панорамой
d = 0.7; tt = t(d); ph = tt / d
x = svf(svf(noise(d), 250 + 1400 * np.sin(np.pi * ph) ** 2, 0.9), 2500, 0.7, 'lp') * np.sin(np.pi * ph) ** 1.5
save('whoosh.wav', x * np.cos(ph * np.pi / 2), x * np.sin(ph * np.pi / 2))
# riser — нарастание
d = 2.2; tt = t(d); ph = tt / d
save('riser.wav', fade(svf(svf(noise(d), 200 + 2400 * ph ** 2, 1.0), 3000, 0.7, 'lp') * ph ** 2.5, 0.05, 0.06), peak=0.5)
# thud — мягкий глухой толчок
d = 0.8; tt = t(d)
save('thud.wav', fade(svf(noise(d), 60 + 180 * np.exp(-tt * 18), 3, 'lp') * np.exp(-tt * 6), 0.002, 0.1), peak=0.5)
# tick — короткий щелчок табло; pop — мягкий «блип» на ключевом слове
d = 0.12; tt = t(d)
save('tick.wav', fade(hp(noise(d), 2500) * np.exp(-tt * 400) + np.sin(2 * np.pi * 2300 * tt) * np.exp(-tt * 120) * 0.4, 0.0005, 0.03), peak=0.45)
save('pop.wav', svf(noise(d), 1800 + 1500 * np.exp(-tt * 40), 4) * np.exp(-tt * 55), peak=0.45)
# lock — щелчок + низкий толчок (прицел, фиксация)
d = 0.35; tt = t(d)
save('lock.wav', fade(np.sin(2 * np.pi * (110 - 40 * tt) * tt) * np.exp(-tt * 18) * 0.8 + hp(noise(d), 3000) * np.exp(-tt * 300) * 0.3, 0.0005, 0.05), peak=0.5)
# boom — глубокий мягкий удар-свелл (шум + низ, без тона инструмента)
d = 2.4; tt = t(d); en = (1 - np.exp(-tt * 40)) * np.exp(-tt * 1.6)
save('boom.wav', fade(np.sin(2 * np.pi * np.cumsum(48 - 12 * tt / d) / SR) * en + lp(noise(d), 160) * en * 1.5, 0.01, 0.4), peak=0.65)
# roll — счётчик крутится
d = 1.3; n = int(d * SR); x = np.zeros(n); p = 0.0
while p < d - 0.1:
    i = int(p * SR); L = int(0.02 * SR); x[i:i + L] += hp(rng.standard_normal(L), 1500) * np.exp(-np.arange(L) / SR * 200)
    p += 0.018 + 0.09 * (abs(p / d - 0.5) * 2) ** 2
save('roll.wav', fade(x), peak=0.35)
# crack — сухой хруст (камень, ветка)
d = 0.5; tt = t(d); x = np.zeros(len(tt))
for _ in range(14):
    i = int(rng.uniform(0, 0.25) * SR); L = int(rng.uniform(0.003, 0.012) * SR); x[i:i + L] += hp(rng.standard_normal(L), 1200) * rng.uniform(0.3, 1)
save('crack.wav', fade(x + lp(noise(d), 500) * np.exp(-tt * 25) * 0.6, 0.001, 0.08), peak=0.45)
# leaf — шорох (листок, ткань)
d = 0.35; tt = t(d)
save('leaf.wav', fade(hp(lp(noise(d), 5000), 1500) * np.sin(np.pi * tt / d) ** 2), peak=0.35)
# sparkle/shimmer — воздушные высокие «искры» без тонов
d = 1.0; tt = t(d); x = np.zeros(len(tt))
for _ in range(14):
    i = int(rng.uniform(0, 0.6) * SR); L = int(0.08 * SR); x[i:i + L] += rng.standard_normal(L) * np.exp(-np.arange(L) / SR * 50) * rng.uniform(0.4, 1)
x = svf(svf(x, 5000, 1.2), 7000, 0.7, 'lp') * np.exp(-tt * 3)
save('sparkle.wav', x); save('shimmer.wav', x)
# birds — редкие короткие трели (для весенних сцен; не музыка)
D = 16.0; n = int(D * SR); BL = np.zeros(n); BR = np.zeros(n); p = 0.4
while p < D - 1:
    k = rng.integers(2, 5); pan = rng.uniform(0.15, 0.85); f0 = rng.uniform(3000, 4200)
    for j in range(k):
        du = rng.uniform(0.05, 0.11); tc = t(du); f = f0 + rng.uniform(800, 1800) * np.sin(np.pi * tc / du)
        sg = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tc / du) ** 2; i0 = int((p + j * rng.uniform(0.09, 0.16)) * SR)
        BL[i0:i0 + len(sg)] += sg * (1 - pan); BR[i0:i0 + len(sg)] += sg * pan
    p += rng.uniform(1.2, 2.8)
for dl, g in [(0.045, 0.35), (0.09, 0.2), (0.15, 0.1)]:
    sh = int(dl * SR); BL[sh:] += BL[:-sh] * g; BR[sh:] += BR[:-sh] * g
save('birds.wav', fade(BL, 0.3, 0.5), fade(BR, 0.3, 0.5), peak=0.3)
# rain — шелест дождя с каплями
d = 10.0; tt = t(d); body = hp(lp(noise(d), 6000), 400) * 0.5; dr = np.zeros(len(tt))
for _ in range(900):
    i = int(rng.uniform(0, d - 0.02) * SR); L = int(0.006 * SR); dr[i:i + L] += hp(rng.standard_normal(L), 2500) * rng.uniform(0.2, 1)
save('rain.wav', fade(body + dr * 0.5, 0.8, 1.2), fade(np.roll(body, 900) + np.roll(dr, 500) * 0.5, 0.8, 1.2), peak=0.4)
# fire — далёкий гул с потрескиванием
d = 6.0; tt = t(d); rum = lp(lp(noise(d), 220), 220); cr = np.zeros(len(tt))
for _ in range(90):
    i = int(rng.uniform(0, d - 0.02) * SR); L = int(rng.uniform(0.002, 0.008) * SR); cr[i:i + L] += hp(rng.standard_normal(L), 1500) * rng.uniform(0.2, 1)
save('fire.wav', fade(rum * 3 + cr * 0.6, 0.3, 0.6), fade(np.roll(rum, 900) * 3 + np.roll(cr, 300) * 0.6, 0.3, 0.6), peak=0.6)
print('sfx →', a.out)

if a.ambient:
    # эмбиент: мягкий ветер с порывами (без шипения), нормализован к −34 LUFS
    D = a.duration; n = int(D * SR); tt = np.arange(n) / SR
    w1 = lp(lp(rng.standard_normal(n), 380), 380); w2 = lp(lp(rng.standard_normal(n), 900), 900) * 0.25
    gust = 0.6 + 0.4 * (0.5 + 0.5 * np.sin(2 * np.pi * tt / 11) * np.sin(2 * np.pi * tt / 27 + 1.3))
    env = np.minimum(1, np.minimum(tt / 2, (D - tt) / 3))
    tmp = a.ambient + '.tmp.wav'
    st = np.stack([(w1 + w2) * gust * env, (np.roll(w1, 2400) + np.roll(w2, 1700)) * gust * env], 1); st = st / np.abs(st).max() * 0.5
    with wave.open(tmp, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', tmp, '-af', 'loudnorm=I=-34:TP=-6:LRA=7', '-ar', '48000', '-c:a', 'libmp3lame', '-b:a', '160k', a.ambient], check=True)
    os.remove(tmp); print('ambient →', a.ambient)
