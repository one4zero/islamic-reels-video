import React from "react";
import { interpolate } from "remotion";
import { FPS } from "./timing";
import { clamp, easeInOut, lerp, prog, rnd } from "./ui";

/**
 * «Сад» — мир метафоры: небо, разрез земли, семечка, камень, корни, росток и дерево,
 * которое растёт, плодоносит и цветёт. Всё процедурное и зависит только от кадра.
 * Мировые координаты: ширина 1080, линия земли GY.
 */

export const GY = 1300;
export const SEED = { x: 540, y: 1425 };

/* ------------------------------ Камера сада ------------------------------ */

export type GKey = [number, number, number, number]; // кадр, зум, центр X, центр Y (мир)
export const gcam = (fr: number, keys: GKey[]) => {
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
  return { z: lerp(k0[1], k1[1], t), cx: lerp(k0[2], k1[2], t), cy: lerp(k0[3], k1[3], t) };
};
export const gToScreen = (c: { z: number; cx: number; cy: number }, x: number, y: number) => ({ x: 540 + (x - c.cx) * c.z, y: 960 + (y - c.cy) * c.z });

/* ------------------------------ Состояние растения во времени ------------------------------ */

export type PlantT = {
  seedFall: [number, number];
  drops: [number, number];
  warm: [number, number];
  breeze: [number, number];
  crack: [number, number];
  roots: [number, number];
  sprout: [number, number];
  strong: [number, number];
  wind: [number, number];
  rain: [number, number];
  light: number;
  tree: [number, number];
  fruit: [number, number];
  bloom: [number, number];
};

export const plantState = (fr: number, P: PlantT) => {
  const fall = prog(fr, P.seedFall[0], P.seedFall[1], easeInOut);
  const crack = prog(fr, P.crack[0], P.crack[1]);
  const rootK = prog(fr, P.roots[0], P.roots[1], easeInOut);
  const sp1 = prog(fr, P.crack[1] - 6, P.sprout[1], easeInOut); // от трещины до первых листков
  const sp2 = prog(fr, P.strong[0], P.strong[1], easeInOut);
  const sproutH = sp1 < 1 ? lerp(-40, 150, sp1) : lerp(150, 250, sp2);
  const coty = prog(fr, P.sprout[0] + 20, P.sprout[1] + 10);
  const extraLeaves = sp2;
  const windK = fr >= P.wind[0] && fr <= P.wind[1] ? Math.sin(((fr - P.wind[0]) / (P.wind[1] - P.wind[0])) * Math.PI) : 0;
  const sway = Math.sin(fr / 22) * 4 + windK * (14 + Math.sin(fr / 4) * 10);
  const treeG = prog(fr, P.tree[0], P.tree[1], easeInOut);
  const leafK = prog(fr, P.tree[0] + (P.tree[1] - P.tree[0]) * 0.55, P.tree[1] + 12);
  const fruitK = prog(fr, P.fruit[0], P.fruit[1]);
  const bloomK = prog(fr, P.bloom[0], P.bloom[1], easeInOut);
  const dawn = Math.max(prog(fr, P.sprout[0] - 30, P.sprout[1] + 30, easeInOut) * 0.55, prog(fr, P.light - 20, P.light + 40, easeInOut) * 0.8, treeG > 0 || fr > P.tree[0] ? 0.85 : 0, bloomK > 0 ? 0.85 + 0.15 * bloomK : 0);
  return { fall, crack, rootK, sproutH, coty, extraLeaves, sway, treeG, leafK, fruitK, bloomK, dawn, windK };
};

/* ------------------------------ Небо ------------------------------ */

export const Sky: React.FC<{ fr: number; dawn: number; bloom: number }> = ({ fr, dawn, bloom }) => (
  <g>
    <defs>
      <linearGradient id="skyN" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#020c08" />
        <stop offset="0.7" stopColor="#06231a" />
        <stop offset="1" stopColor="#0c3326" />
      </linearGradient>
      <linearGradient id="skyD" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0a2c21" />
        <stop offset="0.55" stopColor="#1b4a35" />
        <stop offset="0.85" stopColor="#7c7a4e" />
        <stop offset="1" stopColor="#efc07e" />
      </linearGradient>
      <radialGradient id="hglow" cx="540" cy={GY} r="760" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ffe2a6" stopOpacity="0.95" />
        <stop offset="0.3" stopColor="#f2b56c" stopOpacity="0.45" />
        <stop offset="1" stopColor="#f2b56c" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="bloomHaze" cx="540" cy="700" r="900" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#f7c9d4" stopOpacity="0.35" />
        <stop offset="1" stopColor="#f7c9d4" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect x={-400} y={-1400} width={1880} height={GY + 1400} fill="url(#skyN)" />
    <rect x={-400} y={-1400} width={1880} height={GY + 1400} fill="url(#skyD)" opacity={dawn} />
    <rect x={-400} y={GY - 900} width={1880} height={900} fill="url(#hglow)" opacity={0.25 + dawn * 0.75} />
    {bloom > 0 && <rect x={-400} y={-400} width={1880} height={GY + 400} fill="url(#bloomHaze)" opacity={bloom} />}
    <circle cx={880} cy={GY - 1500} r={420} fill="rgba(220,240,225,0.10)" opacity={1 - dawn} style={{ filter: "blur(40px)" }} />
    {Array.from({ length: 160 }).map((_, i) => {
      const x = rnd(i + 11) * 1080;
      const y = -500 + rnd(i + 12) * (GY + 200);
      const tw = 0.4 + 0.6 * Math.pow(0.5 + 0.5 * Math.sin(fr / (10 + rnd(i) * 20) + i), 3);
      return <circle key={i} cx={x} cy={y} r={1 + rnd(i + 13) * 2} fill="#fff4dc" opacity={(1 - dawn) * tw * (0.5 + 0.5 * (1 - y / GY))} />;
    })}
  </g>
);

/* ------------------------------ Земля ------------------------------ */

export const Soil: React.FC<{ fr: number; glow: number; spring: number }> = ({ fr, glow, spring }) => (
  <g>
    <defs>
      <linearGradient id="soilG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2b1d12" />
        <stop offset="0.25" stopColor="#21160d" />
        <stop offset="1" stopColor="#0e0906" />
      </linearGradient>
      <radialGradient id="seedGlow" cx={SEED.x} cy={SEED.y} r="300" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ffd98f" stopOpacity="0.55" />
        <stop offset="0.4" stopColor="#d99a48" stopOpacity="0.18" />
        <stop offset="1" stopColor="#d99a48" stopOpacity="0" />
      </radialGradient>
    </defs>
    <path d={`M-400 ${GY} ${Array.from({ length: 30 }).map((_, i) => `L${-400 + i * 65} ${GY + Math.sin(i * 1.7) * 4}`).join(" ")} L1480 ${GY} L1480 ${GY + 1300} L-400 ${GY + 1300} Z`} fill="url(#soilG)" />
    {/* зёрна и камешки */}
    {Array.from({ length: 360 }).map((_, i) => (
      <circle key={i} cx={-100 + rnd(i + 300) * 1280} cy={GY + 10 + Math.pow(rnd(i + 301), 0.7) * 1150} r={0.8 + rnd(i + 302) * 2.4} fill={["#4a3322", "#5d4129", "#3a281a", "#6b4c30"][i % 4]} opacity={0.55} />
    ))}
    {Array.from({ length: 14 }).map((_, i) => (
      <ellipse key={`p${i}`} cx={rnd(i + 400) * 1080} cy={GY + 120 + rnd(i + 401) * 1000} rx={10 + rnd(i + 402) * 22} ry={6 + rnd(i + 403) * 12} fill="#3d2e22" opacity={0.7} transform={`rotate(${rnd(i + 404) * 40 - 20} ${rnd(i + 400) * 1080} ${GY + 120 + rnd(i + 401) * 1000})`} />
    ))}
    <rect x={-400} y={GY - 10} width={1880} height={700} fill="url(#seedGlow)" opacity={glow} />
    {/* трава по линии земли */}
    {Array.from({ length: 150 }).map((_, i) => {
      const x = -60 + i * 8 + rnd(i + 500) * 6;
      const h = 10 + rnd(i + 501) * 26;
      const lean = Math.sin(fr / 30 + i * 0.4) * 3 + (rnd(i + 502) - 0.5) * 8;
      const col = spring > 0 ? `rgb(${Math.round(lerp(18, 60, spring))},${Math.round(lerp(58, 120, spring))},${Math.round(lerp(38, 64, spring))})` : "#123a27";
      return <path key={`g${i}`} d={`M${x - 2} ${GY + 2} Q${x + lean * 0.5} ${GY - h * 0.6} ${x + lean} ${GY - h} Q${x + lean * 0.4} ${GY - h * 0.5} ${x + 2} ${GY + 2} Z`} fill={col} />;
    })}
  </g>
);

/* ------------------------------ Семечка и камень ------------------------------ */

export const Seed: React.FC<{ x: number; y: number; glow: number; s?: number }> = ({ x, y, glow, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(-18)`}>
    <defs>
      <radialGradient id="seedFill" cx="0.4" cy="0.35" r="0.8">
        <stop offset="0" stopColor="#fff1c8" />
        <stop offset="0.45" stopColor="#e5b866" />
        <stop offset="1" stopColor="#9a6a2c" />
      </radialGradient>
    </defs>
    <circle r={60} fill="rgba(255,214,140,0.25)" opacity={glow} style={{ filter: "blur(14px)" }} />
    <path d="M0 -26 C 17 -20 19 12 0 26 C -19 12 -17 -20 0 -26 Z" fill="url(#seedFill)" stroke="#f5dca0" strokeWidth={1.2} />
    <path d="M0 -22 C 5 -8 5 10 0 22" fill="none" stroke="rgba(120,80,30,0.6)" strokeWidth={1.4} />
  </g>
);

/** Камень над семечкой: трещина прорисовывается, половинки расходятся. */
export const Stone: React.FC<{ crack: number }> = ({ crack }) => {
  const sp = Math.max(0, (crack - 0.55) / 0.45);
  const half = (side: 1 | -1) => (
    <g transform={`translate(${side * sp * 46} ${-sp * 10}) rotate(${side * sp * 16} ${SEED.x} ${SEED.y - 64})`} opacity={1 - Math.max(0, sp - 0.6) * 1.2}>
      <path
        d={
          side === -1
            ? `M${SEED.x} ${SEED.y - 92} C ${SEED.x - 40} ${SEED.y - 96} ${SEED.x - 62} ${SEED.y - 76} ${SEED.x - 58} ${SEED.y - 58} C ${SEED.x - 54} ${SEED.y - 40} ${SEED.x - 22} ${SEED.y - 36} ${SEED.x + 4} ${SEED.y - 38} L ${SEED.x - 6} ${SEED.y - 60} L ${SEED.x + 6} ${SEED.y - 76} Z`
            : `M${SEED.x} ${SEED.y - 92} C ${SEED.x + 40} ${SEED.y - 96} ${SEED.x + 62} ${SEED.y - 76} ${SEED.x + 58} ${SEED.y - 58} C ${SEED.x + 54} ${SEED.y - 40} ${SEED.x + 26} ${SEED.y - 36} ${SEED.x + 4} ${SEED.y - 38} L ${SEED.x - 6} ${SEED.y - 60} L ${SEED.x + 6} ${SEED.y - 76} Z`
        }
        fill={side === -1 ? "#5b5249" : "#4c443c"}
        stroke="#7b7064"
        strokeWidth={1}
      />
    </g>
  );
  const L = 70;
  return (
    <g>
      {half(-1)}
      {half(1)}
      {sp <= 0 && (
        <polyline
          points={`${SEED.x} ${SEED.y - 92} ${SEED.x + 6} ${SEED.y - 76} ${SEED.x - 6} ${SEED.y - 60} ${SEED.x + 4} ${SEED.y - 38}`}
          fill="none"
          stroke="#ffe2a6"
          strokeWidth={2}
          strokeDasharray={`${L} ${L}`}
          strokeDashoffset={L * (1 - Math.min(1, crack / 0.55))}
          style={{ filter: "drop-shadow(0 0 6px rgba(255,210,140,0.9))" }}
        />
      )}
    </g>
  );
};

/* ------------------------------ Корни ------------------------------ */

type Seg = { x0: number; y0: number; cx: number; cy: number; x1: number; y1: number; w: number; d: number };

const buildRoots = () => {
  const out: Seg[] = [];
  const rec = (x: number, y: number, a: number, len: number, w: number, d: number, sd: number) => {
    const a2 = a + (rnd(sd) - 0.5) * 0.5;
    const x1 = x + Math.cos(a2) * len;
    const y1 = y + Math.sin(a2) * len;
    out.push({ x0: x, y0: y, cx: x + Math.cos(a) * len * 0.5, cy: y + Math.sin(a) * len * 0.5, x1, y1, w, d });
    if (d >= 4) return;
    const n = d === 0 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const sp = n === 3 ? (i - 1) * 0.6 : (i === 0 ? -1 : 1) * (0.35 + rnd(sd + i) * 0.3);
      rec(x1, y1, a2 + sp, len * (0.68 + rnd(sd + i + 3) * 0.14), w * 0.7, d + 1, sd * 3 + i + 1);
    }
  };
  rec(SEED.x, SEED.y + 22, Math.PI / 2, 95, 3.4, 0, 5);
  return out;
};
const ROOTS = buildRoots();

const partQ = (s: { x0: number; y0: number; cx: number; cy: number; x1: number; y1: number }, u: number) => {
  const q1x = lerp(s.x0, s.cx, u);
  const q1y = lerp(s.y0, s.cy, u);
  const bx = (1 - u) * (1 - u) * s.x0 + 2 * (1 - u) * u * s.cx + u * u * s.x1;
  const by = (1 - u) * (1 - u) * s.y0 + 2 * (1 - u) * u * s.cy + u * u * s.y1;
  return { q1x, q1y, bx, by };
};

export const Roots: React.FC<{ k: number }> = ({ k }) => (
  <g style={{ filter: "drop-shadow(0 0 4px rgba(255,215,150,0.6))" }}>
    {ROOTS.map((s, i) => {
      const u = Math.max(0, Math.min(1, k * 5 - s.d));
      if (u <= 0) return null;
      const p = partQ(s, u);
      return <path key={i} d={`M${s.x0} ${s.y0} Q${p.q1x} ${p.q1y} ${p.bx} ${p.by}`} fill="none" stroke="rgba(243,220,168,0.9)" strokeWidth={s.w} strokeLinecap="round" />;
    })}
  </g>
);

/* ------------------------------ Росток ------------------------------ */

const Leaf: React.FC<{ x: number; y: number; ang: number; len: number; k: number; tone?: number }> = ({ x, y, ang, len, k, tone = 0 }) => {
  if (k <= 0) return null;
  const L = len * k;
  const W = L * 0.42;
  return (
    <g transform={`translate(${x} ${y}) rotate(${ang})`}>
      <path d={`M0 0 Q ${L * 0.45} ${-W} ${L} 0 Q ${L * 0.45} ${W} 0 0 Z`} fill={tone ? "#5fb06f" : "#4a9c5e"} stroke="#9fd69a" strokeWidth={0.8} />
      <path d={`M0 0 Q ${L * 0.5} ${-W * 0.12} ${L * 0.92} 0`} fill="none" stroke="rgba(220,245,200,0.6)" strokeWidth={1} />
    </g>
  );
};

/** Стебель от семечки вверх; над землёй — семядоли, потом пары листьев. h — высота над землёй. */
export const Sprout: React.FC<{ h: number; coty: number; extra: number; sway: number; o?: number }> = ({ h, coty, extra, sway, o = 1 }) => {
  const top = GY - h;
  const tx = SEED.x + sway;
  const d = `M${SEED.x} ${SEED.y - 10} C ${SEED.x - 6} ${GY + 40} ${SEED.x + sway * 0.2} ${GY - h * 0.3} ${tx} ${top}`;
  const stemW = 5 + extra * 2.5;
  return (
    <g opacity={o}>
      <path d={d} fill="none" stroke="#3f8a52" strokeWidth={stemW} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#8fd08a" strokeWidth={stemW * 0.3} strokeLinecap="round" transform="translate(1.2 0)" />
      {h > 0 && (
        <>
          <Leaf x={tx} y={top} ang={-160 + sway * 0.6} len={62} k={coty} />
          <Leaf x={tx} y={top} ang={-20 + sway * 0.6} len={62} k={coty} tone={1} />
          <Leaf x={SEED.x + sway * 0.55} y={GY - h * 0.55} ang={-150 + sway * 0.4} len={78} k={Math.min(1, extra * 1.6)} />
          <Leaf x={SEED.x + sway * 0.6} y={GY - h * 0.62} ang={-30 + sway * 0.4} len={78} k={Math.max(0, Math.min(1, extra * 1.6 - 0.4))} tone={1} />
        </>
      )}
    </g>
  );
};

/* ------------------------------ Дерево ------------------------------ */

type Br = Seg & { tip: boolean; sd: number };
const MAXD = 6;
const buildTree = () => {
  const out: Br[] = [];
  const rec = (x: number, y: number, a: number, len: number, w: number, d: number, sd: number) => {
    const a2 = Math.max(-Math.PI + 0.35, Math.min(-0.35, a + (rnd(sd) - 0.5) * 0.3));
    const x1 = x + Math.cos(a2) * len;
    const y1 = y + Math.sin(a2) * len;
    out.push({ x0: x, y0: y, cx: x + Math.cos(a) * len * 0.5, cy: y + Math.sin(a) * len * 0.5, x1, y1, w, d, tip: d === MAXD, sd });
    if (d >= MAXD) return;
    const n = d < 1 ? 2 : rnd(sd + 1) > 0.4 ? 2 : 3;
    // лёгкая тяга вверх: крона — купол
    const up = (-Math.PI / 2 - a2) * 0.16;
    for (let i = 0; i < n; i++) {
      const sp = n === 2 ? (i === 0 ? -1 : 1) * (0.3 + rnd(sd + i + 2) * 0.22) : (i - 1) * (0.4 + rnd(sd + i + 5) * 0.1);
      rec(x1, y1, a2 + sp + up, len * (0.75 + rnd(sd + i + 9) * 0.08), w * 0.66, d + 1, sd * 3 + i + 1);
    }
  };
  rec(SEED.x, GY, -Math.PI / 2, 200, 32, 0, 41);
  return out;
};
const TREE = buildTree();
/** Плоды: каждая 5-я верхушка; три «плода-подписи» — слева, по центру, справа. */
const INNER = TREE.filter((b) => b.d >= 4);
export const FRUITS = INNER.filter((_, i) => i % 6 === 1).map((b) => ({ x: b.x1, y: b.y1 + 12 }));
const BLOSSOM = INNER.filter((_, i) => i % 2 === 0);
/** Габариты кроны (по концам ветвей) — для «облака» листвы. */
const CB = (() => {
  const xs = INNER.map((b) => b.x1);
  const ys = INNER.map((b) => b.y1);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
})();
const CLOUD = Array.from({ length: 16 }).map((_, i) => {
  const a = (i / 16) * Math.PI * 2;
  const cx = (CB.x0 + CB.x1) / 2;
  const cy = (CB.y0 + CB.y1) / 2 + 30;
  const rx = (CB.x1 - CB.x0) / 2 - 70;
  const ry = (CB.y1 - CB.y0) / 2 - 20;
  return { x: cx + Math.cos(a) * rx * (0.75 + rnd(i + 600) * 0.2), y: cy + Math.sin(a) * ry * (0.75 + rnd(i + 601) * 0.2), r: 110 + rnd(i + 602) * 60 };
});
export const pickFruit = (side: "l" | "c" | "r") => {
  const pool = [...FRUITS].filter((f) => f.x > 250 && f.x < 830).sort((a, b) => a.x - b.x);
  return side === "l" ? pool[Math.floor(pool.length * 0.1)] : side === "r" ? pool[Math.floor(pool.length * 0.9)] : pool[Math.floor(pool.length * 0.5)];
};
const CROWN = TREE.filter((b) => b.d >= 2);

const LEAF_COL = ["#2f7d4f", "#3e9560", "#56a96a", "#78bf7c"];

export const Tree: React.FC<{ fr: number; g: number; leafK: number; fruitK: number; bloomK: number; sway: number }> = ({ fr, g, leafK, fruitK, bloomK, sway }) => {
  const sw = Math.sin(fr / 40) * 1.2 + sway * 0.1;
  return (
    <g>
      <defs>
        <radialGradient id="fruitG" cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fff3cf" />
          <stop offset="0.5" stopColor="#f0c364" />
          <stop offset="1" stopColor="#b9822e" />
        </radialGradient>
        <radialGradient id="petalG" cx="0.5" cy="0.9" r="1">
          <stop offset="0" stopColor="#d9768f" />
          <stop offset="0.6" stopColor="#f1aabb" />
          <stop offset="1" stopColor="#fde3e9" />
        </radialGradient>
      </defs>
      {/* стержневой корень: ствол уходит под землю к семечке */}
      <path d={`M${SEED.x} ${GY + 4} L${SEED.x} ${SEED.y - 6}`} stroke="#3a2617" strokeWidth={32 * (0.25 + 0.75 * g) * 0.55} strokeLinecap="round" opacity={Math.min(1, g * 3)} />
      {/* объём кроны: мягкие размытые пятна листвы позади */}
      <defs>
        <filter id="crownBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      {leafK > 0 && (
        <g filter="url(#crownBlur)" opacity={0.95}>
          <ellipse cx={(CB.x0 + CB.x1) / 2} cy={(CB.y0 + CB.y1) / 2 + 30} rx={((CB.x1 - CB.x0) / 2 - 40) * leafK} ry={((CB.y1 - CB.y0) / 2) * leafK} fill="#2b6c44" />
          {CLOUD.map((c, i) => (
            <circle key={`cl${i}`} cx={c.x} cy={c.y} r={c.r * leafK} fill={["#2a6b43", "#327a4b", "#3b8a55"][i % 3]} />
          ))}
          {CROWN.map((b, i) =>
            [0.5, 1].map((t) => {
              const kk = Math.max(0, Math.min(1, leafK * 1.5 - (b.d / MAXD) * 0.5));
              const x = lerp(b.x0, b.x1, t);
              const y = lerp(b.y0, b.y1, t);
              return <ellipse key={`cr${i}_${t}`} cx={x} cy={y} rx={46 * kk} ry={37 * kk} fill={["#2a6b43", "#327a4b", "#3b8a55"][(i + (t === 1 ? 1 : 0)) % 3]} />;
            }),
          )}
        </g>
      )}
      {TREE.map((b, i) => {
        const u = Math.max(0, Math.min(1, g * (MAXD + 1) - b.d));
        if (u <= 0) return null;
        const p = partQ(b, u);
        const w = b.w * (0.25 + 0.75 * g);
        const off = (b.d / MAXD) * sw * 6;
        return (
          <g key={i} transform={`translate(${off} 0)`}>
            <path d={`M${b.x0} ${b.y0} Q${p.q1x} ${p.q1y} ${p.bx} ${p.by}`} fill="none" stroke="#3a2617" strokeWidth={w} strokeLinecap="round" />
            <path d={`M${b.x0} ${b.y0} Q${p.q1x} ${p.q1y} ${p.bx} ${p.by}`} fill="none" stroke="#9a7044" strokeWidth={w * 0.28} strokeLinecap="round" transform={`translate(${w * 0.22} 0)`} opacity={0.8} />
          </g>
        );
      })}
      {/* листва на верхних ветках */}
      {leafK > 0 &&
        TREE.filter((b) => b.d >= MAXD - 1).map((b, i) => {
          const off = (b.d / MAXD) * sw * 6;
          return (
            <g key={`lf${i}`} transform={`translate(${off} 0)`}>
              {Array.from({ length: 4 }).map((_, j) => {
                const a = rnd(b.sd + j * 7) * 360;
                const kk = Math.max(0, Math.min(1, leafK * 1.6 - rnd(b.sd + j) * 0.6));
                if (kk <= 0) return null;
                const L = (18 + rnd(b.sd + j + 3) * 16) * kk;
                return (
                  <ellipse
                    key={j}
                    cx={b.x1 + Math.cos((a * Math.PI) / 180) * L * 0.6}
                    cy={b.y1 + Math.sin((a * Math.PI) / 180) * L * 0.6}
                    rx={L * 0.62}
                    ry={L * 0.3}
                    transform={`rotate(${a} ${b.x1 + Math.cos((a * Math.PI) / 180) * L * 0.6} ${b.y1 + Math.sin((a * Math.PI) / 180) * L * 0.6})`}
                    fill={LEAF_COL[(i + j) % 4]}
                    opacity={0.92}
                  />
                );
              })}
            </g>
          );
        })}
      {/* плоды */}
      {fruitK > 0 &&
        FRUITS.map((f, i) => {
          const kk = Math.max(0, Math.min(1, fruitK * 1.5 - rnd(i + 70) * 0.5));
          return (
            <g key={`fr${i}`} opacity={kk * (1 - bloomK * 0.6)}>
              <circle cx={f.x} cy={f.y} r={22 * kk} fill="rgba(255,210,120,0.35)" style={{ filter: "blur(6px)" }} />
              <circle cx={f.x} cy={f.y} r={9 * kk} fill="url(#fruitG)" />
            </g>
          );
        })}
      {/* цветение */}
      {bloomK > 0 &&
        BLOSSOM.map((b, i) =>
          [0, 1].map((j) => {
            const kk = Math.max(0, Math.min(1, bloomK * 1.7 - rnd(i * 3 + j) * 0.7));
            if (kk <= 0) return null;
            const x = b.x1 + (rnd(b.sd + j + 20) - 0.5) * 40;
            const y = b.y1 + (rnd(b.sd + j + 21) - 0.5) * 34;
            const r = (9 + rnd(b.sd + j + 22) * 5) * kk;
            const rot = rnd(b.sd + j + 23) * 72 + fr * 0.2;
            return (
              <g key={`bl${i}_${j}`} transform={`translate(${x} ${y}) rotate(${rot})`}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <ellipse key={a} cx={0} cy={-r * 0.62} rx={r * 0.5} ry={r * 0.68} fill="url(#petalG)" transform={`rotate(${a})`} />
                ))}
                <circle r={r * 0.26} fill="#f3cf7d" />
              </g>
            );
          }),
        )}
    </g>
  );
};

/* ------------------------------ Погода и частицы ------------------------------ */

/** Капли (золотые «знания» или дождь). */
export const Rain: React.FC<{ fr: number; at: number; until: number; gold?: boolean; n?: number; x0?: number; w?: number; yTop?: number; yBot?: number; slant?: number }> = ({
  fr, at, until, gold, n = 60, x0 = 0, w = 1080, yTop = -200, yBot = GY, slant = 0,
}) => {
  if (fr < at || fr > until) return null;
  const k = Math.min(prog(fr, at, at + 10), interpolate(fr, [until - 10, until], [1, 0], clamp));
  return (
    <g opacity={k}>
      {Array.from({ length: n }).map((_, i) => {
        const sp = gold ? 18 + rnd(i) * 8 : 34 + rnd(i) * 14;
        const H = yBot - yTop;
        const y = yTop + ((rnd(i + 1) * H + (fr - at) * sp) % H);
        const x = x0 + rnd(i + 2) * w + (y - yTop) * slant;
        return gold ? (
          <g key={i}>
            <circle cx={x} cy={y} r={3.2} fill="#ffe6a8" style={{ filter: "drop-shadow(0 0 6px rgba(255,210,130,0.95))" }} />
            <line x1={x} y1={y - 16} x2={x} y2={y - 3} stroke="rgba(255,226,160,0.5)" strokeWidth={2} />
          </g>
        ) : (
          <line key={i} x1={x} y1={y} x2={x - slant * 26} y2={y - 26} stroke="rgba(200,225,215,0.55)" strokeWidth={1.4} />
        );
      })}
    </g>
  );
};

/** Лепестки, летящие по ветру (цветение). */
export const Petals: React.FC<{ fr: number; at: number; n?: number; k?: number }> = ({ fr, at, n = 70, k = 1 }) => {
  if (fr < at) return null;
  return (
    <g opacity={k}>
      {Array.from({ length: n }).map((_, i) => {
        const life = 120 + rnd(i) * 120;
        const t = (((fr - at) + rnd(i + 1) * life) % life) / life;
        const x = rnd(i + 2) * 1000 + 40 + t * 260 + Math.sin(t * 9 + i) * 30;
        const y = 380 + rnd(i + 3) * 500 + t * 900;
        const rot = t * 720 + i * 40;
        return <ellipse key={i} cx={x} cy={y} rx={7} ry={4} fill={i % 3 ? "#f3b2c1" : "#fbe0e6"} opacity={Math.sin(t * Math.PI) * 0.95} transform={`rotate(${rot} ${x} ${y})`} />;
      })}
    </g>
  );
};

/** Тёплое сияние сверху («согревали терпением»). */
export const Warmth: React.FC<{ fr: number; at: number; until: number }> = ({ fr, at, until }) => {
  if (fr < at || fr > until) return null;
  const k = Math.min(prog(fr, at, at + 14), interpolate(fr, [until - 16, until], [1, 0], clamp));
  return (
    <g opacity={k}>
      <defs>
        <radialGradient id="warmG" cx={SEED.x} cy={SEED.y - 200} r="700" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffd28a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd28a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={-400} y={SEED.y - 900} width={1880} height={1400} fill="url(#warmG)" style={{ mixBlendMode: "screen" }} />
    </g>
  );
};

/** Золотой ветерок («поддерживали добрым словом»). */
export const Breeze: React.FC<{ fr: number; at: number; until: number; y?: number }> = ({ fr, at, until, y = SEED.y - 120 }) => {
  if (fr < at || fr > until) return null;
  const k = Math.min(prog(fr, at, at + 10), interpolate(fr, [until - 10, until], [1, 0], clamp));
  return (
    <g opacity={k}>
      {Array.from({ length: 50 }).map((_, i) => {
        const t = ((((fr - at) / FPS) * (0.4 + rnd(i) * 0.4) + rnd(i + 1)) % 1 + 1) % 1;
        const x = -100 + t * 1300;
        const yy = y + (rnd(i + 2) - 0.5) * 360 + Math.sin(t * 8 + i) * 24;
        return <circle key={i} cx={x} cy={yy} r={1.6 + rnd(i + 3) * 2} fill="#ffe2a6" opacity={Math.sin(t * Math.PI) * 0.9} />;
      })}
    </g>
  );
};
