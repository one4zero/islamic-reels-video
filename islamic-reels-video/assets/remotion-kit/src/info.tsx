import React from "react";
import { interpolate } from "remotion";
import { FPS } from "./timing";
import { C, CamKey, camAt, clamp, easeInOut, prog, rnd, SANS } from "./ui";

/** Точка из координат кадра-картинки → экран (с учётом камеры). */
export const toScreen = (fr: number, cam: CamKey[], x: number, y: number) => {
  const { z, cx, cy } = camAt(fr, cam);
  return { x: 540 + (x - cx) * z, y: 960 + (y - cy) * z, z };
};

/* ------------------------------ Цифры ------------------------------ */

export type Ch = { c: string; o?: number; glow?: number };

const group = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

/** Табло с заменой цифр: случайные цифры, которые «защёлкиваются» слева направо. */
export const scramble = (final: string, fr: number, lockStart: number, lockEnd: number): Ch[] => {
  const nd = final.replace(/\D/g, "").length;
  let di = 0;
  return Array.from(final).map((c, i) => {
    if (!/\d/.test(c)) return { c };
    const lockAt = lockStart + ((lockEnd - lockStart) * di) / Math.max(1, nd - 1);
    di++;
    if (fr < lockAt) return { c: String(Math.floor(rnd(Math.floor(fr / 2) * 31 + i * 7) * 10)), o: 0.5 };
    return { c, o: 1, glow: 1 - prog(fr, lockAt, lockAt + 14) };
  });
};

/** Число с ведущими нулями (приглушёнными), сгруппированное по три. */
export const padded = (v: number, nd: number): Ch[] => {
  const raw = Math.max(0, Math.round(v)).toString().padStart(nd, "0");
  const firstSig = raw.search(/[1-9]/);
  const g = group(raw);
  let di = 0;
  return Array.from(g).map((c) => {
    if (c === " ") return { c };
    const lead = firstSig < 0 ? di < nd - 1 : di < firstSig;
    di++;
    return { c, o: lead ? 0.16 : 1 };
  });
};

export const plain = (v: number): Ch[] => Array.from(group(Math.max(0, Math.round(v)).toString())).map((c) => ({ c }));

export const Digits: React.FC<{ chars: Ch[]; size: number; weight?: number; color?: string; glowColor?: string }> = ({ chars, size, weight = 250, color = C.gold, glowColor = "230,190,110" }) => (
  <div data-safe="digits" style={{ display: "flex", justifyContent: "center", fontFamily: SANS, fontWeight: weight, fontSize: size, lineHeight: 1, color, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
    {chars.map((ch, i) => (
      <span
        key={i}
        style={{
          display: "inline-block",
          width: ch.c === " " ? "0.26em" : "0.66em",
          textAlign: "center",
          opacity: ch.o ?? 1,
          textShadow: `0 0 ${24 + (ch.glow ?? 0) * 30}px rgba(${glowColor},${0.3 + (ch.glow ?? 0) * 0.6}), 0 2px 12px rgba(0,0,0,0.6)`,
          color: ch.glow ? `color-mix(in srgb, #fff ${Math.round((ch.glow ?? 0) * 70)}%, ${color})` : undefined,
        }}
      >
        {ch.c}
      </span>
    ))}
  </div>
);

/* ------------------------------ 100 человек ------------------------------ */

const Person: React.FC<{ x: number; y: number; c: number; fill: string }> = ({ x, y, c, fill }) => {
  const w = c * 0.26;
  const t = c * 0.04;
  const b = c * 0.36;
  const r = c * 0.15;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={0} cy={-c * 0.19} r={c * 0.15} fill={fill} />
      <path d={`M${-w} ${b} L${-w} ${t + r} Q${-w} ${t} ${-w + r} ${t} L${w - r} ${t} Q${w} ${t} ${w} ${t + r} L${w} ${b} Z`} fill={fill} />
    </g>
  );
};

/** Сетка 10×10: «если бы все люди в истории были сотней человек». */
export const PeopleGrid: React.FC<{ fr: number; at: number; litAt: number; until: number; x: number; y: number; cell: number; lit: number[] }> = ({ fr, at, litAt, until, x, y, cell, lit }) => {
  if (fr < at || fr > until) return null;
  const out = interpolate(fr, [until - 10, until], [1, 0], clamp);
  const L = prog(fr, litAt, litAt + 16);
  const scanY = y + interpolate(fr, [litAt - 4, litAt + 14], [-20, cell * 10 + 20], clamp);
  const scanO = fr > litAt - 4 && fr < litAt + 16 ? 1 : 0;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: out }}>
      <defs>
        <filter id="pglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      {Array.from({ length: 100 }).map((_, i) => {
        const r = Math.floor(i / 10);
        const c = i % 10;
        // каждый человечек взлетает с поверхности Земли по дуге и встаёт в свою клетку
        const a0 = at + rnd(i + 9) * 24;
        const k = interpolate(fr, [a0, a0 + 22], [0, 1], { ...clamp, easing: easeInOut });
        const isLit = lit.includes(i);
        const tx = x + c * cell + cell / 2;
        const ty = y + r * cell + cell / 2;
        const sx = 130 + rnd(i + 21) * 820;
        const sy = 1230 + rnd(i + 33) * 220;
        const qx = (sx + tx) / 2 + (rnd(i + 44) - 0.5) * 200;
        const qy = Math.min(sy, ty) - 120;
        const px = (1 - k) * (1 - k) * sx + 2 * (1 - k) * k * qx + k * k * tx;
        const py = (1 - k) * (1 - k) * sy + 2 * (1 - k) * k * qy + k * k * ty;
        const dim = isLit ? 0.45 : 0.45 - 0.17 * L;
        if (k <= 0) return null;
        return (
          <g key={i}>
            {k < 1 && <circle cx={px} cy={py} r={4} fill="#ffe3a8" opacity={Math.sin(k * Math.PI)} filter="url(#pglow)" />}
            <g opacity={Math.min(1, k * 1.6)} transform={`translate(${px - tx} ${py - ty}) `}>
              <Person x={tx} y={ty} c={cell * (0.5 + 0.5 * k)} fill={`rgba(175,195,225,${dim})`} />
              {isLit && (
                <g opacity={L}>
                  <g filter="url(#pglow)">
                    <Person x={tx} y={ty} c={cell} fill="rgba(240,195,110,0.9)" />
                  </g>
                  <Person x={tx} y={ty} c={cell} fill="#f2d08e" />
                </g>
              )}
            </g>
          </g>
        );
      })}
      <g opacity={scanO}>
        <rect x={x - 30} y={scanY - 30} width={cell * 10 + 60} height={60} fill="rgba(255,210,140,0.12)" />
        <line x1={x - 30} y1={scanY} x2={x + cell * 10 + 30} y2={scanY} stroke="#ffe0a8" strokeWidth={2} />
      </g>
    </svg>
  );
};

/* ------------------------------ Имена ------------------------------ */

const NAMES = [
  "АЙША", "ИВАН", "МАРИЯ", "АХМАД", "ЛИ ВЭЙ", "ФАТИМА", "ДЖОН", "ЗЕЙНАБ", "ОМАР", "АННА", "ЮСУФ", "САРА", "ХАСАН", "ЕЛЕНА", "БИЛАЛ",
  "АМИНА", "ПЕДРО", "ХАДИДЖА", "КЕНДЗИ", "МУСА", "ОЛЬГА", "ИБРАХИМ", "ЛЕЙЛА", "ДАВИД", "МАРЬЯМ", "РАДЖ", "САФИЯ", "ТОМАС", "ХАЛИД", "НУР",
];

const fmtDur = (sec: number) => {
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const ss = Math.floor(sec % 60);
  const hms = [h, m, ss].map((v) => String(v).padStart(2, "0")).join(":");
  return `${d > 0 ? `${group(String(d))} ДН  ` : ""}${hms}`;
};

/**
 * Перекличка: имя в секунду (t0…tFast), потом «без сна, без остановки» — счёт уходит в дни.
 * pos — сколько имён названо (визуальная лента ограничена по скорости, счётчики — нет).
 */
export const NameTicker: React.FC<{ fr: number; at: number; t0: number; tFast: number; until: number; y: number }> = ({ fr, at, t0, tFast, until, y }) => {
  if (fr < at || fr > until) return null;
  const t = fr / FPS;
  const a0 = t0 / FPS;
  const af = tFast / FPS;
  let count: number;
  let vis: number;
  if (t < af) {
    const el = Math.max(0, t - a0);
    const k = Math.floor(el);
    const frac = Math.min(1, (el - k) / 0.28);
    const e = 1 - Math.pow(1 - frac, 3);
    vis = t < a0 ? 0 : k + e;
    count = t < a0 ? 0 : k + 1;
  } else {
    const base = Math.floor(af - a0) + 1;
    const dt = t - af;
    count = base + (Math.exp(dt * 7.4) - 1) * 2.2;
    vis = base + dt * dt * 22 + dt * 4;
  }
  const speed = t < af ? 0 : Math.min(1, (t - af) / 1.2);
  const k = prog(fr, at, at + 16);
  const out = interpolate(fr, [until - 10, until], [1, 0], clamp);
  const rows = [-3, -2, -1, 0, 1, 2, 3];
  const base = Math.floor(vis);
  const frac = vis - base;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, height: 600, opacity: k * out }}>
      {/* циферблат: тик в секунду, на разгоне — вращение со шлейфом */}
      <svg width={1080} height={600} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {(() => {
          const R = 290;
          const cx = 540;
          const cy = 300;
          const ang = (vis * 6 - 90) * (Math.PI / 180);
          const ticks = Array.from({ length: 60 }).map((_, i) => {
            const a = (i * 6 - 90) * (Math.PI / 180);
            const long = i % 5 === 0;
            const passed = i <= Math.floor(vis) % 60 && t < af && t >= a0;
            const kk = prog(fr, at + i * 0.4, at + i * 0.4 + 10);
            return (
              <line
                key={i}
                x1={cx + Math.cos(a) * (R - (long ? 18 : 9))}
                y1={cy + Math.sin(a) * (R - (long ? 18 : 9))}
                x2={cx + Math.cos(a) * R}
                y2={cy + Math.sin(a) * R}
                stroke={passed ? C.gold : "rgba(200,212,235,0.45)"}
                strokeWidth={long ? 2 : 1.2}
                opacity={kk}
              />
            );
          });
          const trail = Array.from({ length: 14 }).map((_, i) => {
            const a = ang - (i * speed * 0.16);
            return <circle key={i} cx={cx + Math.cos(a) * (R + 16)} cy={cy + Math.sin(a) * (R + 16)} r={5 - i * 0.3} fill="#ffe3a8" opacity={(1 - i / 14) * speed * 0.8} />;
          });
          return (
            <>
              <circle cx={cx} cy={cy} r={R + 16} fill="none" stroke="rgba(230,194,122,0.35)" strokeWidth={1} />
              <circle cx={cx} cy={cy} r={R - 34} fill="none" stroke="rgba(200,212,235,0.12)" strokeWidth={1} strokeDasharray="2 8" />
              {ticks}
              {trail}
              <circle cx={cx + Math.cos(ang) * (R + 16)} cy={cy + Math.sin(ang) * (R + 16)} r={7} fill={C.gold} style={{ filter: "drop-shadow(0 0 8px rgba(255,210,140,0.9))" }} />
            </>
          );
        })()}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 30%, #000 70%, transparent 100%)",
          maskImage: "linear-gradient(180deg, transparent 0%, #000 30%, #000 70%, transparent 100%)",
          filter: speed > 0.05 ? `blur(${speed * 5}px)` : undefined,
        }}
      >
        {rows.map((r) => {
          const idx = base + r;
          const dy = (r - frac) * 92;
          const d = Math.abs(r - frac);
          const name = NAMES[((idx % NAMES.length) + NAMES.length) % NAMES.length];
          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 300 + dy - 40,
                textAlign: "center",
                fontFamily: SANS,
                fontWeight: d < 0.5 ? 400 : 300,
                fontSize: 68 - Math.min(d, 3) * 9,
                letterSpacing: "0.22em",
                color: d < 0.5 ? C.white : C.mute,
                opacity: Math.max(0, 1 - d * 0.33),
                textShadow: d < 0.5 ? "0 0 24px rgba(200,220,255,0.35)" : undefined,
              }}
            >
              <span style={{ marginRight: "-0.22em" }}>{name}</span>
            </div>
          );
        })}
      </div>
      {/* рамка текущего имени */}
      <div style={{ position: "absolute", left: 230, right: 230, top: 300 - 52, height: 104, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, opacity: 0.7 }} />
      <div data-safe="names stats" style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", gap: 90, fontFamily: SANS, textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: "0.3em", color: C.mute }}>НАЗВАНО ИМЁН</div>
          <div style={{ marginTop: 10, fontSize: 46, fontWeight: 300, color: C.gold, fontVariantNumeric: "tabular-nums" }}>{group(String(Math.floor(count)))}</div>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: "0.3em", color: C.mute }}>ПРОШЛО</div>
          <div style={{ marginTop: 10, fontSize: 46, fontWeight: 300, color: C.gold, fontVariantNumeric: "tabular-nums", whiteSpace: "pre" }}>{fmtDur(count)}</div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------ Прицел ------------------------------ */

export const Reticle: React.FC<{ fr: number; at: number; until: number; x: number; y: number; r?: number; label?: string; side?: 1 | -1 }> = ({ fr, at, until, x, y, r = 34, label, side = 1 }) => {
  if (fr < at || fr > until) return null;
  const k = prog(fr, at, at + 16);
  const out = interpolate(fr, [until - 8, until], [1, 0], clamp);
  const s = 2.4 - 1.4 * k;
  const lk = prog(fr, at + 12, at + 26);
  const lx = x + side * (r + 40);
  const ly = y - r - 110;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: out, overflow: "visible" }}>
      <g transform={`translate(${x} ${y}) rotate(${(1 - k) * 45}) scale(${s})`} opacity={k}>
        <circle r={r} fill="none" stroke={C.gold} strokeWidth={2.2 / s} />
        <circle r={r * 1.5} fill="none" stroke="rgba(230,194,122,0.35)" strokeWidth={1 / s} strokeDasharray={`${4 / s} ${6 / s}`} />
        {[0, 90, 180, 270].map((a) => (
          <line key={a} x1={r * 0.62} y1={0} x2={r * 1.25} y2={0} stroke={C.gold} strokeWidth={2.2 / s} transform={`rotate(${a})`} />
        ))}
        <circle r={2.5 / s} fill={C.gold} />
      </g>
      {label && (
        <g opacity={lk}>
          <polyline points={`${x + side * r * 0.75},${y - r * 0.75} ${lx},${ly} ${lx + side * 330 * lk},${ly}`} fill="none" stroke={C.gold} strokeWidth={1.6} />
          <text data-safe="reticle label" x={lx + side * 4} y={ly - 16} textAnchor={side === 1 ? "start" : "end"} fontFamily={SANS} fontWeight={600} fontSize={27} letterSpacing="0.14em" fill={C.gold} stroke="rgba(4,6,12,0.85)" strokeWidth={5} paintOrder="stroke">
            {label}
          </text>
        </g>
      )}
    </svg>
  );
};

/** Множество маленьких меток: «никто не упущен». */
export const Markers: React.FC<{ fr: number; at: number; until: number; pts: { x: number; y: number }[]; dur?: number }> = ({ fr, at, until, pts, dur = 18 }) => {
  if (fr < at || fr > until) return null;
  const out = interpolate(fr, [until - 8, until], [1, 0], clamp);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: out }}>
      {pts.map((p, i) => {
        const a = at + rnd(i + 70) * dur;
        const k = prog(fr, a, a + 10);
        return (
          <g key={i} opacity={k}>
            <circle cx={p.x} cy={p.y} r={13 + (1 - k) * 16} fill="none" stroke="rgba(230,194,122,0.9)" strokeWidth={1.7} />
            <circle cx={p.x} cy={p.y} r={3} fill={C.gold} />
          </g>
        );
      })}
    </svg>
  );
};

/* ------------------------------ Дела ------------------------------ */

/** Светлые «дела» вокруг человека: появляются одно за другим и мягко парят. */
export const Orbs: React.FC<{ fr: number; at: number; until: number; x: number; y: number; w: number; h: number; n?: number; seed?: number; rgb?: string; step?: number }> = ({
  fr, at, until, x, y, w, h, n = 14, seed = 0, rgb = "255,214,140", step = 2.2,
}) => {
  if (fr < at || fr > until) return null;
  const out = interpolate(fr, [until - 12, until], [1, 0], clamp);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: out, overflow: "visible" }}>
      <defs>
        <radialGradient id={`orb${seed}`}>
          <stop offset="0" stopColor={`rgb(${rgb})`} stopOpacity="1" />
          <stop offset="0.25" stopColor={`rgb(${rgb})`} stopOpacity="0.55" />
          <stop offset="1" stopColor={`rgb(${rgb})`} stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: n }).map((_, i) => {
        const a = at + i * step;
        const k = prog(fr, a, a + 18);
        const px = x + rnd(i + seed) * w + Math.sin(fr / 30 + i * 1.3) * 8;
        const py = y + rnd(i + seed + 40) * h - (fr - a) * 0.25 + Math.cos(fr / 26 + i) * 6;
        const r = 10 + rnd(i + seed + 80) * 26;
        const tw = 0.75 + 0.25 * Math.sin(fr / 9 + i * 2.1);
        return <circle key={i} cx={px} cy={py} r={r * (0.6 + 0.4 * k)} fill={`url(#orb${seed})`} opacity={k * tw} />;
      })}
    </svg>
  );
};

/* ------------------------------ Угли ------------------------------ */

export const Embers: React.FC<{ fr: number; at: number; until: number; n?: number; o?: number }> = ({ fr, at, until, n = 70, o = 1 }) => {
  if (fr < at || fr > until) return null;
  const k = prog(fr, at, at + 12) * interpolate(fr, [until - 8, until], [1, 0], clamp) * o;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: k, mixBlendMode: "screen" }}>
      {Array.from({ length: n }).map((_, i) => {
        const life = 70 + rnd(i + 3) * 80;
        const ph = (fr - at + rnd(i + 5) * life) % life;
        const t = ph / life;
        const x = rnd(i + 7) * 1080 + Math.sin((fr + i * 13) / 14) * 18 + t * (rnd(i + 9) - 0.5) * 120;
        const y = 1500 - t * (700 + rnd(i + 11) * 600);
        const r = 1.2 + rnd(i + 13) * 2.6;
        const fl = 0.6 + 0.4 * Math.sin(fr / 3 + i);
        return <circle key={i} cx={x} cy={y} r={r} fill={`rgba(255,${130 + Math.round(rnd(i) * 80)},60,${(1 - t) * fl})`} />;
      })}
    </svg>
  );
};
