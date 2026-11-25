#!/usr/bin/env python3
"""Выравнивает ИСХОДНЫЙ текст сценария по словам Whisper → src/words.json для Remotion.
python3 align.py <whisper_words.json> <script.txt> <out src/words.json>
script.txt: один абзац на строку (номер строки = para в W(para, "слово")).
Метки ElevenLabs вида [calm], [whispers] вырезаются автоматически.
Цифры в озвучке («117») и в тексте («ста семнадцати») сопоставляются заменой REPL — это нормально.
Проверьте вывод REPL/FILL: если много FILL подряд — текст и озвучка расходятся."""
import json, re, difflib, sys

wf, sf, of = sys.argv[1:4]
W = [w for w in json.load(open(wf)) if re.sub(r'[^\wё]', '', w['text'].lower())]
lines = [re.sub(r'\[[^\]]*\]', '', l).strip() for l in open(sf, encoding='utf-8').read().strip().split('\n')]
lines = [l for l in lines if l]
n = lambda s: re.sub(r'[^\wё]', '', s.lower()).replace('ё', 'е')
toks, para = [], []
for pi, l in enumerate(lines):
    for t in l.split():
        if n(t):
            toks.append(t); para.append(pi)
a = [n(t) for t in toks]; b = [n(w['text']) for w in W]
sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
out = [None] * len(toks)
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == 'equal':
        for k in range(i2 - i1): out[i1 + k] = (W[j1 + k]['start'], W[j1 + k]['end'])
    elif tag == 'replace' and j2 > j1:
        st, en = W[j1]['start'], W[j2 - 1]['end']; L = i2 - i1
        for k in range(L): out[i1 + k] = (st + (en - st) * k / L, st + (en - st) * (k + 1) / L)
        print('REPL', toks[i1:i2], '<-', [W[j]['text'] for j in range(j1, j2)])
    elif tag != 'equal':
        print(tag, toks[i1:i2], [W[j]['text'] for j in range(j1, j2)])
for i, o in enumerate(out):
    if o is None:
        p = next((out[k][1] for k in range(i - 1, -1, -1) if out[k]), 0.0)
        q = next((out[k][0] for k in range(i + 1, len(out)) if out[k]), p + 0.3)
        out[i] = (p, max(p + 0.05, q)); print('FILL', toks[i], out[i])
res = [{"text": t, "startMs": round(o[0] * 1000), "endMs": round(o[1] * 1000), "para": p} for t, o, p in zip(toks, out, para)]
json.dump(res, open(of, 'w'), ensure_ascii=False, indent=0)
print(len(res), 'слов; последний:', res[-1])
