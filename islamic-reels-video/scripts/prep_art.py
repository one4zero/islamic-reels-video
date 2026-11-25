#!/usr/bin/env python3
"""EN: Image prep: 9:16 upscale (bg), alpha crop (cutout), edge cleanup (defringe), black-background logo → alpha (fromblack), round medallion.
RU: Подготовка картинок для Remotion.
  bg      <src> <out.jpg>            — апскейл Lanczos до 1440×2560 (9:16) + лёгкая резкость (фон с наездами камеры не мылит)
  cutout  <src.png> <out.png>        — вырезка с прозрачностью: обрезка по альфе
  defringe <src.png> <out.png>       — вырезка + чистка цветной каймы по контуру (красной/жёлтой/белой) и сглаживание края
  fromblack <src.jpg> <out.png>      — объект на чёрном фоне → прозрачность по яркости (логотипы, свечения)
  medallion <src.jpg> <out.png>      — круглый медальон (зелёный/цветной круг) из логотипа на чёрном фоне
python3 prep_art.py <mode> <src> <out>"""
import sys
import numpy as np
from PIL import Image, ImageFilter

mode, src, out = sys.argv[1:4]

def shift_max(m, r):
    o = m.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1): o |= np.roll(np.roll(m, dy, 0), dx, 1)
    return o

if mode == 'bg':
    im = Image.open(src).convert('RGB'); W, H = 1440, 2560
    sc = max(W / im.width, H / im.height); im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
    l, t = (im.width - W) // 2, (im.height - H) // 2
    im.crop((l, t, l + W, t + H)).filter(ImageFilter.UnsharpMask(radius=1.6, percent=50, threshold=2)).save(out, quality=90, optimize=True)
elif mode == 'cutout':
    im = Image.open(src).convert('RGBA'); im.crop(im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()).save(out, optimize=True)
elif mode == 'defringe':
    a = np.array(Image.open(src).convert('RGBA')).astype(np.float64); rgb, al = a[..., :3], a[..., 3]
    al = np.clip((al - 12) * 255 / 228, 0, 255); tr = al < 8; band = shift_max(tr, 4) & ~tr
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    bad = band & (((r > 170) & (g < 110) & (b < 110)) | ((r > 180) & (g > 170) & (b < 110)) | ((r > 245) & (g > 245) & (b > 245)))
    al[bad] = 0; tr = al < 8; al[shift_max(tr, 1) & ~tr] *= 0.55
    al = np.array(Image.fromarray(al.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))).astype(np.float64)
    o = Image.fromarray(np.dstack([rgb, al]).astype(np.uint8), 'RGBA'); o.crop(o.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()).save(out, optimize=True)
elif mode == 'fromblack':
    a = np.array(Image.open(src).convert('RGB')).astype(np.float64)
    al = np.clip((a.max(axis=2) - 10) / 34, 0, 1)
    al = np.array(Image.fromarray((al * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))).astype(np.float64) / 255
    rgb = np.clip(a / np.maximum(al[..., None], 0.08), 0, 255)
    o = Image.fromarray(np.dstack([rgb, al * 255]).astype(np.uint8), 'RGBA'); o.crop(o.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox()).save(out, optimize=True)
elif mode == 'medallion':
    a = np.array(Image.open(src).convert('RGB')).astype(np.float64)
    g = (a.max(axis=2) > 60) & ((a[..., 1] > a[..., 0] + 45) | (a[..., 2] > a[..., 0] + 45))
    ys, xs = np.where(g); x0, x1 = np.percentile(xs, [0.2, 99.8]); y0, y1 = np.percentile(ys, [0.2, 99.8])
    cx, cy, R = (x0 + x1) / 2, (y0 + y1) / 2, ((x1 - x0) + (y1 - y0)) / 4 + 30
    yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]]; m = np.clip(R - np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) + 0.5, 0, 1)
    Image.fromarray(np.dstack([a, m * 255]).astype(np.uint8), 'RGBA').crop((int(cx - R - 2), int(cy - R - 2), int(cx + R + 3), int(cy + R + 3))).save(out, optimize=True)
else:
    sys.exit('mode: bg | cutout | defringe | fromblack | medallion')
print(mode, '→', out, Image.open(out).size)
