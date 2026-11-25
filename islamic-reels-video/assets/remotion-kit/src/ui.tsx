import React, { useEffect } from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";
import { FPS } from "./timing";

/** Шрифты лежат локально в public/fonts (Montserrat variable, Lora Italic, Amiri — Google Fonts, OFL). */
const CYR = "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116";
const LAT =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const AR =
  "U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC";
const font = (family: string, file: string, unicodeRange: string, style: "normal" | "italic" = "normal", weight = "100 900") =>
  loadFont({ family, url: staticFile(`fonts/${file}`), unicodeRange, style, weight });
font("Montserrat", "montserrat-cyrillic.woff2", CYR);
font("Montserrat", "montserrat-latin.woff2", LAT);
font("Lora", "lora-cyrillic.woff2", CYR, "normal", "400 700");
font("Lora", "lora-latin.woff2", LAT, "normal", "400 700");
font("Lora", "lora-italic-cyrillic.woff2", CYR, "italic", "600");
font("Lora", "lora-italic-latin.woff2", LAT, "italic", "600");
font("Amiri", "amiri-bold-arabic.woff2", AR, "normal", "700");

export const SANS = "Montserrat, Amiri";
export const SERIF = "Lora";
export const ARABIC = "Amiri";

/**
 * Палитра. По умолчанию — «тёмный космос + золото».
 * Для бренда подставьте фирменные цвета, например изумрудно-золотой стиль:
 *   ink "#03100b", white "#f7f0e2", mute "#b8c9bd", gold "#e8c47c", line "rgba(232,196,124,0.75)"
 */
export const C = {
  ink: "#05070d",
  white: "#f3efe7",
  mute: "#aeb8c8",
  gold: "#e6c27a",
  goldDeep: "#c99a4a",
  ember: "#ff8a4c",
  rose: "#eaa3b3",
  emerald: "#0b3b2c",
  line: "rgba(230,194,122,0.75)",
};

/**
 * Безопасная зона Reels (1080×1920): сверху шапка, снизу ник/подпись/аудио, справа колонка кнопок.
 * Весь текст держим внутри неё.
 */
export const SAFE = { top: 250, bottom: 1480, left: 100, right: 950 };
/** Ширина текстового блока по центру кадра: 540 ± 410 → 130…950. */
export const SAFE_W = 820;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.45, 0, 0.55, 1);
export const prog = (fr: number, a: number, b: number, easing = easeOut) => interpolate(fr, [a, b], [0, 1], { ...clamp, easing });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ------------------------------ Камера и кадры ------------------------------ */

/** Ключ камеры: [кадр, зум, центр X, центр Y] в координатах кадра 1080×1920. */
export type CamKey = [number, number, number, number];

export const camAt = (fr: number, keys: CamKey[]) => {
  let k0 = keys[0];
  let k1 = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (fr >= keys[i][0] && fr <= keys[i + 1][0]) {
      k0 = keys[i];
      k1 = keys[i + 1];
      break;
    }
  }
  const t = k1[0] === k0[0] ? 1 : interpolate(fr, [k0[0], k1[0]], [0, 1], { ...clamp, easing: easeInOut });
  const z = Math.max(1, lerp(k0[1], k1[1], t));
  // фон всегда закрывает кадр целиком
  const cx = Math.min(1080 - 540 / z, Math.max(540 / z, lerp(k0[2], k1[2], t)));
  const cy = Math.min(1920 - 960 / z, Math.max(960 / z, lerp(k0[3], k1[3], t)));
  return { z, cx, cy };
};

/** Кадр-фон с камерой; дети рисуются в координатах картинки и двигаются вместе с ней. */
export const Shot: React.FC<{
  fr: number;
  from: number;
  to: number;
  src: string;
  cam: CamKey[];
  fin?: number;
  fout?: number;
  filter?: string;
  children?: React.ReactNode;
}> = ({ fr, from, to, src, cam, fin = 12, fout = 0, filter, children }) => {
  if (fr < from || fr >= to) return null;
  const o = Math.min(fin ? interpolate(fr, [from, from + fin], [0, 1], clamp) : 1, fout ? interpolate(fr, [to - fout, to], [1, 0], clamp) : 1);
  const { z, cx, cy } = camAt(fr, cam);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: `translate(${540 - cx * z}px, ${960 - cy * z}px) scale(${z})` }}>
        <Img src={staticFile(src)} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, filter }} />
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** Затемнение для читаемости текста: сверху и/или снизу. */
export const Scrim: React.FC<{ top?: number; bottom?: number; topTo?: number; bottomFrom?: number; o?: number }> = ({ top = 0, bottom = 0, topTo = 900, bottomFrom = 1050, o = 1 }) => (
  <AbsoluteFill style={{ opacity: o, pointerEvents: "none" }}>
    {top > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: topTo, background: `linear-gradient(180deg, rgba(4,6,12,${top}) 0%, rgba(4,6,12,${top * 0.75}) 45%, rgba(4,6,12,0) 100%)` }} />}
    {bottom > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: bottomFrom, bottom: 0, background: `linear-gradient(0deg, rgba(4,6,12,${bottom}) 0%, rgba(4,6,12,${bottom * 0.8}) 45%, rgba(4,6,12,0) 100%)` }} />}
  </AbsoluteFill>
);

/* ------------------------------ Частицы ------------------------------ */

/** Медленная золотая пыль в луче/воздухе. */
export const Dust: React.FC<{ fr: number; n?: number; color?: string; area?: [number, number, number, number]; o?: number; seed?: number; rise?: number }> = ({
  fr, n = 40, color = "255,222,160", area = [0, 0, 1080, 1920], o = 1, seed = 0, rise = 14,
}) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: o }}>
    {Array.from({ length: n }).map((_, i) => {
      const [x0, y0, w, h] = area;
      const sp = 0.4 + rnd(i + seed + 3) * 0.8;
      const y = y0 + ((rnd(i + seed + 1) * h - (fr / FPS) * rise * sp) % h + h) % h;
      const x = x0 + rnd(i + seed + 2) * w + Math.sin(fr / 40 + i) * 10;
      const r = 0.8 + rnd(i + seed + 4) * 2.2;
      const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(fr / (12 + rnd(i + seed) * 20) + i * 1.7));
      return <circle key={i} cx={x} cy={y} r={r} fill={`rgba(${color},${0.55 * tw})`} />;
    })}
  </svg>
);

/** Мерцание звёзд поверх неба (лёгкое, чтобы космос жил). */
export const Twinkle: React.FC<{ fr: number; n?: number; h?: number; seed?: number; o?: number }> = ({ fr, n = 36, h = 900, seed = 50, o = 1 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: o }}>
    {Array.from({ length: n }).map((_, i) => {
      const x = rnd(i + seed) * 1080;
      const y = rnd(i + seed + 100) * h;
      const tw = Math.pow(0.5 + 0.5 * Math.sin(fr / (9 + rnd(i + seed + 7) * 18) + i * 2.3), 6);
      const r = 1 + rnd(i + seed + 9) * 1.4;
      return (
        <g key={i} opacity={tw * 0.9}>
          <circle cx={x} cy={y} r={r * 2.6} fill="rgba(190,215,255,0.18)" />
          <circle cx={x} cy={y} r={r} fill="#eef4ff" />
        </g>
      );
    })}
  </svg>
);

/* ------------------------------ Плёнка и водяной знак ------------------------------ */

export const Grain: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "overlay", opacity: 0.06 }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={fr % 12} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
};

/**
 * Водяной знак страницы: 5 появлений по 2 секунды, мелко, плавает, только в безопасной зоне и там, где нет текста.
 * Без знака (заказ клиента) — оставьте text пустым.
 * Время t — секунды; подбирайте места по скриншотам каждого ролика.
 */
export const WATERMARK = {
  text: "", // ник автора, например "YOUR NAME"; пусто — без водяного знака
  shots: [
    { t: 8.0, x: 760, y: 1380, dx: -90, dy: 20 },
    { t: 30.2, x: 330, y: 980, dx: 90, dy: -30 },
    { t: 57.0, x: 720, y: 1330, dx: -90, dy: 30 },
    { t: 84.0, x: 330, y: 1400, dx: 90, dy: -20 },
    { t: 108.6, x: 760, y: 740, dx: -80, dy: 30 },
  ],
};

export const Watermark: React.FC = () => {
  const fr = useCurrentFrame();
  const shot = WATERMARK.text ? WATERMARK.shots.find((w) => fr >= w.t * FPS && fr < w.t * FPS + 60) : undefined;
  if (!shot) return null;
  const p = (fr - shot.t * FPS) / 60;
  const o = interpolate(p, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const ease = 0.5 - 0.5 * Math.cos(p * Math.PI);
  return (
    <div
      data-safe="watermark"
      style={{
        position: "absolute",
        left: shot.x + shot.dx * ease + Math.sin(p * Math.PI * 2) * 14,
        top: shot.y + shot.dy * ease + Math.cos(p * Math.PI * 2) * 10,
        translate: "-50% -50%",
        rotate: `${(p - 0.5) * 6}deg`,
        display: "flex",
        alignItems: "center",
        gap: 10,
        whiteSpace: "nowrap",
        fontFamily: SANS,
        fontWeight: 500,
        fontSize: 19,
        letterSpacing: "0.3em",
        color: "rgba(255,250,242,0.85)",
        textShadow: "0 1px 2px rgba(10,8,14,0.6), 0 0 10px rgba(10,8,14,0.4)",
        opacity: o * 0.8,
        filter: o < 0.99 ? `blur(${(1 - o) * 4}px)` : undefined,
        pointerEvents: "none",
      }}
    >
      <span style={{ width: 30, height: 1, background: "linear-gradient(90deg, rgba(240,200,120,0), rgba(240,200,120,0.7))" }} />
      <span style={{ marginRight: "-0.3em" }}>{WATERMARK.text}</span>
      <span style={{ width: 30, height: 1, background: "linear-gradient(90deg, rgba(240,200,120,0.7), rgba(240,200,120,0))" }} />
    </div>
  );
};

/**
 * Проверка безопасной зоны (отладка, inputProps.probe = true). Для каждого [data-safe] пишет в консоль
 * рамку реального текста (по текстовым узлам, относительно корня [data-reel-root], в пикселях кадра 1080×1920)
 * и число строк у [data-lines]. Лог разбирает scripts/check_safe.py.
 */
export const SafeProbe: React.FC = () => {
  const fr = useCurrentFrame();
  useEffect(() => {
    const root = document.querySelector("[data-reel-root]")?.getBoundingClientRect();
    const ox = root?.left ?? 0;
    const oy = root?.top ?? 0;
    const sc = root && root.width ? root.width / 1080 : 1;
    const out = Array.from(document.querySelectorAll<HTMLElement | SVGElement>("[data-safe]")).map((el) => {
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      const add = (r: DOMRect) => {
        if (r.width < 1 || r.height < 1) return;
        x0 = Math.min(x0, r.left);
        y0 = Math.min(y0, r.top);
        x1 = Math.max(x1, r.right);
        y1 = Math.max(y1, r.bottom);
      };
      if (el instanceof SVGElement && !(el instanceof SVGSVGElement)) add(el.getBoundingClientRect());
      else {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let n: Node | null;
        while ((n = walker.nextNode())) {
          if (!n.textContent?.trim()) continue;
          const r = document.createRange();
          r.selectNodeContents(n);
          Array.from(r.getClientRects()).forEach(add);
        }
      }
      const ln = el.querySelector<HTMLElement>("[data-lines]");
      const words = ln ? Array.from(ln.querySelectorAll<HTMLElement>("[data-w]")) : [];
      const lines = new Set(words.map((w) => w.offsetTop)).size;
      const f = (v: number, o: number) => (Number.isFinite(v) ? Math.round((v - o) / sc) : 0);
      return { id: el.getAttribute("data-safe"), o: Number(getComputedStyle(el as Element).opacity), x0: f(x0, ox), y0: f(y0, oy), x1: f(x1, ox), y1: f(y1, oy), lines, exp: ln ? Number(ln.dataset.lines) : 0 };
    });
    console.log(`SAFE ${fr} ${JSON.stringify(out)}`);
  });
  return null;
};
