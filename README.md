# islamic-reels-video — скилл для Claude: исламские Reels на Remotion от и до

Скилл учит Claude (Claude Code или claude.ai) делать вертикальные исламские ролики 1080×1920 для
Reels / Shorts / TikTok по озвучке и сценарию: от проверки аятов и хадисов до готового MP4.

**English:** a Claude skill for end-to-end production of Islamic short vertical videos with Remotion —
fact-checking ayat/hadith, motion design, word-synced captions, Reels safe zone, voice processing,
nasheed-only/ambient audio, AI image and cover prompts, scripts and a reusable component kit.
Docs are in Russian; the workflow works for any voiceover language.

## Что умеет
- **Проверка содержания:** аяты (сура:аят, арабский текст), хадисы (сборник и номер, формулировка), цифры.
- **Шариатские правила:** не изображать пророков, сподвижников и ангелов; люди без лиц, полный хиджаб;
  арабский текст только набором (не из ИИ-картинок).
- **Стиль и моушн-дизайн:** графические экраны, переходы, свет, дым, частицы, инфографика, метафоры.
- **Титры:** строгий капс, слово в слово по озвучке, ровные строки; цитаты аятов в стеклянных панелях.
- **Безопасная зона Reels** с автоматической проверкой каждого кадра.
- **Звук:** ускорение голоса без искажений, укорачивание пауз, громкость; фон — только нашид без
  инструментов или тихий эмбиент; тихие эффекты, синтезированные из шума.
- **Промты** для ИИ-картинок (без лиц, единый стиль серии) и для обложек, которые «залетают».
- **Набор компонентов Remotion** и скрипты: создание проекта, голос, Whisper-тайминги, картинки, кадры, проверка.

## Установка
**Claude Code** — скопируйте папку скилла в личные или проектные скиллы:
```bash
git clone <этот репозиторий>
cp -r islamic-reels-video/islamic-reels-video ~/.claude/skills/          # для всех проектов
# или: cp -r islamic-reels-video/islamic-reels-video <проект>/.claude/skills/
```
**claude.ai** — Настройки → Возможности → Skills → загрузить `dist/islamic-reels-video.skill`.

## Что нужно на компьютере
- Node.js 20+ (Remotion сам скачает браузер для рендера)
- ffmpeg с фильтром `rubberband`
- Python 3.10+: `pip install numpy pillow faster-whisper`
- curl (для скачивания шрифтов из Google Fonts)

## Как пользоваться
Пришлите Claude озвучку (mp3/wav/ogg) и текст и напишите, например:
«Сделай ролик по этой озвучке, стиль — космос и инфографика, водяной знак — мой ник».
Claude проверит хадисы, предложит стиль, выдаст промты для картинок, соберёт ролик, покажет скриншоты
и после вашего «рендер» отрендерит MP4.

Скрипты можно запускать и вручную — см. `islamic-reels-video/SKILL.md`, раздел «Процесс».

## Структура
```
islamic-reels-video/
  SKILL.md                 процесс от и до, главные правила
  references/              стиль, титры и зона, религиозные правила, звук, промты, обложки, компоненты, сдача
  scripts/                 new_project, get_fonts, prep_voice, transcribe, align, mix_bed, gen_sfx,
                           prep_art, gen_fog, stills, contact_sheet, probe + check_safe
  assets/remotion-kit/     шаблон проекта Remotion с компонентами
  assets/examples/         пример полной сцены (космос + инфографика)
dist/islamic-reels-video.skill   упакованный скилл для claude.ai
```

## Лицензии и ответственность
- Код и тексты скилла — MIT (см. LICENSE).
- Шрифты Montserrat, Lora, Amiri — SIL Open Font License, скачиваются из Google Fonts при создании проекта.
- Remotion — собственная лицензия (бесплатно для частных лиц и небольших команд; для компаний может
  понадобиться платная) — см. https://remotion.dev/license.
- Скилл помогает проверять источники, но ответственность за религиозное содержание — на авторе ролика:
  при сомнениях сверяйтесь со знающими людьми.
