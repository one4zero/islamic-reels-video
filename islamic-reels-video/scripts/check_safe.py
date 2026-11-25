#!/usr/bin/env python3
"""EN: Parses the probe.mjs log: text outside the Reels safe zone, extra line wraps, overlapping text.
RU: Разбор лога probe.mjs: текст вне безопасной зоны Reels, лишние переносы строк, наложения надписей.
python3 check_safe.py <log.txt> [--top 250] [--bottom 1480] [--left 100] [--right 950]
Зона по умолчанию для 1080×1920: сверху шапка Reels (250), снизу ник/подпись/аудио (последние 440 px),
справа колонка кнопок (130 px). Наложения, которые длятся 1 кадр, — это просто смена титров (норма)."""
import argparse, collections, json

ap = argparse.ArgumentParser()
ap.add_argument('log')
ap.add_argument('--top', type=int, default=250); ap.add_argument('--bottom', type=int, default=1480)
ap.add_argument('--left', type=int, default=100); ap.add_argument('--right', type=int, default=950)
a = ap.parse_args()
viol = collections.defaultdict(list); wraps = collections.defaultdict(list); ovl = collections.defaultdict(list)
for line in open(a.log):
    if not line.startswith('SAFE '): continue
    _, fr, js = line.split(' ', 2); fr = int(fr)
    vis = [e for e in json.loads(js) if e['o'] > 0.05 and e['x1'] > e['x0']]
    for e in vis:
        bad = [f"{k} {v}" for k, v, cond in [('left', e['x0'], e['x0'] < a.left), ('right', e['x1'], e['x1'] > a.right), ('top', e['y0'], e['y0'] < a.top), ('bottom', e['y1'], e['y1'] > a.bottom)] if cond]
        if bad: viol[e['id']].append((fr, bad))
        if e['exp'] and e['lines'] > e['exp']: wraps[e['id']].append((fr, e['lines'], e['exp']))
    for i in range(len(vis)):
        for j in range(i + 1, len(vis)):
            p, q = vis[i], vis[j]
            if p['o'] < 0.5 or q['o'] < 0.5: continue
            if min(p['x1'], q['x1']) - max(p['x0'], q['x0']) > 2 and min(p['y1'], q['y1']) - max(p['y0'], q['y0']) > 2: ovl[(p['id'], q['id'])].append(fr)
print('== ВНЕ БЕЗОПАСНОЙ ЗОНЫ' + (' — нет' if not viol else ''))
for k, v in viol.items(): print(f'  {k!r}: кадры {v[0][0]}..{v[-1][0]} ({len(v)}) {v[-1][1]}')
print('== ЛИШНИЕ ПЕРЕНОСЫ' + (' — нет' if not wraps else ''))
for k, v in wraps.items(): print(f'  {k!r}: кадр {v[0][0]}, строк {v[0][1]} вместо {v[0][2]} — разбейте строки короче или уменьшите size')
real = {k: v for k, v in ovl.items() if len(v) > 1}
print('== НАЛОЖЕНИЯ' + (' — нет' if not real else ''))
for k, v in real.items(): print(f'  {k}: кадры {v[0]}..{v[-1]} ({len(v)})')
