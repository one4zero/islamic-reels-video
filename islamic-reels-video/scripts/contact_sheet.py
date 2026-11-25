#!/usr/bin/env python3
"""Склейка кадров в лист для показа (скриншоты для согласования).
python3 contact_sheet.py <dir_with_jpeg> <out.jpg> [--cols 4] [--scale 0.6] [--safe]
--safe: нарисовать зоны интерфейса Reels (красным) и рамку безопасной зоны."""
import argparse, glob, os
from PIL import Image, ImageDraw

ap = argparse.ArgumentParser()
ap.add_argument('dir'); ap.add_argument('out')
ap.add_argument('--cols', type=int, default=4); ap.add_argument('--scale', type=float, default=0.6)
ap.add_argument('--safe', action='store_true')
a = ap.parse_args()
fs = sorted(glob.glob(os.path.join(a.dir, '*.jp*g')))
ims = []
for f in fs:
    im = Image.open(f).convert('RGB')
    if a.safe:
        k = im.width / 1080; ov = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
        d.rectangle([0, 0, im.width, 250 * k], fill=(255, 60, 60, 55)); d.rectangle([0, 1480 * k, im.width, im.height], fill=(255, 60, 60, 55))
        d.rectangle([950 * k, 1000 * k, im.width, 1480 * k], fill=(255, 60, 60, 55)); d.rectangle([100 * k, 250 * k, 950 * k, 1480 * k], outline=(255, 80, 80, 200), width=2)
        im = Image.alpha_composite(im.convert('RGBA'), ov).convert('RGB')
    ims.append(im.resize((int(im.width * a.scale), int(im.height * a.scale)), Image.LANCZOS))
w, h = ims[0].size; rows = (len(ims) + a.cols - 1) // a.cols
S = Image.new('RGB', (a.cols * w + (a.cols - 1) * 8, rows * h + (rows - 1) * 8), (255, 255, 255))
for i, im in enumerate(ims): S.paste(im, ((i % a.cols) * (w + 8), (i // a.cols) * (h + 8)))
S.save(a.out, quality=88); print(len(ims), 'кадров →', a.out)
