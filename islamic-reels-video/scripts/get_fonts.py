#!/usr/bin/env python3
"""EN: Downloads the kit fonts (Montserrat, Lora, Amiri — SIL OFL) from Google Fonts into public/fonts.
RU: Скачивает шрифты набора из Google Fonts в public/fonts (все — SIL Open Font License):
Montserrat (variable 100–900), Lora (400–700 и italic 600), Amiri Bold (арабский).
python3 get_fonts.py <project>/public/fonts
Нужен curl (работает через системный прокси)."""
import os, re, subprocess, sys

out = sys.argv[1] if len(sys.argv) > 1 else 'public/fonts'
os.makedirs(out, exist_ok=True)
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
JOBS = [
    ('Montserrat:wght@100..900', {'cyrillic': 'montserrat-cyrillic.woff2', 'latin': 'montserrat-latin.woff2'}),
    ('Lora:wght@400..700', {'cyrillic': 'lora-cyrillic.woff2', 'latin': 'lora-latin.woff2'}),
    ('Lora:ital,wght@1,600', {'cyrillic': 'lora-italic-cyrillic.woff2', 'latin': 'lora-italic-latin.woff2'}),
    ('Amiri:wght@700', {'arabic': 'amiri-bold-arabic.woff2'}),
]
for fam, want in JOBS:
    css = subprocess.run(['curl', '-sfL', '-A', UA, f'https://fonts.googleapis.com/css2?family={fam}&display=swap'], capture_output=True, text=True, check=True).stdout
    for subset, url in re.findall(r'/\* ([\w-]+) \*/\s*@font-face \{[^}]*?src: url\((https://[^)]+\.woff2)\)', css):
        if subset in want:
            dst = os.path.join(out, want[subset])
            subprocess.run(['curl', '-sfL', '-o', dst, url], check=True)
            print(f'{fam:28} {subset:9} → {dst} ({os.path.getsize(dst)} B)')
