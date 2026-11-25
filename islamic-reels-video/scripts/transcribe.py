#!/usr/bin/env python3
"""Распознаёт озвучку с таймингами слов (faster-whisper).
python3 transcribe.py <audio(mp3/wav/ogg)> <out_words.json> [--model medium] [--lang ru]
Печатает сегменты [начало-конец] текст — по ним видно сцены и паузы.
Зависимости: pip install faster-whisper; ffmpeg в PATH."""
import argparse, json, subprocess
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('audio'); ap.add_argument('out')
ap.add_argument('--model', default='medium'); ap.add_argument('--lang', default='ru')
a = ap.parse_args()

# декодируем сами (обходит баги av.open в некоторых версиях)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.audio, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
pcm = np.frombuffer(raw, dtype=np.float32)
from faster_whisper import WhisperModel
m = WhisperModel(a.model, device='cpu', compute_type='int8')
segs, _ = m.transcribe(pcm, language=a.lang, word_timestamps=True, vad_filter=False)
out = []
for sg in segs:
    print(f"[{sg.start:6.2f}-{sg.end:6.2f}] {sg.text}", flush=True)
    for w in sg.words:
        out.append({"text": w.word, "start": round(w.start, 3), "end": round(w.end, 3), "p": round(w.probability, 3)})
json.dump(out, open(a.out, 'w'), ensure_ascii=False, indent=1)
print('words:', len(out), '→', a.out)
