# Набор компонентов (assets/remotion-kit)

Remotion 4.0.545, 1080×1920, 30 к/с. `scripts/new_project.sh <repo> rolikN` копирует набор в новую папку.

## Файлы
| Файл | Что внутри |
|---|---|
| `src/timing.ts` | `WORDS` (src/words.json), `f(ms)`, `s(sec)`, `W(абзац, "слово", n)`, `WE(...)`, `wordTimes`, `TOTAL` |
| `src/ui.tsx` | шрифты (локально!), палитра `C`, `SAFE`, `camAt`/`Shot` (картинка с камерой), `Scrim`, `Dust`, `Twinkle`, `Grain`, `Watermark` + `WATERMARK`, `SafeProbe` |
| `src/type.tsx` | `Cap` (титр по словам), `Kicker`, `Quote` (стеклянная панель аята/хадиса) |
| `src/fx.tsx` | свет, дым, переходы, орнамент, каллиграфия, CineBg, Warp, PeopleGalaxy и др. (см. visual-style.md) |
| `src/info.tsx` | табло цифр, PeopleGrid, NameTicker, Reticle, Markers, Orbs, Embers, `toScreen` |
| `src/gfx.tsx` | EmBg, GoldFall, Lantern, BookIcon, Icon, ScoreRing, Route, Badges, NamePlate, Statement, LetterSwarm |
| `src/garden.tsx` | сад-метафора: Sky, Soil, Seed, Stone, Roots, Sprout, Tree, Rain, Petals, Warmth, Breeze, `plantState` |
| `src/Scenes.tsx` | ШАБЛОН монтажа (T, shots, Overlays) |
| `src/Reel.tsx`, `Root.tsx`, `Sfx.tsx` | корень (`data-reel-root`), композиция `Reel`, звук |
| `public/fonts` | Montserrat (variable), Lora (обычный и italic), Amiri (арабский) |
| `public/fx/fog.png` | текстура дыма (`scripts/gen_fog.py`) |

## Тайминги
- `W(para, "слово", nth)` — кадр начала слова, найденного **по префиксу** в абзаце `para` (строка script.txt).
  Короткие слова («с», «и», «а», «в», «Б») совпадают с началом других слов («сказал», «Альхамдулиллях»,
  «баллов») → для них **всегда `WE`** (точное совпадение) и проверяй nth.
- `wordTimes` (внутри Cap/Quote): идёт по озвучке от кадра `at`; цифра «съедает» следующее слово озвучки;
  знак (ﷺ, —) берёт время предыдущего слова. Значит `at` титра должен быть ≈ началом его первого слова.
- Длительность: `TOTAL = s(длина голоса + ~1.2)`.

## Сцены
```tsx
const shots: ShotDef[] = [
  { key: "earth", from: 0, fin: 0, trans: "cut", bg: <Shot fr={fr} from={0} to={TOTAL} src="art/earth.jpg" cam={CAM.earth} fin={0}>{/* графика в координатах картинки */}</Shot> },
  { key: "galaxy", from: T.galaxy, trans: "zoom", bg: <CineBg fr={fr} at={T.galaxy} /> },
];
```
- Сцена видна от `from` до `next.from + next.fin` (перекрытие на время перехода).
- Камера `CamKey = [кадр, зум, центрX, центрY]` в координатах картинки 1080×1920; `camAt` сам не даёт
  выйти за край. Для своих миров (сад) — `gcam` без ограничений.
- Экраны без фото: `CineBg` (космос), `EmBg` (бренд), сад `Garden`, заставки на `Ornament`.

## Текст
```tsx
<Cap fr={fr} at={W(3, "Сейчас")} until={W(3, "Кажется") - 2} y={540} text="Сейчас нас больше | *8 миллиардов*" size={54} />
<Quote fr={fr} at={W(6, "Он") - 4} until={T.next + 4} y={300} label="СУРА МАРЬЯМ · 19:94"
  arabic="لَقَدْ أَحْصَاهُمْ وَعَدَّهُمْ عَدًّا" text="«Он знает их число | и *пересчитал* их»" textAt={W(6, "Он")} />
<Calligraphy fr={fr} at={T.prophet + 6} until={T.after + 6} y={770} text="قَالَ النَّبِيُّ ﷺ" />
```
`until` — когда блок уходит (заканчивает гаснуть). Следующий титр — с `at` ≥ `until` предыдущего.

## Палитра и водяной знак
- `C` в ui.tsx — поменяй под бренд (пример изумрудной палитры — в комментарии).
- `WATERMARK.text` — ник автора для своей страницы; `""` (по умолчанию) — без знака. `WATERMARK.shots` — 5 появлений по
  2 с (время, место, дрейф) — подбери по стиллам: в безопасной зоне и там, где нет текста.

## Проверка зоны
`<Reel probe>` выводит `SafeProbe`: замер реальных рамок текста. Скрипты `probe.mjs` + `check_safe.py`.
Новым текстовым блокам ставь `data-safe="имя"`; блокам со словами — `data-lines={число строк}` и
`data-w` на словах (в Cap/Quote уже есть).

## Производительность
- Рендер 2 минут ≈ 5–8 мин на 4 ядрах (`--concurrency=4`). Тяжёлое: blur на сотнях элементов —
  группируй и размывай группу одним SVG-фильтром; backdrop-filter — только на панелях.
- Картинки — через `<Img>` (Remotion ждёт загрузку); SVG `<image>` Remotion не ждёт.
