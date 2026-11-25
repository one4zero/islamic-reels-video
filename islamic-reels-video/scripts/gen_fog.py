"""Текстура дыма/тумана для эффекта Fog (fx.tsx): мягкий дым/туман (белый с альфой) → public/fx/fog.png.
python3 gen_fog.py <out_dir public/fx>"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter

OUT = sys.argv[1] if len(sys.argv) > 1 else 'public/fx'
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(11)
W, H = 2048, 768
acc = np.zeros((H, W))
for k, (cell, amp) in enumerate([(256, 1.0), (128, 0.55), (64, 0.3), (32, 0.15)]):
    small = rng.random((H // cell + 2, W // cell + 2))
    im = Image.fromarray((small * 255).astype(np.uint8)).resize(((W // cell + 2) * cell, (H // cell + 2) * cell), Image.BICUBIC)
    im = im.filter(ImageFilter.GaussianBlur(cell / 3))
    acc += np.array(im).astype(float)[:H, :W] / 255 * amp
acc = (acc - acc.min()) / (acc.max() - acc.min())
a = np.clip((acc - 0.35) / 0.65, 0, 1) ** 1.6
# мягкие края сверху/снизу
yy = np.linspace(0, 1, H)[:, None]
a *= np.clip(np.minimum(yy, 1 - yy) / 0.25, 0, 1)
# бесшовность по горизонтали: смешать края
blend = 256
for i in range(blend):
    t = i / blend
    a[:, i] = a[:, i] * t + a[:, W - blend + i] * (1 - t)
a = a[:, : W - blend]
rgba = np.dstack([np.full(a.shape, 255), np.full(a.shape, 255), np.full(a.shape, 255), (a * 255)]).astype(np.uint8)
Image.fromarray(rgba, 'RGBA').save(os.path.join(OUT, 'fog.png'), optimize=True)
print('fog', a.shape)
