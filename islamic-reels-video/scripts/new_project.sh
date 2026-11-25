#!/usr/bin/env bash
# EN: new video from the component kit (copies assets/remotion-kit, installs deps, downloads fonts).
# Новый ролик из набора компонентов: bash new_project.sh <repo_dir> <rolikN>
# Копирует assets/remotion-kit, ставит зависимости (или берёт node_modules соседнего ролика жёсткими ссылками).
set -euo pipefail
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(cd "$1" && pwd)"; NAME="$2"; DEST="$REPO/$NAME"
[ -e "$DEST" ] && { echo "уже существует: $DEST"; exit 1; }
cp -r "$SKILL/assets/remotion-kit" "$DEST"
mkdir -p "$DEST"/public/{audio,art,sfx} "$DEST"/out "$DEST"/audio_src "$DEST"/scripts
sed -i "s/\"name\": \"reel\"/\"name\": \"$NAME\"/" "$DEST/package.json"
ls "$DEST"/public/fonts/*.woff2 >/dev/null 2>&1 || python3 "$SKILL/scripts/get_fonts.py" "$DEST/public/fonts"
SIB="$(ls -d "$REPO"/*/node_modules 2>/dev/null | head -1 || true)"
if [ -n "$SIB" ]; then cp -al "$SIB" "$DEST/node_modules"; else (cd "$DEST" && npm install); fi
echo "готово: $DEST  (npx remotion studio — предпросмотр)"
