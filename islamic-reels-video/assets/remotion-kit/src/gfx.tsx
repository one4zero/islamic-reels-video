import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Fog } from "./fx";
import { FPS } from "./timing";
import { C, clamp, easeInOut, prog, rnd, SANS, SERIF } from "./ui";

/* ------------------------------ Фон в цветах бренда ------------------------------ */

/** Изумрудный «киношный» фон: плывущие пятна света, дым, боке, золотые искры сверху. */
export const EmBg: React.FC<{ fr: number; at: number; seed?: number }> = ({ fr, at, seed = 0 }) => {
  const t = (fr - at) / FPS;
  const blobs = [
    { x: 540 + Math.sin(t * 0.33 + seed) * 200, y: 760 + Math.cos(t * 0.25) * 140, r: 640, c: "255,206,130", a: 0.16 },
    { x: 260 + Math.cos(t * 0.29 + 1) * 160, y: 1400 + Math.sin(t * 0.21) * 140, r: 560, c: "40,180,120", a: 0.16 },
    { x: 880 + Math.sin(t * 0.24 + 2) * 140, y: 380 + Math.cos(t * 0.3 + 1) * 110, r: 480, c: "60,190,130", a: 0.12 },
  ];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 40%, #0f4d38 0%, #08301f 50%, #031a11 100%)", overflow: "hidden" }}>
      {blobs.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: b.x - b.r, top: b.y - b.r, width: b.r * 2, height: b.r * 2, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(${b.c},${b.a}), rgba(${b.c},0))`, mixBlendMode: "screen" }} />
      ))}
      <Fog fr={fr} y={1150} h={700} o={0.12} speed={0.45} />
      <Fog fr={fr + 400} y={150} h={560} o={0.06} speed={0.3} />
      <GoldFall fr={fr} seed={seed} />
    </AbsoluteFill>
  );
};

/** Золотые искры, медленно падающие сверху. */
export const GoldFall: React.FC<{ fr: number; n?: number; seed?: number; o?: number; h?: number }> = ({ fr, n = 90, seed = 0, o = 1, h = 1920 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o, pointerEvents: "none", mixBlendMode: "screen" }}>
    {Array.from({ length: n }).map((_, i) => {
      const sp = 0.6 + rnd(i + seed + 1) * 1.6;
      const y = ((rnd(i + seed + 2) * h + fr * sp) % (h + 40)) - 20;
      const x = rnd(i + seed + 3) * 1080 + Math.sin(fr / 50 + i) * 12;
      const r = 0.8 + rnd(i + seed + 4) * 2.4;
      const tw = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(fr / (6 + rnd(i) * 10) + i), 2);
      const near = rnd(i + seed + 5) > 0.85;
      return near ? (
        <circle key={i} cx={x} cy={y} r={r * 3} fill="rgba(255,214,140,0.35)" opacity={tw} style={{ filter: "blur(3px)" }} />
      ) : (
        <circle key={i} cx={x} cy={y} r={r} fill="#ffe1a0" opacity={tw * 0.9} />
      );
    })}
  </svg>
);

/* ------------------------------ Фонарь ------------------------------ */

/** Подвесной золотой фонарь. (x, y) — точка подвеса корпуса; цепь уходит вверх за кадр. */
export const Lantern: React.FC<{ x: number; y: number; s?: number; lit: number; fr: number; id: string }> = ({ x, y, s = 1, lit, fr, id }) => {
  const swing = Math.sin(fr / 38 + x * 0.01) * 2.2;
  const flick = 0.85 + 0.15 * Math.sin(fr / 3 + x) * Math.sin(fr / 7.3 + y);
  return (
    <g transform={`translate(${x} ${y}) rotate(${swing}) scale(${s})`}>
      <defs>
        <linearGradient id={`lg${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7a5524" />
          <stop offset="0.35" stopColor="#f3d38d" />
          <stop offset="0.6" stopColor="#c9963f" />
          <stop offset="1" stopColor="#6e4a1c" />
        </linearGradient>
        <radialGradient id={`lw${id}`} cx="0.5" cy="0.55" r="0.6">
          <stop offset="0" stopColor="#fff6d8" />
          <stop offset="0.5" stopColor="#ffd27a" />
          <stop offset="1" stopColor="#c27a2a" />
        </radialGradient>
      </defs>
      <line x1={0} y1={-2000} x2={0} y2={0} stroke="#b88a3e" strokeWidth={1.6} />
      <circle r={120} cy={90} fill="rgba(255,205,120,0.22)" opacity={lit * flick} style={{ filter: "blur(30px)" }} />
      <circle cx={0} cy={6} r={7} fill="none" stroke={`url(#lg${id})`} strokeWidth={3} />
      <path d="M-24 44 C -22 26 -10 14 0 12 C 10 14 22 26 24 44 Z" fill={`url(#lg${id})`} />
      <rect x={-28} y={42} width={56} height={9} rx={2} fill={`url(#lg${id})`} />
      {/* корпус: три видимые грани с арочными окнами */}
      <path d="M-28 51 L28 51 L24 128 L-24 128 Z" fill="#3a2a14" />
      {[
        [-23, -9],
        [-8, 8],
        [9, 23],
      ].map(([a, b], i) => (
        <path key={i} d={`M${a + 2} 122 L${a + 2} 74 Q${(a + b) / 2} ${58} ${b - 2} 74 L${b - 2} 122 Z`} fill={lit > 0.02 ? `url(#lw${id})` : "#5a4422"} opacity={lit > 0.02 ? 0.35 + 0.65 * lit * flick * (i === 1 ? 1 : 0.8) : 1} />
      ))}
      <path d="M-28 51 L28 51 L24 128 L-24 128 Z" fill="none" stroke={`url(#lg${id})`} strokeWidth={3} />
      <line x1={-9} y1={51} x2={-8} y2={128} stroke={`url(#lg${id})`} strokeWidth={2.4} />
      <line x1={9} y1={51} x2={8} y2={128} stroke={`url(#lg${id})`} strokeWidth={2.4} />
      <rect x={-27} y={126} width={54} height={9} rx={2} fill={`url(#lg${id})`} />
      <path d="M-22 135 C -16 152 -6 160 0 166 C 6 160 16 152 22 135 Z" fill={`url(#lg${id})`} />
      <circle cx={0} cy={172} r={4} fill={`url(#lg${id})`} />
    </g>
  );
};

/* ------------------------------ Иконки (линия) ------------------------------ */

/** Раскрытая книга (мусхаф на подставке) тонкой линией. */
export const BookIcon: React.FC<{ x: number; y: number; s?: number; k?: number; glow?: number }> = ({ x, y, s = 1, k = 1, glow = 0 }) => {
  const L = 900;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} style={glow ? { filter: `drop-shadow(0 0 ${10 * glow}px rgba(255,215,140,${0.9 * glow}))` } : undefined}>
      <g fill="none" stroke={C.gold} strokeWidth={3} strokeLinejoin="round" strokeDasharray={`${L} ${L}`} strokeDashoffset={L * (1 - k)}>
        <path d="M-90 -6 L0 26 L90 -6" />
        <path d="M-90 4 L0 36 L90 4" />
        <path d="M-80 -14 C -50 -30 -20 -26 0 -8 C 20 -26 50 -30 80 -14" />
        <path d="M-56 40 L0 -4 L56 40" />
        <path d="M-40 -46 A 48 48 0 0 1 40 -46" />
      </g>
    </g>
  );
};

export const Icon: React.FC<{ kind: "flame" | "mountain" | "star"; x: number; y: number; k: number }> = ({ kind, x, y, k }) => {
  const L = 500;
  const st = { fill: "none", stroke: C.gold, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const, strokeDasharray: `${L} ${L}`, strokeDashoffset: L * (1 - k) };
  return (
    <g transform={`translate(${x} ${y})`}>
      {kind === "flame" && (
        <>
          <path d="M0 -34 C 18 -14 22 4 14 18 C 8 28 -8 28 -14 18 C -22 4 -14 -8 -6 -14 C -6 -4 0 0 4 -4 C 6 -16 2 -26 0 -34 Z" {...st} />
          <path d="M-20 34 L20 34" {...st} />
        </>
      )}
      {kind === "mountain" && (
        <>
          <path d="M-36 28 L-8 -18 L6 4 L16 -8 L38 28 Z" {...st} />
          <path d="M-8 -18 L-8 -38 L8 -32 L-8 -26" {...st} />
        </>
      )}
      {kind === "star" && <polygon points={Array.from({ length: 16 }).map((_, i) => `${Math.cos((i * Math.PI) / 8 - Math.PI / 2) * (i % 2 ? 22 : 34)},${Math.sin((i * Math.PI) / 8 - Math.PI / 2) * (i % 2 ? 22 : 34)}`).join(" ")} {...st} />}
    </g>
  );
};

/* ------------------------------ Кольцо баллов и маршрут ------------------------------ */

/** Кольцо прогресса: value 0..100, по центру крупная цифра и «/100». */
export const ScoreRing: React.FC<{ fr: number; at: number; until: number; value: number; cx?: number; cy?: number; r?: number; burst?: number }> = ({ fr, at, until, value, cx = 540, cy = 860, r = 200, burst = -1 }) => {
  if (fr < at || fr > until) return null;
  const k = prog(fr, at, at + 16);
  const out = interpolate(fr, [until - 10, until], [1, 0], clamp);
  const circ = 2 * Math.PI * r;
  const b = burst >= 0 ? interpolate(fr, [burst, burst + 30], [0, 1], clamp) : 0;
  return (
    <div data-safe="score ring" style={{ position: "absolute", left: cx - r - 40, top: cy - r - 40, width: (r + 40) * 2, height: (r + 40) * 2, opacity: k * out, transform: `scale(${0.9 + 0.1 * k})` }}>
      <svg width={(r + 40) * 2} height={(r + 40) * 2} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id="ringG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff0c4" />
            <stop offset="0.5" stopColor="#e8c47c" />
            <stop offset="1" stopColor="#b98432" />
          </linearGradient>
        </defs>
        <g transform={`translate(${r + 40} ${r + 40}) rotate(-90)`}>
          <circle r={r} fill="rgba(3,22,15,0.45)" stroke="rgba(232,196,124,0.18)" strokeWidth={14} />
          <circle r={r} fill="none" stroke="url(#ringG)" strokeWidth={14} strokeLinecap="round" strokeDasharray={`${circ} ${circ}`} strokeDashoffset={circ * (1 - value / 100)} style={{ filter: "drop-shadow(0 0 10px rgba(255,210,130,0.8))" }} />
          {Array.from({ length: 50 }).map((_, i) => (
            <line key={i} x1={r - 30} y1={0} x2={r - (i % 5 === 0 ? 44 : 38)} y2={0} stroke="rgba(232,196,124,0.35)" strokeWidth={1.4} transform={`rotate(${i * 7.2})`} />
          ))}
          {b > 0 && b < 1 && <circle r={r + 20 + b * 160} fill="none" stroke="#ffe3a8" strokeWidth={3 * (1 - b)} opacity={1 - b} />}
        </g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: r + 40 - 92, textAlign: "center", fontFamily: SANS, fontWeight: 250, fontSize: 150, lineHeight: 1, color: C.gold, fontVariantNumeric: "tabular-nums", textShadow: "0 0 30px rgba(232,196,124,0.45)" }}>
        {Math.round(value)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: r + 40 + 64, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: "0.3em", color: C.white }}>
        <span style={{ marginRight: "-0.3em" }}>ИЗ 100 БАЛЛОВ</span>
      </div>
    </div>
  );
};

/** Горизонтальный маршрут: отметки А → Б → (Базовый курс), бегущая точка. */
export const Route: React.FC<{ fr: number; at: number; until: number; aAt: number; bAt: number; run: [number, number]; cAt?: number; y?: number }> = ({ fr, at, until, aAt, bAt, run, cAt, y = 1290 }) => {
  if (fr < at || fr > until) return null;
  const k = prog(fr, at, at + 16);
  const out = interpolate(fr, [until - 10, until], [1, 0], clamp);
  const xa = 200;
  const xb = cAt ? 520 : 868;
  const xc = 820;
  const t = interpolate(fr, [run[0], run[1]], [0, 1], { ...clamp, easing: easeInOut });
  const cK = cAt ? prog(fr, cAt, cAt + 20) : 0;
  const dotX = cAt && fr >= cAt ? xb + (xc - xb) * cK : xa + (xb - xa) * t;
  const lineEnd = cAt ? xb + (xc - xb) * cK : xb;
  const mark = (x: number, label: string, sub: string, kk: number, gold: boolean) => (
    <g opacity={kk}>
      <circle cx={x} cy={y} r={9} fill={gold ? C.gold : "#0b3b2c"} stroke={C.gold} strokeWidth={2.5} />
      <text x={x} y={y - 26} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={26} letterSpacing="0.12em" fill={C.white}>
        {label}
      </text>
      <text x={x} y={y + 46} textAnchor="middle" fontFamily={SANS} fontWeight={500} fontSize={21} letterSpacing="0.18em" fill={C.mute}>
        {sub}
      </text>
    </g>
  );
  const pulse = (fr % 40) / 40;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: k * out }}>
      <line x1={xa} y1={y} x2={xb} y2={y} stroke="rgba(232,196,124,0.25)" strokeWidth={3} />
      <line x1={xa} y1={y} x2={xa + (xb - xa) * t} y2={y} stroke={C.gold} strokeWidth={3} style={{ filter: "drop-shadow(0 0 6px rgba(255,210,130,0.8))" }} />
      {cAt && <line x1={xb} y1={y} x2={lineEnd} y2={y} stroke={C.gold} strokeWidth={3} strokeDasharray="8 8" />}
      {mark(xa, "ТОЧКА А", "0 БАЛЛОВ", prog(fr, aAt, aAt + 14), false)}
      {mark(xb, "ТОЧКА Б", "83 БАЛЛА", prog(fr, bAt, bAt + 14), t >= 1)}
      {cAt && mark(xc, "СЕЙЧАС", "БАЗОВЫЙ КУРС", cK, true)}
      <circle cx={dotX} cy={y} r={12} fill="#fff1cf" style={{ filter: "drop-shadow(0 0 10px rgba(255,215,140,1))" }} opacity={prog(fr, aAt, aAt + 10)} />
      {cAt && cK >= 1 && <circle cx={xc} cy={y} r={12 + pulse * 30} fill="none" stroke={C.gold} strokeWidth={2} opacity={1 - pulse} />}
    </svg>
  );
};

/** Три медальона-значка в ряд (старание · трудности · победа). */
export const Badges: React.FC<{ fr: number; items: { at: number; kind: "flame" | "mountain" | "star"; label: string }[]; until: number; y?: number }> = ({ fr, items, until, y = 1240 }) => {
  if (fr < items[0].at - 2 || fr > until) return null;
  const out = interpolate(fr, [until - 10, until], [1, 0], clamp);
  return (
    <div data-safe="badges" style={{ position: "absolute", left: 130, width: 820, top: y - 80, height: 260, opacity: out }}>
      {items.map((it, i) => {
        const k = prog(fr, it.at, it.at + 18);
        const x = 135 + i * 275;
        return (
          <div key={i} style={{ position: "absolute", left: x - 135, width: 270, top: 0, textAlign: "center", opacity: k, transform: `translateY(${(1 - k) * 24}px) scale(${0.85 + 0.15 * k})` }}>
            <svg width={170} height={170} style={{ overflow: "visible" }}>
              <circle cx={85} cy={85} r={70} fill="rgba(3,22,15,0.55)" stroke={C.gold} strokeWidth={2} style={{ filter: "drop-shadow(0 0 12px rgba(255,210,130,0.45))" }} />
              <circle cx={85} cy={85} r={78} fill="none" stroke="rgba(232,196,124,0.35)" strokeWidth={1} strokeDasharray="2 7" />
              <Icon kind={it.kind} x={85} y={85} k={prog(fr, it.at + 4, it.at + 30)} />
            </svg>
            <div style={{ marginTop: 10, fontFamily: SANS, fontWeight: 600, fontSize: 25, letterSpacing: "0.16em", color: C.white }}>
              <span style={{ marginRight: "-0.16em" }}>{it.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------ Крупные надписи ------------------------------ */

/** Именная плашка: маленькая подпись, крупное имя с засечками, строка под ним. */
export const NamePlate: React.FC<{ fr: number; at: number; until: number; y: number; kicker: string; name: string; sub?: string; subAt?: number; size?: number }> = ({ fr, at, until, y, kicker, name, sub, subAt, size = 120 }) => {
  if (fr < at - 2 || fr > until) return null;
  const k = prog(fr, at, at + 22);
  const ks = prog(fr, subAt ?? at + 10, (subAt ?? at + 10) + 18);
  const out = interpolate(fr, [until - 10, until], [1, 0], clamp);
  const sh = interpolate(fr, [at + 8, at + 50], [120, -20], clamp);
  return (
    <div data-safe={`plate ${name}`} style={{ position: "absolute", left: 130, width: 820, top: y, textAlign: "center", opacity: out }}>
      <div style={{ opacity: k, fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: "0.34em", color: C.mute, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <span style={{ width: 70 * k, height: 1.5, background: `linear-gradient(90deg, rgba(232,196,124,0), ${C.line})` }} />
        <span style={{ marginRight: "-0.34em" }}>{kicker}</span>
        <span style={{ width: 70 * k, height: 1.5, background: `linear-gradient(90deg, ${C.line}, rgba(232,196,124,0))` }} />
      </div>
      <div
        style={{
          marginTop: 8,
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: size,
          lineHeight: 1.15,
          opacity: k,
          transform: `translateY(${(1 - k) * 20}px)`,
          filter: `blur(${(1 - k) * 8}px) drop-shadow(0 0 22px rgba(232,196,124,0.35))`,
        }}
      >
        <span style={{ backgroundImage: `linear-gradient(100deg, #d9b56c 0%, #f3dcaa ${sh - 12}%, #fffaf0 ${sh}%, #f3dcaa ${sh + 12}%, #d9b56c 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", padding: "0.1em 0.05em" }}>{name}</span>
      </div>
      {sub && (
        <div style={{ marginTop: 6, opacity: ks, transform: `translateY(${(1 - ks) * 12}px)`, fontFamily: SANS, fontWeight: 500, fontSize: 40, letterSpacing: "0.22em", color: C.white }}>
          <span style={{ marginRight: "-0.22em" }}>{sub}</span>
        </div>
      )}
    </div>
  );
};

/** Крупная фраза с засечками: слова проявляются по таймингам. */
export const Statement: React.FC<{ fr: number; at: number; until: number; y: number; lines: { text: string; at: number; gold?: boolean }[]; size?: number }> = ({ fr, at, until, y, lines, size = 92 }) => {
  if (fr < at - 2 || fr > until) return null;
  const out = interpolate(fr, [until - 12, until], [1, 0], clamp);
  return (
    <div data-safe="statement" style={{ position: "absolute", left: 130, width: 820, top: y, textAlign: "center", opacity: out }}>
      {lines.map((l, i) => {
        const k = prog(fr, l.at, l.at + 18);
        return (
          <div key={i} style={{ fontFamily: SERIF, fontWeight: 600, fontSize: size, lineHeight: 1.18, color: l.gold ? C.gold : C.white, opacity: k, transform: `translateY(${(1 - k) * 22}px)`, filter: `blur(${(1 - k) * 8}px)`, textShadow: l.gold ? "0 0 26px rgba(232,196,124,0.45), 0 2px 12px rgba(0,0,0,0.5)" : "0 2px 14px rgba(0,0,0,0.55)" }}>
            {l.text}
          </div>
        );
      })}
    </div>
  );
};

/** Буквы арабского алфавита, кружащие беспорядочно («новый мир»). */
const ALPHA = "ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي".split(" ");
export const LetterSwarm: React.FC<{ fr: number; at: number; until: number; cx: number; cy: number; o?: number }> = ({ fr, at, until, cx, cy, o = 1 }) => {
  if (fr < at || fr > until) return null;
  const k = Math.min(prog(fr, at, at + 24), interpolate(fr, [until - 14, until], [1, 0], clamp));
  const t = (fr - at) / FPS;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: k * o, pointerEvents: "none" }}>
      {ALPHA.map((ch, i) => {
        const R = 180 + rnd(i + 5) * 300;
        const sp = (0.15 + rnd(i + 6) * 0.35) * (i % 2 ? 1 : -1);
        const a = rnd(i + 7) * Math.PI * 2 + t * sp;
        const x = cx + Math.cos(a) * R;
        const y = cy + Math.sin(a) * R * 0.55 - 120;
        const depth = 0.5 + 0.5 * Math.sin(a);
        const size = 34 + rnd(i + 8) * 40 + depth * 22;
        return (
          <div key={i} style={{ position: "absolute", left: x - 40, top: y - 40, width: 80, textAlign: "center", fontFamily: "Amiri", fontWeight: 700, fontSize: size, color: depth > 0.6 ? "#f3dcaa" : "rgba(232,196,124,0.55)", filter: `blur(${(1 - depth) * 2.5}px)`, textShadow: "0 0 14px rgba(232,196,124,0.5)", transform: `rotate(${Math.sin(t + i) * 12}deg)` }}>
            {ch}
          </div>
        );
      })}
    </div>
  );
};
