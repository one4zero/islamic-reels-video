import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { FPS } from "./timing";
import { ARABIC, C, clamp, easeInOut, prog, rnd } from "./ui";

/**
 * Моушн-слои поверх фонов: свет, дым, орбиты, сетки, сканирование, распад, жар,
 * геометрический орнамент и каллиграфия. Всё процедурное, кадр за кадром.
 */

const win = (fr: number, at: number, until: number, fin = 12, fout = 12) =>
  Math.min(interpolate(fr, [at, at + fin], [0, 1], clamp), interpolate(fr, [until - fout, until], [1, 0], clamp));

/* ------------------------------ Свет ------------------------------ */

/** Лучи света из точки (god rays): мягко дышат и чуть покачиваются. */
export const GodRays: React.FC<{ id: string; fr: number; x: number; y: number; dir?: number; spread?: number; len?: number; n?: number; rgb?: string; o?: number }> = ({
  id, fr, x, y, dir = 90, spread = 70, len = 1500, n = 16, rgb = "255,214,150", o = 1,
}) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", mixBlendMode: "screen", opacity: o, pointerEvents: "none" }}>
    <defs>
      <radialGradient id={`gr-${id}`} cx={x} cy={y} r={len} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={`rgb(${rgb})`} stopOpacity="0.55" />
        <stop offset="0.35" stopColor={`rgb(${rgb})`} stopOpacity="0.22" />
        <stop offset="1" stopColor={`rgb(${rgb})`} stopOpacity="0" />
      </radialGradient>
      <filter id={`grb-${id}`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="7" />
      </filter>
    </defs>
    <g filter={`url(#grb-${id})`}>
      {Array.from({ length: n }).map((_, i) => {
        const a = ((dir + (rnd(i + 3) - 0.5) * spread + Math.sin(fr / 70 + i) * 1.6) * Math.PI) / 180;
        const w = ((0.5 + rnd(i + 7) * 2.4) * Math.PI) / 180;
        const op = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(fr / (26 + rnd(i + 11) * 40) + i * 2.1));
        const p1 = [x + Math.cos(a - w) * len, y + Math.sin(a - w) * len];
        const p2 = [x + Math.cos(a + w) * len, y + Math.sin(a + w) * len];
        return <polygon key={i} points={`${x},${y} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`} fill={`url(#gr-${id})`} opacity={op} />;
      })}
    </g>
  </svg>
);

/** Анаморфный блик: тонкая горизонтальная полоса света с ядром. */
export const Flare: React.FC<{ fr: number; x: number; y: number; w?: number; rgb?: string; o?: number }> = ({ fr, x, y, w = 900, rgb = "255,200,140", o = 1 }) => {
  const pulse = 0.82 + 0.18 * Math.sin(fr / 17) * Math.sin(fr / 41);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, mixBlendMode: "screen", opacity: o * pulse, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: x - w / 2, top: y - 10, width: w, height: 20, background: `linear-gradient(90deg, rgba(${rgb},0), rgba(${rgb},0.35) 50%, rgba(${rgb},0))`, filter: "blur(8px)" }} />
      <div style={{ position: "absolute", left: x - w * 0.4, top: y - 1.2, width: w * 0.8, height: 2.4, background: `linear-gradient(90deg, rgba(${rgb},0), rgba(255,240,220,0.9) 50%, rgba(${rgb},0))` }} />
      <div style={{ position: "absolute", left: x - 70, top: y - 70, width: 140, height: 140, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(255,245,225,0.75), rgba(${rgb},0.25) 45%, rgba(${rgb},0))` }} />
    </div>
  );
};

/** Вспышка всего кадра (на ударах). */
export const Flash: React.FC<{ fr: number; at: number; rgb?: string; peak?: number; dur?: number }> = ({ fr, at, rgb = "255,236,210", peak = 0.55, dur = 16 }) => {
  if (fr < at - 2 || fr > at + dur) return null;
  const o = interpolate(fr, [at - 2, at, at + dur], [0, peak, 0], { ...clamp, easing: easeInOut });
  return <AbsoluteFill style={{ background: `radial-gradient(90% 60% at 50% 55%, rgba(${rgb},1), rgba(${rgb},0.4))`, opacity: o, mixBlendMode: "screen", pointerEvents: "none" }} />;
};

/* ------------------------------ Дым ------------------------------ */

const FOG_W = 1792;
const FOG_H = 768;

/** Два слоя дыма, медленно плывущие с разной скоростью (параллакс). */
export const Fog: React.FC<{ fr: number; y: number; h: number; o?: number; speed?: number; tint?: string }> = ({ fr, y, h, o = 0.22, speed = 0.6, tint }) => {
  const tw = (FOG_W * h) / FOG_H;
  const layer = (sp: number, k: number, op: number, dy: number) => {
    const off = (((fr * sp + k * 400) % tw) + tw) % tw;
    return (
      <div key={k} style={{ position: "absolute", left: 0, top: y + dy, width: 1080, height: h, overflow: "hidden", opacity: op }}>
        {[0, 1].map((j) => (
          <Img key={j} src={staticFile("fx/fog.png")} style={{ position: "absolute", top: 0, left: -off + j * tw, width: tw, height: h }} />
        ))}
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: o, mixBlendMode: "screen", filter: tint, pointerEvents: "none" }}>
      {layer(speed, 0, 1, 0)}
      {layer(speed * 1.9, 1, 0.7, h * 0.18)}
    </div>
  );
};

/* ------------------------------ Земля ------------------------------ */

/** Лимб Земли на earth_night: центр сферы и радиус в координатах кадра. */
export const EARTH = { cx: 540, cy: 2573, r: 1631 };

const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)];
  const p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
  return `M${p0[0]} ${p0[1]} A${r} ${r} 0 0 1 ${p1[0]} ${p1[1]}`;
};

/** Орбиты над лимбом: тонкие дуги прорисовываются, по ним бегут спутники-точки. */
export const Orbits: React.FC<{ fr: number; at: number; o?: number }> = ({ fr, at, o = 1 }) => {
  const rings = [
    { dr: 70, dash: "", w: 1.4, op: 0.55, sp: 0.0021 },
    { dr: 160, dash: "2 9", w: 1.6, op: 0.45, sp: -0.0015 },
    { dr: 290, dash: "", w: 1, op: 0.3, sp: 0.0011 },
  ];
  const a0 = (-148 * Math.PI) / 180;
  const a1 = (-32 * Math.PI) / 180;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: o, pointerEvents: "none" }}>
      <defs>
        <filter id="orbglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      {rings.map((rg, i) => {
        const r = EARTH.r + rg.dr;
        const len = r * (a1 - a0);
        const k = prog(fr, at + i * 6, at + i * 6 + 40);
        const sa = a0 + ((((fr - at) * rg.sp + i * 0.37) % 1) + 1) % 1 * (a1 - a0);
        const sx = EARTH.cx + r * Math.cos(sa);
        const sy = EARTH.cy + r * Math.sin(sa);
        return (
          <g key={i} opacity={rg.op}>
            <path d={arcPath(EARTH.cx, EARTH.cy, r, a0, a1)} fill="none" stroke={C.gold} strokeWidth={rg.w} strokeDasharray={rg.dash || `${len} ${len}`} strokeDashoffset={rg.dash ? 0 : len * (1 - k)} opacity={rg.dash ? k : 1} />
            <g opacity={k}>
              <circle cx={sx} cy={sy} r={7} fill={C.gold} filter="url(#orbglow)" />
              <circle cx={sx} cy={sy} r={3} fill="#fff6e0" />
            </g>
          </g>
        );
      })}
    </svg>
  );
};

/** Огни городов (камерные координаты earth_night, найдены по яркости картинки). */
export const CITIES: [number, number][] = [
  [801, 1378], [567, 1372], [190, 1653], [906, 1465], [290, 1137], [637, 1334], [833, 1448], [739, 1552], [328, 1207], [522, 1274], [219, 1130],
  [753, 1448], [723, 1111], [592, 1254], [737, 1307], [423, 1148], [213, 1232], [96, 1240], [356, 1283], [260, 1676], [108, 1638],
];
const LINKS: [number, number][] = [[0, 1], [1, 9], [9, 13], [13, 15], [15, 4], [4, 10], [10, 16], [16, 17], [5, 14], [14, 0], [0, 3], [3, 7], [6, 11], [8, 18], [18, 9], [2, 20], [2, 19]];

/** Пульсирующие точки на городах + сеть дуг между ними. */
export const CityNet: React.FC<{ fr: number; at: number; o?: number; links?: boolean }> = ({ fr, at, o = 1, links = true }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: o, pointerEvents: "none" }}>
    {links &&
      LINKS.map(([a, b], i) => {
        const [x0, y0] = CITIES[a];
        const [x1, y1] = CITIES[b];
        const mx = (x0 + x1) / 2;
        const my = (y0 + y1) / 2 - Math.hypot(x1 - x0, y1 - y0) * 0.35;
        const L = Math.hypot(x1 - x0, y1 - y0) * 1.25;
        const k = prog(fr, at + 8 + i * 3, at + 30 + i * 3);
        return <path key={`l${i}`} d={`M${x0} ${y0} Q${mx} ${my} ${x1} ${y1}`} fill="none" stroke="rgba(240,205,140,0.55)" strokeWidth={1.3} strokeDasharray={`${L} ${L}`} strokeDashoffset={L * (1 - k)} />;
      })}
    {CITIES.map(([x, y], i) => {
      const k = prog(fr, at + i * 1.5, at + i * 1.5 + 12);
      const ph = (((fr - at + i * 13) % 60) + 60) % 60 / 60;
      return (
        <g key={i} opacity={k}>
          <circle cx={x} cy={y} r={4 + ph * 22} fill="none" stroke="rgba(255,215,150,0.8)" strokeWidth={1.2} opacity={1 - ph} />
          <circle cx={x} cy={y} r={3.2} fill="#fff1d0" />
        </g>
      );
    })}
  </svg>
);

/* ------------------------------ Толпа: сетка и сканирование ------------------------------ */

/** Перспективная сетка на земле (точка схода на горизонте), прорисовывается из точки схода. */
export const PerspGrid: React.FC<{ fr: number; at: number; until: number; vx: number; vy: number; o?: number; rows?: number }> = ({ fr, at, until, vx, vy, o = 0.42, rows = 9 }) => {
  if (fr < at || fr > until) return null;
  const k = prog(fr, at, at + 30);
  const out = interpolate(fr, [until - 12, until], [1, 0], clamp);
  const H = 1920 - vy;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: o * out, pointerEvents: "none" }}>
      {Array.from({ length: 25 }).map((_, i) => {
        const bx = vx + (i - 12) * 210;
        const ex = vx + (bx - vx) * 1.4;
        const ey = vy + H * 1.4;
        const L = Math.hypot(ex - vx, ey - vy);
        return <line key={`r${i}`} x1={vx} y1={vy} x2={ex} y2={ey} stroke={C.gold} strokeWidth={1} strokeDasharray={`${L} ${L}`} strokeDashoffset={L * (1 - k)} opacity={0.8} />;
      })}
      {Array.from({ length: rows }).map((_, j) => {
        const t = (j + 1) / rows;
        const y = vy + H * Math.pow(t, 1.9);
        const kk = prog(fr, at + 8 + j * 3, at + 22 + j * 3);
        const half = 540 + 1400 * t;
        return <line key={`h${j}`} x1={vx - half * kk} y1={y} x2={vx + half * kk} y2={y} stroke={C.gold} strokeWidth={1} opacity={0.75} />;
      })}
    </svg>
  );
};

/** Полоса сканирования, бегущая от горизонта к зрителю. */
export const ScanBeam: React.FC<{ fr: number; at: number; dur: number; y0: number; y1: number; o?: number }> = ({ fr, at, dur, y0, y1, o = 1 }) => {
  if (fr < at || fr > at + dur) return null;
  const t = interpolate(fr, [at, at + dur], [0, 1], { ...clamp, easing: easeInOut });
  const y = y0 + (y1 - y0) * t;
  const a = Math.sin(t * Math.PI);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, mixBlendMode: "screen", opacity: o * a, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: -100, width: 1280, top: y - 90, height: 180, background: "linear-gradient(180deg, rgba(255,205,130,0), rgba(255,205,130,0.35) 50%, rgba(255,205,130,0))" }} />
      <div style={{ position: "absolute", left: -100, width: 1280, top: y - 1, height: 2, background: "rgba(255,230,180,0.9)" }} />
    </div>
  );
};

/* ------------------------------ Частицы ------------------------------ */

/** Пепел/пыль, срывающиеся с области (цифры, толпа) и улетающие вверх. */
export const Ash: React.FC<{ fr: number; at: number; dur: number; area: [number, number, number, number]; n?: number; rgb?: string; drift?: number; seed?: number }> = ({
  fr, at, dur, area, n = 90, rgb = "190,200,215", drift = 1, seed = 0,
}) => {
  if (fr < at || fr > at + dur + 60) return null;
  const [x0, y0, w, h] = area;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const born = at + rnd(i + seed) * dur;
        const age = (fr - born) / FPS;
        if (age < 0 || age > 2) return null;
        const x = x0 + rnd(i + seed + 1) * w + age * (30 + rnd(i + seed + 2) * 90) * drift;
        const y = y0 + rnd(i + seed + 3) * h - age * (60 + rnd(i + seed + 4) * 120);
        const r = 1 + rnd(i + seed + 5) * 2.4;
        return <circle key={i} cx={x} cy={y} r={r} fill={`rgba(${rgb},${Math.max(0, 0.85 - age * 0.45)})`} />;
      })}
    </svg>
  );
};

/** Световые следы, вылетающие от точки в сторону (направо/налево). */
export const Trails: React.FC<{ fr: number; at: number; x: number; y: number; dir: 1 | -1; n?: number; len?: number; rgb?: string }> = ({ fr, at, x, y, dir, n = 9, len = 520, rgb = "255,214,150" }) => {
  if (fr < at || fr > at + 50) return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", mixBlendMode: "screen", pointerEvents: "none" }}>
      <defs>
        <linearGradient id={`tr${dir}`} x1={dir === 1 ? 0 : 1} x2={dir === 1 ? 1 : 0} y1="0" y2="0">
          <stop offset="0" stopColor={`rgb(${rgb})`} stopOpacity="0" />
          <stop offset="1" stopColor="#fff4dc" stopOpacity="1" />
        </linearGradient>
      </defs>
      {Array.from({ length: n }).map((_, i) => {
        const a = at + i * 2.2;
        const t = interpolate(fr, [a, a + 24], [0, 1], { ...clamp, easing: easeInOut });
        if (t <= 0 || t >= 1) return null;
        const yy = y + (rnd(i + 30) - 0.5) * 360;
        const head = x + dir * (40 + t * len);
        const tail = head - dir * 180 * Math.sin(t * Math.PI);
        return <rect key={i} x={Math.min(head, tail)} y={yy} width={Math.abs(head - tail)} height={2 + rnd(i) * 2} fill={`url(#tr${dir})`} opacity={Math.sin(t * Math.PI)} />;
      })}
    </svg>
  );
};

/* ------------------------------ Фильтры (распад, жар) ------------------------------ */

/** SVG-фильтры для CSS: `filter: url(#heat)` и `url(#dis-…)` на картинках. */
export const FilterDefs: React.FC<{ heat: number; dis: number }> = ({ heat, dis }) => {
  const th = 0.18 + 0.66 * dis;
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <defs>
        <filter id="heat" x="-3%" y="-3%" width="106%" height="135%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.022" numOctaves="2" seed="3" result="n" />
          <feOffset in="n" dy={-heat * 2.5} result="n2" />
          <feDisplacementMap in="SourceGraphic" in2="n2" scale="14" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="dis" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="na" />
          <feComponentTransfer in="na" result="m">
            <feFuncA type="linear" slope="14" intercept={-14 * th + 0.5} />
          </feComponentTransfer>
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
      </defs>
    </svg>
  );
};

/* ------------------------------ Орнамент и каллиграфия ------------------------------ */

/** 8-конечная звезда из двух квадратов. */
const star8 = (cx: number, cy: number, R: number) => {
  const pts: string[] = [];
  const r = R * 0.765;
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8 - Math.PI / 2;
    const rr = i % 2 === 0 ? R : r;
    pts.push(`${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`);
  }
  return pts.join(" ");
};

/** Звёздный многоугольник {n/k} на окружности радиуса R. */
const starPoly = (cx: number, cy: number, R: number, n: number, k: number, rot = 0) => {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const j = (i * k) % n;
    const a = (j * 2 * Math.PI) / n - Math.PI / 2 + rot;
    pts.push(`${cx + R * Math.cos(a)},${cy + R * Math.sin(a)}`);
  }
  return pts.join(" ");
};

/**
 * Исламский геометрический орнамент: решётка 8-конечных звёзд (прорисовывается волной от центра)
 * и большая розетка {16/5}, {16/7}, {8/3} вокруг центра, медленно вращающиеся навстречу.
 */
export const Ornament: React.FC<{ fr: number; at: number; cx?: number; cy?: number; o?: number; rosette?: number; tile?: number; gridO?: number }> = ({ fr, at, cx = 540, cy = 860, o = 1, rosette = 330, tile = 150, gridO = 0.5 }) => {
  const t = fr - at;
  const rot = t * 0.0016;
  const grid: React.ReactNode[] = [];
  for (let gy = -7; gy <= 7; gy++) {
    for (let gx = -4; gx <= 4; gx++) {
      const x = cx + gx * tile;
      const y = cy + gy * tile;
      const d = Math.hypot(x - cx, y - cy);
      const k = prog(fr, at + d / 40, at + d / 40 + 24);
      if (k <= 0) continue;
      const fade = Math.max(0, 1 - d / 1100);
      const L = tile * 3.2;
      grid.push(
        <g key={`${gx}_${gy}`} opacity={k * fade}>
          <polygon points={star8(x, y, tile * 0.36)} fill="none" stroke={C.gold} strokeWidth={1} strokeDasharray={`${L} ${L}`} strokeDashoffset={L * (1 - k)} />
          <rect x={x + tile / 2 - tile * 0.13} y={y + tile / 2 - tile * 0.13} width={tile * 0.26} height={tile * 0.26} transform={`rotate(45 ${x + tile / 2} ${y + tile / 2})`} fill="none" stroke={C.gold} strokeWidth={0.8} opacity={0.7} />
          <line x1={x + tile * 0.36} y1={y} x2={x + tile * 0.64} y2={y} stroke={C.gold} strokeWidth={0.8} opacity={0.6} />
          <line x1={x} y1={y + tile * 0.36} x2={x} y2={y + tile * 0.64} stroke={C.gold} strokeWidth={0.8} opacity={0.6} />
        </g>,
      );
    }
  }
  const rk = (d: number) => prog(fr, at + d, at + d + 40);
  const ring = (R: number, n: number, k: number, r0: number, d: number, sw: number, op: number) => {
    const per = 2 * R * n * Math.sin((Math.PI * k) / n);
    const kk = rk(d);
    return <polygon points={starPoly(cx, cy, R, n, k, r0)} fill="none" stroke={C.gold} strokeWidth={sw} strokeDasharray={`${per} ${per}`} strokeDashoffset={per * (1 - kk)} opacity={op} />;
  };
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: o, pointerEvents: "none" }}>
      <defs>
        <radialGradient id="ornfade" cx={cx} cy={cy} r={1000} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="0.25" stopColor="#000" stopOpacity="0.15" />
          <stop offset="1" stopColor="#000" stopOpacity="0.85" />
        </radialGradient>
        <filter id="ornglow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <g opacity={gridO}>{grid}</g>
      <rect width={1080} height={1920} fill="url(#ornfade)" />
      <g transform={`rotate(${(rot * 180) / Math.PI} ${cx} ${cy})`}>
        {ring(rosette, 16, 5, 0, 4, 1.4, 0.75)}
        {ring(rosette, 16, 7, 0, 10, 1, 0.45)}
        <circle cx={cx} cy={cy} r={rosette} fill="none" stroke={C.gold} strokeWidth={1} opacity={0.35 * rk(0)} />
      </g>
      <g transform={`rotate(${(-rot * 1.6 * 180) / Math.PI} ${cx} ${cy})`}>
        {ring(rosette * 0.72, 8, 3, Math.PI / 8, 16, 1.4, 0.7)}
        <circle cx={cx} cy={cy} r={rosette * 1.18} fill="none" stroke={C.gold} strokeWidth={0.8} strokeDasharray="2 10" opacity={0.5 * rk(18)} />
      </g>
      <g filter="url(#ornglow)" opacity={0.5}>
        <g transform={`rotate(${(rot * 180) / Math.PI} ${cx} ${cy})`}>{ring(rosette, 16, 5, 0, 4, 2, 0.8)}</g>
      </g>
    </svg>
  );
};

/** Каллиграфия с проявлением из расфокуса и бегущим бликом по буквам. */
export const Calligraphy: React.FC<{ fr: number; at: number; until: number; y: number; text: string; size?: number }> = ({ fr, at, until, y, text, size = 118 }) => {
  if (fr < at || fr > until) return null;
  const k = prog(fr, at, at + 26);
  const out = interpolate(fr, [until - 10, until], [1, 0], clamp);
  const sh = interpolate(fr, [at + 14, at + 60], [120, -20], clamp);
  return (
    <div
      data-safe={`calli ${text}`}
      style={{
        position: "absolute",
        left: 130,
        width: 820,
        top: y,
        textAlign: "center",
        direction: "rtl",
        fontFamily: ARABIC,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.5,
        opacity: k * out,
        transform: `scale(${1.08 - 0.08 * k})`,
        filter: k < 0.99 || out < 0.99 ? `blur(${(1 - k * out) * 10}px) drop-shadow(0 0 24px rgba(230,190,110,0.45))` : "drop-shadow(0 0 24px rgba(230,190,110,0.45))",
      }}
    >
      <span
        style={{
          backgroundImage: `linear-gradient(100deg, #d9b56c 0%, #f0d9a6 ${sh - 14}%, #fffaf0 ${sh}%, #f0d9a6 ${sh + 14}%, #d9b56c 100%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          padding: "0.45em 0.1em",
          WebkitBoxDecorationBreak: "clone",
          boxDecorationBreak: "clone",
        }}
      >
        {text}
      </span>
    </div>
  );
};

/* ------------------------------ Переходы ------------------------------ */

export type Trans = "fade" | "iris" | "wipe" | "zoom" | "sweep" | "flash" | "cut";

/** Стиль входа кадра (обрезка/масштаб) и элементы поверх перехода (кольцо, линии, световая полоса). */
export const transIn = (trans: Trans, p: number, ix = 540, iy = 960): { style: React.CSSProperties; overlay: React.ReactNode } => {
  const e = easeInOut(p);
  switch (trans) {
    case "iris": {
      const R = e * 1170;
      return {
        style: { clipPath: `circle(${R}px at ${ix}px ${iy}px)` },
        overlay:
          p > 0 && p < 1 ? (
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              <circle cx={ix} cy={iy} r={R} fill="none" stroke="rgba(255,222,160,0.9)" strokeWidth={3} opacity={1 - e} />
              <circle cx={ix} cy={iy} r={R} fill="none" stroke="rgba(255,200,120,0.5)" strokeWidth={16} opacity={(1 - e) * 0.5} style={{ filter: "blur(8px)" }} />
            </svg>
          ) : null,
      };
    }
    case "wipe": {
      const half = e * 50;
      return {
        style: { clipPath: `inset(${50 - half}% 0 ${50 - half}% 0)` },
        overlay:
          p > 0 && p < 1 ? (
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 1 - e * 0.6 }}>
              {[960 - e * 960, 960 + e * 960].map((yy, i) => (
                <div key={i} style={{ position: "absolute", left: 0, right: 0, top: yy - 1, height: 2, background: "linear-gradient(90deg, rgba(255,222,160,0), rgba(255,222,160,0.95) 50%, rgba(255,222,160,0))", boxShadow: "0 0 18px rgba(255,200,120,0.8)" }} />
              ))}
            </div>
          ) : null,
      };
    }
    case "zoom":
      return { style: { opacity: e, transform: `scale(${1.22 - 0.22 * e})`, filter: e < 0.99 ? `blur(${(1 - e) * 12}px)` : undefined }, overlay: null };
    case "sweep": {
      const x = -700 + e * 2500;
      return {
        style: { opacity: e },
        overlay:
          p > 0 && p < 1 ? (
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", mixBlendMode: "screen", opacity: Math.sin(p * Math.PI) }}>
              <div style={{ position: "absolute", top: -400, left: x - 300, width: 600, height: 2800, transform: "rotate(18deg)", background: "linear-gradient(90deg, rgba(255,220,160,0), rgba(255,226,180,0.55) 50%, rgba(255,220,160,0))", filter: "blur(10px)" }} />
            </div>
          ) : null,
      };
    }
    case "flash":
      return {
        style: { opacity: e },
        overlay: p < 1 ? <AbsoluteFill style={{ background: "rgba(255,236,210,1)", opacity: Math.max(0, 0.7 - p * 1.2), mixBlendMode: "screen", pointerEvents: "none" }} /> : null,
      };
    case "cut":
      return { style: {}, overlay: null };
    default:
      return { style: { opacity: e }, overlay: null };
  }
};

/** Выход предыдущего кадра под «zoom»-переход: разгон вперёд с размытием. */
export const zoomOut = (p: number): React.CSSProperties => {
  const e = easeInOut(p);
  return { transform: `scale(${1 + 0.3 * e})`, filter: e > 0.01 ? `blur(${e * 10}px)` : undefined };
};

export { win };

/* ------------------------------ Синематик-фон для графических экранов ------------------------------ */

/** Мягкие пятна боке на разной глубине: дальние мелкие и резкие, ближние крупные и размытые. */
export const Bokeh: React.FC<{ fr: number; n?: number; seed?: number; o?: number }> = ({ fr, n = 34, seed = 0, o = 1 }) => (
  <div style={{ position: "absolute", inset: 0, opacity: o, mixBlendMode: "screen", pointerEvents: "none" }}>
    {Array.from({ length: n }).map((_, i) => {
      const depth = rnd(i + seed + 1);
      const r = 6 + depth * 46;
      const sp = 0.15 + depth * 0.7;
      const x = rnd(i + seed + 2) * 1080 + Math.sin(fr / (60 + i * 3) + i) * 30 * depth;
      const y = ((rnd(i + seed + 3) * 2200 - fr * sp) % 2200 + 2200) % 2200 - 140;
      const warm = rnd(i + seed + 4) > 0.45;
      const tw = 0.6 + 0.4 * Math.sin(fr / (20 + i) + i);
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x - r,
            top: y - r,
            width: r * 2,
            height: r * 2,
            borderRadius: "50%",
            background: warm ? "radial-gradient(closest-side, rgba(255,214,150,0.5), rgba(255,214,150,0.12) 70%, rgba(255,214,150,0))" : "radial-gradient(closest-side, rgba(150,190,255,0.45), rgba(150,190,255,0.1) 70%, rgba(150,190,255,0))",
            opacity: (0.18 + 0.35 * (1 - depth)) * tw,
            filter: `blur(${depth * 5}px)`,
          }}
        />
      );
    })}
  </div>
);

/**
 * Анимированный «киношный» фон без картинок: глубокий градиент, плывущие объёмные пятна света,
 * дым на двух глубинах, боке, звёздная пыль, редкая сетка точек и проходящий световой блик.
 */
export const CineBg: React.FC<{ fr: number; at: number; seed?: number }> = ({ fr, at, seed = 0 }) => {
  const t = (fr - at) / FPS;
  const blobs = [
    { x: 540 + Math.sin(t * 0.35 + seed) * 220, y: 760 + Math.cos(t * 0.27) * 140, r: 620, c: "255,196,120", a: 0.2 },
    { x: 300 + Math.cos(t * 0.3 + 1) * 180, y: 1350 + Math.sin(t * 0.22) * 160, r: 560, c: "90,140,255", a: 0.16 },
    { x: 860 + Math.sin(t * 0.25 + 2) * 160, y: 420 + Math.cos(t * 0.31 + 1) * 120, r: 480, c: "120,160,255", a: 0.12 },
  ];
  const leak = interpolate(fr, [at, at + 150], [-600, 1700], clamp);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 38%, #111a31 0%, #070b16 55%, #03050a 100%)", overflow: "hidden" }}>
      {blobs.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: b.x - b.r, top: b.y - b.r, width: b.r * 2, height: b.r * 2, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(${b.c},${b.a}), rgba(${b.c},0))`, mixBlendMode: "screen" }} />
      ))}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.18 }}>
        {Array.from({ length: 22 }).map((_, gy) =>
          Array.from({ length: 12 }).map((__, gx) => <circle key={`${gx}_${gy}`} cx={45 + gx * 90} cy={40 + gy * 90} r={1.2} fill="#9fb3d9" />),
        )}
      </svg>
      <Fog fr={fr} y={1120} h={700} o={0.13} speed={0.5} />
      <Fog fr={fr + 500} y={120} h={600} o={0.07} speed={0.3} />
      <Bokeh fr={fr} seed={seed} />
      <div style={{ position: "absolute", top: -400, left: leak - 260, width: 520, height: 2800, transform: "rotate(22deg)", background: "linear-gradient(90deg, rgba(255,210,150,0), rgba(255,210,150,0.10) 50%, rgba(255,210,150,0))", filter: "blur(18px)", mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

/** Влёт сквозь звёзды: штрихи разбегаются из центра и замедляются к прибытию. */
export const Warp: React.FC<{ fr: number; until: number; cx?: number; cy?: number; n?: number }> = ({ fr, until, cx = 540, cy = 900, n = 240 }) => {
  if (fr > until) return null;
  const sp = interpolate(fr, [0, until], [1, 0.05], { ...clamp, easing: easeInOut });
  const o = interpolate(fr, [until - 12, until], [1, 0], clamp);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o, mixBlendMode: "screen", pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const a = rnd(i + 900) * Math.PI * 2;
        const life = 18 + rnd(i + 901) * 14;
        const ph = ((fr + rnd(i + 902) * life) % life) / life;
        const d0 = 30 + Math.pow(ph, 2.2) * 1300;
        const len = 20 + sp * 260 * ph;
        const x0 = cx + Math.cos(a) * d0;
        const y0 = cy + Math.sin(a) * d0;
        const x1 = cx + Math.cos(a) * (d0 + len);
        const y1 = cy + Math.sin(a) * (d0 + len);
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={i % 5 === 0 ? "#ffe0a8" : "#dfe9ff"} strokeWidth={0.8 + ph * 1.8} opacity={Math.min(1, ph * 2) * 0.85} />;
      })}
    </svg>
  );
};

/**
 * «Галактика человечества»: 2 340 точек (1 точка = 50 млн человек = 117 млрд), стягиваются
 * по спирали в диск-подсолнух (золотой угол) синхронно с табло; на фиксации — кольцевая волна.
 */
export const PeopleGalaxy: React.FC<{ fr: number; at: number; full: number; lockAt: number; until: number; cx?: number; cy?: number; R?: number }> = ({
  fr, at, full, lockAt, until, cx = 540, cy = 1080, R = 290,
}) => {
  if (fr < at || fr > until) return null;
  const N = 2340;
  const out = interpolate(fr, [until - 12, until], [1, 0], clamp);
  const rot = (fr - at) * 0.0025;
  const pulse = fr >= lockAt ? interpolate(fr, [lockAt, lockAt + 30], [0, 1], clamp) : -1;
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < N; i++) {
    const a0 = at + (i / N) * (full - at);
    const k = interpolate(fr, [a0, a0 + 20], [0, 1], { ...clamp, easing: Easing_out });
    if (k <= 0) continue;
    const r = R * Math.sqrt((i + 0.5) / N);
    const th = i * 2.39996 + rot;
    const rs = r + (1 - k) * (380 + rnd(i) * 260);
    const ths = th + (1 - k) * 1.1;
    const x = cx + Math.cos(ths) * rs;
    const y = cy + Math.sin(ths) * rs;
    const hot = i % 9 === 0;
    dots.push(<circle key={i} cx={x} cy={y} r={hot ? 2.8 : 2.1} fill={hot ? "#fff3d6" : "#f0c97f"} opacity={k * (0.55 + 0.45 * rnd(i + 3))} />);
  }
  return (
    <div style={{ position: "absolute", inset: 0, opacity: out, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: cx - R * 1.6, top: cy - R * 1.6, width: R * 3.2, height: R * 3.2, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,200,120,0.28), rgba(255,200,120,0.06) 60%, rgba(255,200,120,0))", opacity: prog(fr, at, full), mixBlendMode: "screen" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <circle cx={cx} cy={cy} r={R + 26} fill="none" stroke="rgba(230,194,122,0.35)" strokeWidth={1} strokeDasharray="2 8" opacity={prog(fr, at + 20, at + 50)} transform={`rotate(${-rot * 40} ${cx} ${cy})`} />
        {dots}
        {pulse >= 0 && pulse < 1 && <circle cx={cx} cy={cy} r={R + 20 + pulse * 260} fill="none" stroke="#ffe3a8" strokeWidth={2.5 * (1 - pulse)} opacity={1 - pulse} />}
      </svg>
    </div>
  );
};

const Easing_out = (x: number) => 1 - Math.pow(1 - x, 3);
