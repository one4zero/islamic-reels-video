import words from "./words.json";

export type Word = {
  text: string;
  startMs: number;
  endMs: number;
  para: number;
};

/** Слова сценария, выровненные по голосу (scripts/transcribe.py + scripts/align.py → src/words.json). */
export const WORDS = words as Word[];
export const FPS = 30;
export const f = (ms: number) => Math.round((ms / 1000) * FPS);
/** Секунды → кадр. */
export const s = (sec: number) => Math.round(sec * FPS);

export const norm = (t: string) =>
  t
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]/g, "");

/** Кадр начала слова `text` (по префиксу) в абзаце `para`. */
export const W = (para: number, text: string, nth = 0): number => {
  const t = norm(text);
  const list = WORDS.filter((w) => w.para === para && norm(w.text).startsWith(t));
  if (!list[nth]) {
    throw new Error(`Word not found: ${para} ${text} #${nth}`);
  }
  return f(list[nth].startMs);
};

/** Как W, но слово должно совпасть целиком (для коротких слов вроде «с», «и»). */
export const WE = (para: number, text: string, nth = 0): number => {
  const t = norm(text);
  const list = WORDS.filter((w) => w.para === para && norm(w.text) === t);
  if (!list[nth]) {
    throw new Error(`Word not found: ${para} ${text} #${nth}`);
  }
  return f(list[nth].startMs);
};

/**
 * Тайминги для слов титра: идём по озвучке от кадра `from` и сопоставляем слова.
 * Цифры («117», «7%») и знаки («ﷺ», «—») не совпадают с текстом озвучки:
 * цифра «съедает» следующее слово озвучки, знак берёт время предыдущего слова.
 */
export const wordTimes = (tokens: string[], from: number): number[] => {
  // пока нет words.json (до выравнивания) — слова появляются равномерно
  if (!WORDS.length) return tokens.map((_, i) => from + i * 6);
  let cur = WORDS.findIndex((w) => f(w.startMs) >= from - 4);
  if (cur < 0) cur = WORDS.length - 1;
  const out: number[] = [];
  for (const tk of tokens) {
    const nt = norm(tk);
    if (!nt) {
      out.push(out.length ? out[out.length - 1] : f(WORDS[cur].startMs));
      continue;
    }
    let found = -1;
    for (let j = cur; j < Math.min(WORDS.length, cur + 7); j++) {
      const nw = norm(WORDS[j].text);
      if (nw === nt || (nt.length >= 5 && nw.startsWith(nt.slice(0, 5)))) {
        found = j;
        break;
      }
    }
    if (found < 0) found = Math.min(cur, WORDS.length - 1);
    out.push(f(WORDS[found].startMs));
    cur = found + 1;
  }
  return out;
};

/** Длительность ролика: голос + ~1,2 с хвоста. Поставьте по длине озвучки. */
export const TOTAL = s(30);
