#!/usr/bin/env python3
"""EN: Background nasheed WITHOUT instruments: crossfaded loop, low level, ducking under the voice (≈15 dB below).
RU: Фон-нашид (БЕЗ музыкальных инструментов): зацикливание с перекрёстной склейкой, тихий уровень,
автоприглушение под голос (sidechain). Итог ≈ на 15 дБ тише голоса.
python3 mix_bed.py <nasheed> <voice.wav> <out bed.mp3> --duration 122 [--base-db -13] [--xfade 4]"""
import argparse, subprocess

ap = argparse.ArgumentParser()
ap.add_argument('nasheed'); ap.add_argument('voice'); ap.add_argument('out')
ap.add_argument('--duration', type=float, required=True)
ap.add_argument('--base-db', type=float, default=-13)
ap.add_argument('--xfade', type=float, default=4)
a = ap.parse_args()
fc = (f'[0:a][1:a]acrossfade=d={a.xfade}:c1=qsin:c2=qsin,aresample=48000,volume={a.base_db}dB[bed];'
      '[2:a]aresample=48000[sc];'
      '[bed][sc]sidechaincompress=threshold=0.04:ratio=1.8:attack=90:release=800:knee=4:makeup=1[d];'
      f'[d]atrim=0:{a.duration},afade=t=in:st=0:d=1.2,afade=t=out:st={a.duration - 3}:d=3[out]')
subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', a.nasheed, '-i', a.nasheed, '-i', a.voice,
                '-filter_complex', fc, '-map', '[out]', '-ar', '48000', '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '320k', a.out], check=True)
m = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', a.out, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
print([l.strip() for l in m.splitlines() if l.strip().startswith('I:')][-1], '→', a.out)
