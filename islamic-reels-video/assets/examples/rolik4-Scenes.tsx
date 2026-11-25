import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { Ash, Calligraphy, CineBg, CityNet, FilterDefs, Flare, Flash, Fog, GodRays, Ornament, Orbits, PeopleGalaxy, PerspGrid, ScanBeam, Trails, Trans, transIn, Warp, zoomOut } from "./fx";
import { Digits, Embers, Markers, NameTicker, Orbs, padded, PeopleGrid, plain, Reticle, scramble, toScreen } from "./info";
import { FPS, s, TOTAL, W, WE } from "./timing";
import { Cap, Kicker, Quote } from "./type";
import { C, CamKey, camAt, clamp, Dust, easeInOut, prog, rnd, SAFE, SANS, Scrim, Shot, Twinkle } from "./ui";

/* ------------------------------ Монтаж ------------------------------ */

export const T = {
  galaxy: s(3.25),
  graves: W(2, "И") - 6,
  earth8: W(3, "Сейчас") - 8,
  names: W(4, "А") - 6,
  hourglass: W(5, "На") - 8,
  mushaf: W(6, "А") - 4,
  one: W(7, "Ни") - 6,
  plain: W(8, "Воистину") - 8,
  crowd18: W(9, "Мы") - 8,
  prophet1: W(10, "Пророк") - 6,
  feet: W(10, "люди") - 8,
  aisha: W(11, "Аиша") - 4,
  c117: W(13, "Сто") - 8,
  born: W(13, "И") - 6,
  c117b: W(13, "В") - 6,
  alone: W(15, "Но") - 6,
  family: W(16, "В") - 6,
  prophet2: W(17, "Пророк") - 6,
  talk: WE(17, "с") - 8,
  fire: W(18, "Посмотрит", 2) - 4,
  billions: W(19, "Миллиарды") - 4,
  prophet3: W(20, "И") - 6,
  date: W(20, "Защитите") - 8,
  outro: W(21, "Подписывайся") - 8,
};

const FIN = 16;

/* Камеры (кадр, зум, центр X, центр Y) */
const CAM = {
  earth0: [[0, 1.75, 540, 1200], [30, 1.25, 540, 1090], [T.galaxy + FIN, 1.08, 540, 1010]] as CamKey[],
  graves: [[T.graves, 1.0, 540, 960], [T.earth8 + FIN, 1.1, 540, 1060]] as CamKey[],
  earth8: [[T.earth8, 1.0, 540, 960], [W(3, "Но") - 10, 1.06, 540, 1000], [W(3, "Но") + 24, 1.15, 540, 835], [T.names + FIN, 1.18, 540, 815]] as CamKey[],
  names: [[T.names, 1.35, 600, 720], [T.hourglass + FIN, 1.5, 620, 660]] as CamKey[],
  hourglass: [[T.hourglass, 1.12, 540, 1060], [T.mushaf + FIN, 1.0, 540, 980]] as CamKey[],
  mushaf: [[T.mushaf, 1.0, 540, 980], [T.one + FIN, 1.1, 540, 1080]] as CamKey[],
  one: [[T.one, 1.5, 560, 1290], [T.plain + FIN, 1.7, 580, 1360]] as CamKey[],
  plain: [[T.plain, 1.0, 540, 960], [T.crowd18 + FIN, 1.12, 540, 1150]] as CamKey[],
  crowd18: [[T.crowd18, 1.0, 540, 960], [T.prophet1 + FIN, 1.07, 540, 1010]] as CamKey[],
  feet: [[T.feet, 1.22, 430, 1290], [T.aisha + FIN, 1.1, 520, 1230]] as CamKey[],
  c117: [[T.c117, 1.45, 540, 1250], [T.born + FIN, 1.25, 540, 1150]] as CamKey[],
  born: [[T.born, 1.0, 540, 960], [T.c117b + FIN, 1.1, 640, 820]] as CamKey[],
  c117b: [[T.c117b, 1.25, 540, 1150], [W(14, "Казалось"), 1.0, 540, 960], [T.alone, 1.27, 556, 1236]] as CamKey[],
  alone: [[T.alone, 1.1, 540, 1060], [T.family + FIN, 1.0, 540, 960]] as CamKey[],
  family: [[T.family, 1.06, 540, 906], [T.prophet2 + FIN, 1.1, 540, 880]] as CamKey[],
  talk: [
    [T.talk, 1.2, 540, 1080],
    [W(18, "направо") - 6, 1.22, 540, 1100],
    [W(18, "направо") + 30, 1.26, 660, 1110],
    [W(18, "налево") - 6, 1.27, 660, 1110],
    [W(18, "налево") + 30, 1.28, 420, 1110],
    [T.fire + FIN, 1.3, 440, 1100],
  ] as CamKey[],
  fire: [[T.fire, 1.0, 540, 960], [T.billions + FIN, 1.18, 540, 1000]] as CamKey[],
  billions: [[T.billions, 1.15, 540, 1100], [T.prophet3 + FIN, 1.0, 540, 960]] as CamKey[],
  date: [[T.date, 1.0, 540, 960], [T.outro + FIN, 1.08, 560, 1020]] as CamKey[],
  outro: [[T.outro, 1.15, 540, 1010], [TOTAL, 1.0, 540, 960]] as CamKey[],
};

/* ------------------------------ Персонажи-вырезки ------------------------------ */

/** Одинокий человек (вырезка 484×1503): ставим по ногам, тень у ступней. */
const Figure: React.FC<{ x: number; feet: number; h: number; o?: number }> = ({ x, feet, h, o = 1 }) => {
  const w = (h * 484) / 1503;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: o }}>
      <div style={{ position: "absolute", left: x - w * 1.1, top: feet - h * 0.06, width: w * 2.2, height: h * 0.12, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,0.55), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: x - w * 1.2, top: feet - h * 1.05, width: w * 2.4, height: h * 1.1, background: "radial-gradient(closest-side, rgba(255,214,150,0.18), rgba(255,214,150,0))" }} />
      <Img src={staticFile("art/lone_figure.png")} style={{ position: "absolute", left: x - w / 2, top: feet - h, width: w, height: h }} />
    </div>
  );
};

/**
 * Подпись к фигуре на картинке: точка над головой, вертикальная линия, слово капсом.
 * Если слово выходит за безопасную зону — линия делает «колено» внутрь кадра.
 */
const Tag: React.FC<{ fr: number; at: number; until: number; cam: CamKey[]; x: number; y: number; text: string; up?: number }> = ({ fr, at, until, cam, x, y, text, up = 70 }) => {
  if (fr < at || fr > until) return null;
  const p = toScreen(fr, cam, x, y);
  const k = prog(fr, at, at + 14);
  const out = interpolate(fr, [until - 10, until], [1, 0], clamp);
  const len = up * k;
  const est = text.length * 24 * 0.98 + 10;
  const tx = Math.min(SAFE.right - est / 2, Math.max(SAFE.left + est / 2, p.x));
  const top = p.y - 22 - up;
  const kt = prog(fr, at + 6, at + 18);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: out }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={p.x} cy={p.y - 14} r={3.5} fill={C.gold} opacity={k} />
        <circle cx={p.x} cy={p.y - 14} r={3.5 + (1 - k) * 18} fill="none" stroke={C.gold} strokeWidth={1} opacity={k * 0.8} />
        <line x1={p.x} y1={p.y - 22} x2={p.x} y2={p.y - 22 - len} stroke={C.line} strokeWidth={1.3} />
        {tx !== p.x && <line x1={p.x} y1={top} x2={p.x + (tx - p.x) * kt} y2={top} stroke={C.line} strokeWidth={1.3} opacity={k} />}
      </svg>
      <div
        data-safe={`tag ${text}`}
        style={{
          position: "absolute",
          left: tx - 150,
          width: 300,
          top: top - 38,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 24,
          letterSpacing: "0.26em",
          color: C.white,
          opacity: kt,
          transform: `translateY(${(1 - kt) * 8}px)`,
          textShadow: "0 1px 8px rgba(0,0,0,0.85)",
        }}
      >
        <span style={{ marginRight: "-0.26em" }}>{text}</span>
      </div>
    </div>
  );
};

/**
 * «Бросит брата, мать, отца…»: от человека к каждому родному тянутся светлые нити,
 * и на слове нить рвётся (разрыв растёт от середины, в точке разрыва — искра).
 */
const BONDS: { x: number; y: number; w: string }[] = [
  { x: 334, y: 940, w: "брата" },
  { x: 952, y: 965, w: "мать" },
  { x: 124, y: 960, w: "отца" },
  { x: 700, y: 950, w: "жену" },
  { x: 270, y: 1110, w: "сыновей" },
  { x: 806, y: 1060, w: "сыновей" },
];
const Bonds: React.FC<{ fr: number; until: number }> = ({ fr, until }) => {
  const at = W(16, "человек");
  if (fr < at || fr > until) return null;
  const out = interpolate(fr, [until - 12, until], [1, 0], clamp);
  const ax = 528;
  const ay = 1010;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: out }}>
      {BONDS.map((b, i) => {
        const k = prog(fr, at + i * 3, at + i * 3 + 16);
        const cut = W(16, b.w) + (i === 5 ? 3 : 0);
        const g = interpolate(fr, [cut, cut + 14], [0, 0.5], { ...clamp, easing: easeInOut });
        const fade = interpolate(fr, [cut + 8, cut + 30], [1, 0.25], clamp);
        const mx = ax + (b.x - ax) * 0.5;
        const my = ay + (b.y - ay) * 0.5;
        const p1x = ax + (b.x - ax) * k * (0.5 - g) * 2 * 0.5;
        const p1y = ay + (b.y - ay) * k * (0.5 - g) * 2 * 0.5;
        const sp = fr >= cut && fr < cut + 16 ? 1 - (fr - cut) / 16 : 0;
        const seg2s = 0.5 + g;
        return (
          <g key={i} opacity={fade}>
            <line x1={ax} y1={ay} x2={fr < cut ? ax + (b.x - ax) * k : p1x} y2={fr < cut ? ay + (b.y - ay) * k : p1y} stroke="rgba(255,222,160,0.85)" strokeWidth={1.6} />
            {fr >= cut && <line x1={ax + (b.x - ax) * seg2s} y1={ay + (b.y - ay) * seg2s} x2={b.x} y2={b.y} stroke="rgba(255,222,160,0.85)" strokeWidth={1.6} />}
            <circle cx={b.x} cy={b.y} r={3} fill={C.gold} opacity={k} />
            {sp > 0 && (
              <g opacity={sp}>
                <circle cx={mx} cy={my} r={6 + (1 - sp) * 26} fill="none" stroke="#ffe3a8" strokeWidth={1.5} />
                <circle cx={mx} cy={my} r={5} fill="#fff4dc" style={{ filter: "drop-shadow(0 0 8px rgba(255,210,140,1))" }} />
              </g>
            )}
          </g>
        );
      })}
      <circle cx={ax} cy={ay} r={4} fill={C.gold} opacity={prog(fr, at, at + 10)} />
    </svg>
  );
};

/** Песок, бегущий из горлышка часов. */
const Sand: React.FC<{ fr: number }> = ({ fr }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
    {Array.from({ length: 40 }).map((_, i) => {
      const t = (((fr * 0.06 + rnd(i + 5)) % 1) + 1) % 1;
      const y = 1240 + t * t * 195;
      return <circle key={i} cx={535 + (rnd(i + 8) - 0.5) * 5} cy={y} r={1.3 + rnd(i) * 1.2} fill={`rgba(255,220,150,${0.9 - t * 0.3})`} />;
    })}
    {Array.from({ length: 10 }).map((_, i) => {
      const tw = Math.pow(0.5 + 0.5 * Math.sin(fr / 4 + i * 1.9), 4);
      return <circle key={`s${i}`} cx={510 + rnd(i + 40) * 50} cy={1432 + rnd(i + 41) * 14} r={1.6} fill="#fff4d6" opacity={tw} />;
    })}
  </svg>
);

/** Сужающийся «прожектор» вокруг человека (одиночество). */
const Spot: React.FC<{ fr: number; a: number; b: number; c: number; x: number; y: number }> = ({ fr, a, b, c, x, y }) => {
  const R = interpolate(fr, [a, b, c, c + 30], [1000, 520, 520, 900], { ...clamp, easing: easeInOut });
  return <AbsoluteFill style={{ background: `radial-gradient(circle at ${x}px ${y}px, rgba(0,0,0,0) ${R * 0.55}px, rgba(2,3,8,0.72) ${R}px)`, pointerEvents: "none" }} />;
};

/**
 * Толпа рассыпается в пыль: фронт идёт сверху вниз (сначала небо, потом толпа от горизонта к зрителю),
 * на фронте — зернистый край и золотая полоса, с края срываются частицы. Под ней проявляется одинокий человек.
 */
const CrowdDissolve: React.FC<{ fr: number; cam: { z: number; cx: number; cy: number } }> = ({ fr, cam }) => {
  const d = interpolate(fr, [T.alone, T.alone + 44], [0, 1], { ...clamp, easing: easeInOut });
  const f = -12 + d * 124;
  const tr = `translate(${540 - cam.cx * cam.z}px, ${960 - cam.cy * cam.z}px) scale(${cam.z})`;
  const img = (mask: string, filter: string) => (
    <AbsoluteFill style={{ transformOrigin: "0 0", transform: tr }}>
      <Img src={staticFile("art/plain_crowd.jpg")} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, filter, WebkitMaskImage: mask, maskImage: mask }} />
    </AbsoluteFill>
  );
  const fy = (f / 100) * 1920;
  return (
    <>
      {img(`linear-gradient(180deg, transparent ${f + 7}%, #000 ${f + 11}%)`, "blur(2px) brightness(0.78)")}
      {img(`linear-gradient(180deg, transparent ${f - 7}%, #000 ${f - 1}%, #000 ${f + 9}%, transparent ${f + 13}%)`, "url(#dis) blur(1px) brightness(0.85)")}
      <div style={{ position: "absolute", left: 0, right: 0, top: fy - 45, height: 90, background: "linear-gradient(180deg, rgba(255,214,150,0), rgba(255,214,150,0.16) 50%, rgba(255,214,150,0))", mixBlendMode: "screen", opacity: Math.sin(d * Math.PI) }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
        {Array.from({ length: 260 }).map((_, i) => {
          const born = T.alone + rnd(i + 500) * 42;
          const age = (fr - born) / FPS;
          if (age < 0 || age > 1.6) return null;
          const bd = interpolate(born, [T.alone, T.alone + 44], [0, 1], { ...clamp, easing: easeInOut });
          const by = ((-12 + bd * 124) / 100) * 1920 + (rnd(i + 501) - 0.5) * 60;
          const x = rnd(i + 502) * 1080 + age * (40 + rnd(i + 503) * 140);
          const y = by - age * (80 + rnd(i + 504) * 160);
          return <circle key={i} cx={x} cy={y} r={0.8 + rnd(i + 505) * 2.2} fill={`rgba(255,226,180,${Math.max(0, 0.9 - age * 0.6)})`} />;
        })}
      </svg>
    </>
  );
};

/* ------------------------------ Счётчик «117 000 000 000» ------------------------------ */

const BigCounter: React.FC<{ fr: number }> = ({ fr }) => {
  const end = W(3, "Но") + 2;
  if (fr > end) return null;
  const lock0 = W(1, "ста");
  const lock1 = W(1, "миллиардов") + 4;
  const dead = W(2, "умерли");
  const roll0 = W(3, "восьми") - 4;
  const roll1 = roll0 + 34;
  const grey = prog(fr, dead, dead + 24) * (1 - prog(fr, roll0, roll1));
  let chars;
  if (fr < roll0) {
    chars = scramble("117 000 000 000", fr, lock0, lock1);
  } else {
    const t = interpolate(fr, [roll0, roll1], [0, 1], { ...clamp, easing: easeInOut });
    chars = padded(117e9 + (8e9 - 117e9) * t, 12);
  }
  const color = `color-mix(in srgb, #9aa6b8 ${Math.round(grey * 100)}%, ${C.gold})`;
  const o = prog(fr, 0, 8) * interpolate(fr, [end - 10, end], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 330, opacity: o }}>
      <Digits chars={chars} size={92} color={color} glowColor={grey > 0.5 ? "150,170,200" : "230,190,110"} />
    </div>
  );
};

/* ------------------------------ Графические заставки ------------------------------ */

/** Фон заставки «Пророк ﷺ сказал»: только орнамент, свет и пыль — без изображений людей. */
const ProphetBg: React.FC<{ fr: number; at: number }> = ({ fr, at }) => (
  <AbsoluteFill style={{ background: "radial-gradient(80% 55% at 50% 44%, #16203a 0%, #080c18 58%, #04060b 100%)" }}>
    <div style={{ position: "absolute", left: 540 - 420, top: 860 - 420, width: 840, height: 840, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,205,130,0.20), rgba(255,205,130,0))", opacity: 0.8 + 0.2 * Math.sin((fr - at) / 16) }} />
    <Ornament fr={fr} at={at} cy={860} rosette={320} />
    <Dust fr={fr} n={50} area={[120, 400, 840, 1000]} seed={at} rise={10} />
  </AbsoluteFill>
);

/** Фон сцены с вопросом Аиши: тихий орнамент, дым, без изображений. */
const AishaBg: React.FC<{ fr: number; at: number }> = ({ fr, at }) => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, #070a14 0%, #0e1426 45%, #0a0d18 100%)" }}>
    <Ornament fr={fr} at={at - 30} cy={960} rosette={420} o={0.32} tile={170} />
    <Fog fr={fr} y={1150} h={620} o={0.14} speed={0.5} />
    <Fog fr={fr + 400} y={150} h={500} o={0.08} speed={0.35} />
    <Dust fr={fr} n={40} area={[60, 200, 960, 1500]} seed={77} rise={8} />
  </AbsoluteFill>
);

/* ------------------------------ Сцены ------------------------------ */

type ShotDef = {
  key: string;
  from: number;
  src?: string;
  cam?: CamKey[];
  bg?: React.ReactNode;
  filter?: string | ((fr: number) => string);
  fin?: number;
  trans?: Trans;
  ix?: number;
  iy?: number;
  shakeAt?: number;
  children?: React.ReactNode;
  over?: React.ReactNode;
};

export const AllScenes: React.FC<{ fr: number }> = ({ fr }) => {
  const c117End = camAt(T.alone, CAM.c117b);
  const shots: ShotDef[] = [
    {
      key: "earth0",
      from: 0,
      src: "art/earth_night.jpg",
      cam: CAM.earth0,
      fin: 0,
      trans: "cut",
      children: (
        <>
          <Orbits fr={fr} at={2} />
          <CityNet fr={fr} at={8} />
        </>
      ),
      over: (
        <>
          <Twinkle fr={fr} h={760} />
          {fr < 30 && <AbsoluteFill style={{ backgroundColor: "#03050a", opacity: 1 - prog(fr, 2, 26) }} />}
          <Warp fr={fr} until={34} cy={900} />
        </>
      ),
    },
    {
      key: "galaxy",
      from: T.galaxy,
      bg: <CineBg fr={fr} at={T.galaxy} />,
      trans: "zoom",
    },
    {
      key: "graves",
      from: T.graves,
      src: "art/graves_night.jpg",
      cam: CAM.graves,
      trans: "iris",
      fin: 18,
      ix: 540,
      iy: 1080,
      filter: "brightness(0.92)",
      children: <Flare fr={fr} x={806} y={1196} w={700} o={0.55} />,
      over: (
        <>
          <Fog fr={fr} y={1080} h={460} o={0.32} speed={0.4} />
          <Twinkle fr={fr} h={900} seed={80} />
          <Scrim top={0.35} topTo={800} />
          <Ash fr={fr} at={W(2, "умерли")} dur={50} area={[150, 330, 780, 100]} n={110} />
        </>
      ),
    },
    {
      key: "earth8",
      from: T.earth8,
      src: "art/earth_night.jpg",
      cam: CAM.earth8,
      trans: "wipe",
      children: (
        <>
          <Orbits fr={fr} at={T.earth8 + 4} />
          <CityNet fr={fr} at={T.earth8 + 10} />
        </>
      ),
      over: (
        <>
          <Twinkle fr={fr} h={900} seed={120} />
          <Scrim bottom={0.7} bottomFrom={1080} o={prog(fr, W(3, "Но") - 6, W(3, "Но") + 10)} />
        </>
      ),
    },
    {
      key: "names",
      from: T.names,
      src: "art/plain_night.jpg",
      cam: CAM.names,
      trans: "zoom",
      fin: 14,
      filter: "brightness(0.55) saturate(0.85)",
      over: <Twinkle fr={fr} n={50} h={1900} seed={200} />,
    },
    {
      key: "hourglass",
      from: T.hourglass,
      src: "art/hourglass_space.jpg",
      cam: CAM.hourglass,
      trans: "iris",
      fin: 18,
      ix: 540,
      iy: 860,
      children: (
        <>
          <GodRays id="hg" fr={fr} x={535} y={1235} dir={-90} spread={160} len={900} n={14} o={0.35} />
          <Sand fr={fr} />
        </>
      ),
      over: (
        <>
          <Dust fr={fr} n={30} area={[300, 700, 480, 900]} seed={7} rise={8} />
          <Scrim top={0.5} topTo={720} />
        </>
      ),
    },
    {
      key: "mushaf",
      from: T.mushaf,
      src: "art/mushaf_light.jpg",
      cam: CAM.mushaf,
      trans: "sweep",
      fin: 18,
      children: <GodRays id="mus" fr={fr} x={880} y={-60} dir={108} spread={16} len={1700} n={12} o={0.6} />,
      over: (
        <>
          <Dust fr={fr} n={70} area={[380, 0, 600, 1300]} seed={11} rise={10} />
          <Scrim top={0.55} topTo={900} />
        </>
      ),
    },
    {
      key: "one",
      from: T.one,
      src: "art/plain_crowd.jpg",
      cam: CAM.one,
      trans: "wipe",
      children: (
        <>
          <PerspGrid fr={fr} at={T.one + 2} until={T.plain + FIN} vx={549} vy={1100} />
          <ScanBeam fr={fr} at={W(7, "забыт") - 10} dur={34} y0={1100} y1={1940} />
        </>
      ),
      over: <Scrim top={0.5} topTo={700} />,
    },
    {
      key: "plain",
      from: T.plain,
      src: "art/plain_night.jpg",
      cam: CAM.plain,
      trans: "zoom",
      fin: 14,
      children: (
        <>
          <GodRays id="pl" fr={fr} x={561} y={1438} dir={-90} spread={110} len={1200} n={14} o={0.28} />
          <Flare fr={fr} x={561} y={1438} w={1000} o={0.85} />
        </>
      ),
      over: (
        <>
          <Fog fr={fr} y={1330} h={320} o={0.28} speed={0.5} />
          <Twinkle fr={fr} n={40} h={1200} seed={300} />
          <Scrim top={0.4} topTo={1000} />
        </>
      ),
    },
    {
      key: "crowd18",
      from: T.crowd18,
      src: "art/plain_crowd.jpg",
      cam: CAM.crowd18,
      children: (
        <>
          <Flare fr={fr} x={549} y={1100} w={1000} o={0.8} />
          <ScanBeam fr={fr} at={W(9, "соберём")} dur={44} y0={1100} y1={1940} o={0.9} />
        </>
      ),
      over: (
        <>
          <Twinkle fr={fr} n={30} h={1000} seed={360} />
          <Scrim top={0.45} topTo={900} />
        </>
      ),
    },
    {
      key: "prophet1",
      from: T.prophet1,
      bg: <ProphetBg fr={fr} at={T.prophet1} />,
      trans: "iris",
      fin: 18,
      ix: 540,
      iy: 860,
    },
    {
      key: "feet",
      from: T.feet,
      src: "art/bare_feet.jpg",
      cam: CAM.feet,
      trans: "iris",
      fin: 18,
      ix: 540,
      iy: 860,
      over: (
        <>
          <Ash fr={fr} at={T.feet} dur={80} area={[0, 1250, 760, 300]} n={70} rgb="235,205,160" drift={0.6} seed={5} />
          <Dust fr={fr} n={40} area={[0, 900, 1080, 900]} seed={17} rise={6} />
          <Scrim top={0.75} topTo={1000} />
        </>
      ),
    },
    {
      key: "aisha",
      from: T.aisha,
      bg: <AishaBg fr={fr} at={T.aisha} />,
      trans: "wipe",
    },
    {
      key: "c117",
      from: T.c117,
      src: "art/plain_crowd.jpg",
      cam: CAM.c117,
      trans: "zoom",
      fin: 14,
      children: (
        <>
          <PerspGrid fr={fr} at={T.c117 + 6} until={T.born + FIN} vx={549} vy={1100} o={0.32} />
          <Flare fr={fr} x={549} y={1100} w={1000} o={0.8} />
        </>
      ),
      over: (
        <>
          <Twinkle fr={fr} n={30} h={1000} seed={420} />
          <Scrim top={0.5} topTo={900} />
        </>
      ),
    },
    {
      key: "born",
      from: T.born,
      src: "art/generations.jpg",
      cam: CAM.born,
      trans: "sweep",
      fin: 18,
      children: <GodRays id="gen" fr={fr} x={853} y={601} dir={115} spread={150} len={1600} n={20} o={0.6} />,
      over: (
        <>
          <Fog fr={fr} y={880} h={520} o={0.18} />
          <Dust fr={fr} n={50} area={[0, 500, 1080, 1100]} seed={3} />
          <Scrim top={0.72} topTo={1000} />
        </>
      ),
    },
    {
      key: "c117b",
      from: T.c117b,
      src: "art/plain_crowd.jpg",
      cam: CAM.c117b,
      trans: "wipe",
      filter: (f: number) => {
        const d = prog(f, W(14, "легко"), T.alone);
        return `blur(${d * 3}px) brightness(${1 - d * 0.22})`;
      },
      children: (
        <>
          <PerspGrid fr={fr} at={T.c117b + 2} until={W(14, "Казалось") + 6} vx={549} vy={1100} o={0.32} />
          <Flare fr={fr} x={549} y={1100} w={1000} o={0.8} />
        </>
      ),
      over: (
        <>
          <Twinkle fr={fr} n={30} h={1000} seed={420} />
          <Scrim top={0.5} topTo={900} />
        </>
      ),
    },
    {
      key: "alone",
      from: T.alone,
      src: "art/plain_night.jpg",
      cam: CAM.alone,
      fin: 0,
      trans: "cut",
      children: (
        <>
          <Flare fr={fr} x={561} y={1438} w={900} o={0.75} />
          <Figure x={540} feet={1835} h={900} o={prog(fr, T.alone + 6, T.alone + 36)} />
        </>
      ),
      over: (
        <>
          {fr < T.alone + 46 && <CrowdDissolve fr={fr} cam={c117End} />}
          <Fog fr={fr} y={1330} h={320} o={0.22} speed={0.5} />
          <Twinkle fr={fr} n={40} h={1100} seed={500} />
          <Scrim top={0.4} topTo={950} />
        </>
      ),
    },
    {
      key: "family",
      from: T.family,
      src: "art/family_apart.jpg",
      cam: CAM.family,
      trans: "sweep",
      fin: 18,
      children: (
        <>
          <Flare fr={fr} x={540} y={905} w={900} o={0.6} />
          <Bonds fr={fr} until={T.prophet2 + 4} />
        </>
      ),
      over: (
        <>
          <Fog fr={fr} y={760} h={360} o={0.2} speed={0.45} />
          <Twinkle fr={fr} n={40} h={760} seed={560} />
          <Scrim top={0.5} topTo={820} />
        </>
      ),
    },
    {
      key: "prophet2",
      from: T.prophet2,
      bg: <ProphetBg fr={fr} at={T.prophet2} />,
      trans: "iris",
      fin: 18,
      ix: 540,
      iy: 860,
    },
    {
      key: "talk",
      from: T.talk,
      src: "art/plain_night.jpg",
      cam: CAM.talk,
      trans: "iris",
      fin: 18,
      ix: 540,
      iy: 1250,
      filter: "brightness(0.5) saturate(0.8)",
      children: (
        <>
          <Figure x={540} feet={1650} h={640} />
          <Trails fr={fr} at={W(18, "направо") - 2} x={600} y={1300} dir={1} />
          <Trails fr={fr} at={W(18, "налево") - 2} x={480} y={1300} dir={-1} rgb="214,226,255" />
          <Orbs fr={fr} at={W(18, "увидит") - 6} until={T.fire + FIN} x={700} y={1040} w={250} h={420} seed={1} />
          <Orbs fr={fr} at={W(18, "увидит", 1) - 6} until={T.fire + FIN} x={130} y={1040} w={250} h={420} seed={2} rgb="214,226,255" />
        </>
      ),
      over: (
        <>
          <Spot fr={fr} a={WE(17, "с")} b={W(17, "переводчика")} c={W(18, "Человек")} x={540} y={1260} />
          <Fog fr={fr} y={1380} h={300} o={0.16} speed={0.4} />
          <Twinkle fr={fr} n={50} h={1200} seed={620} />
          <Scrim top={0.35} topTo={800} />
        </>
      ),
    },
    {
      key: "fire",
      from: T.fire,
      src: "art/fire_horizon.jpg",
      cam: CAM.fire,
      fin: 8,
      trans: "flash",
      shakeAt: W(18, "огонь"),
      filter: `url(#heat) brightness(${0.85 + 0.15 * Math.sin(fr / 5) * Math.sin(fr / 13)})`,
      over: (
        <>
          <Fog fr={fr} y={900} h={600} o={0.22} speed={1.2} tint="sepia(1) saturate(4) hue-rotate(-20deg)" />
          <Embers fr={fr} at={T.fire} until={T.billions + FIN} n={110} />
          <Flash fr={fr} at={W(18, "огонь")} rgb="255,140,70" peak={0.4} dur={18} />
        </>
      ),
    },
    {
      key: "billions",
      from: T.billions,
      src: "art/plain_crowd.jpg",
      cam: CAM.billions,
      fin: 14,
      filter: (f: number) => {
        const d = prog(f, W(19, "А") - 4, W(19, "А") + 24);
        return `brightness(${0.8 - 0.4 * d}) blur(${d * 6}px) saturate(${1 - 0.3 * d})`;
      },
      children: (
        <>
          <Figure x={540} feet={1840} h={820} o={prog(fr, W(19, "А") + 2, W(19, "А") + 26)} />
          <Orbs fr={fr} at={W(19, "только") - 10} until={T.prophet3 + FIN} x={300} y={1060} w={480} h={400} n={18} seed={5} step={1.6} />
        </>
      ),
      over: (
        <>
          <Fog fr={fr} y={1120} h={480} o={0.18} speed={0.5} />
          <Scrim top={0.45} topTo={850} />
        </>
      ),
    },
    {
      key: "prophet3",
      from: T.prophet3,
      bg: <ProphetBg fr={fr} at={T.prophet3} />,
      trans: "iris",
      fin: 18,
      ix: 540,
      iy: 860,
    },
    {
      key: "date",
      from: T.date,
      src: "art/fire_horizon.jpg",
      cam: CAM.date,
      trans: "iris",
      fin: 18,
      ix: 556,
      iy: 1290,
      filter: "brightness(0.32) blur(5px) saturate(0.9)",
      children: (
        <>
          <Embers fr={fr} at={T.date} until={T.outro + FIN} n={50} o={0.45} />
          <GodRays id="dt" fr={fr} x={600} y={-80} dir={92} spread={26} len={1600} n={12} o={0.38} />
          <div style={{ position: "absolute", left: 556 - 380, top: 1318 - 380, width: 760, height: 760, background: "radial-gradient(closest-side, rgba(255,196,120,0.30), rgba(255,196,120,0))", opacity: 0.85 + 0.15 * Math.sin(fr / 14) }} />
          <Img src={staticFile("art/date_half.png")} style={{ position: "absolute", left: -50, top: 1040, width: 1100, height: (1100 * 940) / 1465, WebkitMaskImage: "linear-gradient(180deg, #000 72%, transparent 97%)", maskImage: "linear-gradient(180deg, #000 72%, transparent 97%)" }} />
        </>
      ),
      over: (
        <>
          <Dust fr={fr} n={30} area={[200, 900, 700, 700]} seed={23} rise={6} />
          <Scrim top={0.4} topTo={900} />
        </>
      ),
    },
    {
      key: "outro",
      from: T.outro,
      src: "art/earth_night.jpg",
      cam: CAM.outro,
      trans: "zoom",
      children: (
        <>
          <Orbits fr={fr} at={T.outro} />
          <CityNet fr={fr} at={T.outro + 6} />
        </>
      ),
      over: <Twinkle fr={fr} h={900} seed={700} />,
    },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <FilterDefs heat={fr - T.fire} dis={0.5} />
      {shots.map((sh, i) => {
        const next = shots[i + 1];
        const to = next ? next.from + (next.fin ?? FIN) : TOTAL;
        if (fr < sh.from || fr >= to) return null;
        const fin = sh.fin ?? FIN;
        const p = fin ? interpolate(fr, [sh.from, sh.from + fin], [0, 1], clamp) : 1;
        const tin = transIn(sh.trans ?? "fade", p, sh.ix, sh.iy);
        const exit = next && next.trans === "zoom" && fr >= next.from ? zoomOut(interpolate(fr, [next.from, next.from + (next.fin ?? FIN)], [0, 1], clamp)) : {};
        const filter = typeof sh.filter === "function" ? sh.filter(fr) : sh.filter;
        let shake = "";
        if (sh.shakeAt !== undefined && fr >= sh.shakeAt) {
          const a = 16 * Math.exp(-(fr - sh.shakeAt) / 6);
          shake = `translate(${Math.sin(fr * 2.1) * a}px, ${Math.cos(fr * 2.7) * a}px)`;
        }
        return (
          <React.Fragment key={sh.key}>
            <AbsoluteFill style={tin.style}>
              <AbsoluteFill style={{ ...exit, transform: [exit.transform, shake].filter(Boolean).join(" ") || undefined }}>
                {sh.bg ?? (
                  <Shot fr={fr} from={sh.from} to={to} src={sh.src!} cam={sh.cam!} fin={0} filter={filter}>
                    {sh.children}
                  </Shot>
                )}
                {sh.over}
              </AbsoluteFill>
            </AbsoluteFill>
            {tin.overlay}
          </React.Fragment>
        );
      })}

      <Overlays fr={fr} />

      {/* затемнение в конце */}
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: interpolate(fr, [TOTAL - 24, TOTAL - 2], [0, 1], clamp) }} />
    </AbsoluteFill>
  );
};

/* ------------------------------ Поиск в толпе («легко затеряться») ------------------------------ */

const Searchers: React.FC<{ fr: number; at: number; until: number }> = ({ fr, at, until }) => {
  if (fr < at || fr > until) return null;
  const k = prog(fr, at, at + 12);
  const out = interpolate(fr, [until - 14, until], [1, 0], clamp);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: k * out }}>
      {[0, 1, 2].map((i) => {
        const t = (fr - at) / FPS;
        const x = 540 + Math.sin(t * (1.3 + i * 0.4) + i * 2) * 320;
        const y = 1250 + Math.sin(t * (1.7 + i * 0.3) + i) * 140 + i * 40;
        const r = 30;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${t * 60 * (i % 2 ? -1 : 1)})`} opacity={0.8}>
            <circle r={r} fill="none" stroke={C.gold} strokeWidth={1.5} strokeDasharray="6 7" />
            {[0, 90, 180, 270].map((a) => (
              <line key={a} x1={r * 0.6} y1={0} x2={r * 1.2} y2={0} stroke={C.gold} strokeWidth={1.5} transform={`rotate(${a})`} />
            ))}
          </g>
        );
      })}
    </svg>
  );
};

/* ------------------------------ Текст и инфографика ------------------------------ */

const Overlays: React.FC<{ fr: number }> = ({ fr }) => {
  const markerPts = Array.from({ length: 40 }).map((_, i) => ({ x: 130 + rnd(i + 900) * 800, y: 1100 + Math.pow(rnd(i + 950), 0.8) * 360 }));
  const years = 3707 * interpolate(fr, [W(5, "трёх") - 6, W(5, "лет") + 2], [0, 1], { ...clamp, easing: easeInOut });
  return (
    <>
      {/* 1. Хук + 117 млрд */}
      <BigCounter fr={fr} />
      <Cap fr={fr} at={0} until={T.galaxy + 6} y={520} text="Сколько людей | родилось на Земле | за всю *историю?*" size={58} />
      <Kicker fr={fr} at={W(1, "оценили")} until={T.earth8 + 4} y={455} text="ОЦЕНКА ДЕМОГРАФОВ · PRB" />
      <Cap fr={fr} at={W(1, "Демографы")} until={T.graves + 4} y={540} text="Демографы оценили: | около *117 миллиардов* | человек" />
      <PeopleGalaxy fr={fr} at={T.galaxy + 4} full={W(1, "миллиардов") + 4} lockAt={W(1, "миллиардов") + 4} until={T.graves + FIN} cx={540} cy={1085} R={285} />
      <Kicker fr={fr} at={W(1, "оценили")} until={T.graves + 4} y={1416} text="1 ТОЧКА = 50 МЛН ЧЕЛОВЕК" color={C.mute} size={20} />
      <Cap fr={fr} at={W(2, "И")} until={T.earth8 + 4} y={540} text="И почти все они | *уже умерли*" size={58} />

      {/* 2. 8 млрд и 7 % */}
      <Kicker fr={fr} at={W(3, "восьми")} until={W(3, "Но") + 2} y={455} text="ЖИВУТ СЕЙЧАС" />
      <Cap fr={fr} at={W(3, "Сейчас")} until={W(3, "Кажется") - 2} y={540} text="Сейчас нас больше | *8 миллиардов*" />
      <Cap fr={fr} at={W(3, "Кажется")} until={W(3, "Но") - 1} y={540} text="Кажется, | огромная цифра" />
      <Kicker fr={fr} at={W(3, "Но")} until={T.names + 4} y={262} text="117 МЛРД = 100 ЧЕЛОВЕК" />
      <PeopleGrid fr={fr} at={W(3, "Но")} litAt={W(3, "семи")} until={T.names + 4} x={250} y={318} cell={58} lit={[90, 91, 92, 93, 94, 95, 96]} />
      {fr >= W(3, "семи") && fr <= T.names + 4 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 922, opacity: prog(fr, W(3, "семи"), W(3, "семи") + 14) * interpolate(fr, [T.names - 6, T.names + 4], [1, 0], clamp) }}>
          <Digits chars={[{ c: "7" }, { c: "%" }]} size={120} weight={250} />
        </div>
      )}
      <Kicker fr={fr} at={W(3, "семи") + 8} until={T.names + 4} y={1056} text="ЖИВЫ СЕЙЧАС" color={C.white} />
      <Cap fr={fr} at={W(3, "Но")} until={W(3, "от") - 2} y={1290} text="Но это всего | около *7%*" />
      <Cap fr={fr} at={W(3, "от")} until={T.names + 4} y={1290} text="от всех, кто | *когда-либо жил*" />

      {/* 3. Имена и 3 700 лет */}
      <Cap fr={fr} at={W(4, "А")} until={W(4, "называть") - 2} y={300} text="А теперь *представь:*" />
      <Cap fr={fr} at={W(4, "называть")} until={W(4, "по", 1) - 2} y={300} text="Называть каждого | *по имени,*" />
      <Cap fr={fr} at={W(4, "по", 1)} until={W(4, "Без") - 2} y={300} text="по одному | в *секунду*" />
      <Cap fr={fr} at={W(4, "Без")} until={T.hourglass + 4} y={300} text="Без сна. | *Без остановки.*" />
      <NameTicker fr={fr} at={T.names + 4} t0={W(4, "называть")} tFast={W(4, "Без")} until={T.hourglass + 6} y={560} />

      {fr >= T.hourglass && fr <= T.mushaf && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 272, opacity: prog(fr, T.hourglass, T.hourglass + 12) * interpolate(fr, [T.mushaf - 8, T.mushaf], [1, 0], clamp) }}>
          <Digits chars={plain(years)} size={120} weight={250} />
          {/* шкала 0 → 3 707 лет */}
          <div style={{ position: "absolute", left: 200, width: 680, top: 232, height: 1, background: "rgba(200,212,235,0.35)" }} />
          <div style={{ position: "absolute", left: 200, width: 680 * (years / 3707), top: 231, height: 3, background: C.gold, boxShadow: "0 0 12px rgba(255,210,140,0.9)" }} />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: 200 + (680 * i * 500) / 3707, top: 226, width: 1, height: 12, background: years >= i * 500 ? C.gold : "rgba(200,212,235,0.45)" }} />
          ))}
        </div>
      )}
      <Kicker fr={fr} at={T.hourglass + 6} until={T.mushaf} y={410} text="ЛЕТ БЕЗ ОСТАНОВКИ" color={C.white} />
      <Kicker fr={fr} at={T.hourglass + 14} until={T.mushaf} y={456} text="117 000 000 000 СЕКУНД" color={C.mute} size={20} lines={false} />
      <Cap fr={fr} at={W(5, "На")} until={T.mushaf} y={560} text="На это уйдёт | больше *3 700 лет*" />

      {/* 4. Он знает их число */}
      <Cap fr={fr} at={W(6, "А")} until={W(6, "кто") - 2} y={330} text="А в Коране сказано | обо *всех,*" />
      <Cap fr={fr} at={W(6, "кто")} until={W(6, "Он") - 4} y={330} text="кто на *небесах* | и на *земле:*" />
      <Quote fr={fr} at={W(6, "Он") - 4} until={T.one + 4} y={300} label="СУРА МАРЬЯМ · 19:94" arabic="لَقَدْ أَحْصَاهُمْ وَعَدَّهُمْ عَدًّا" text="«Он знает их число | и *пересчитал* их»" textAt={W(6, "Он")} size={52} />

      {/* 5. Ни один не потерян */}
      <Cap fr={fr} at={W(7, "Ни")} until={W(7, "Ни", 1) - 2} y={330} text="Ни один | не *потерян.*" size={58} />
      <Cap fr={fr} at={W(7, "Ни", 1)} until={T.plain + 4} y={330} text="Ни один | не *забыт.*" size={58} />
      {(() => {
        const a = toScreen(fr, CAM.one, 653, 1590);
        const b = toScreen(fr, CAM.one, 372, 1662);
        return (
          <>
            <Reticle fr={fr} at={W(7, "потерян") - 4} until={T.plain + 4} x={a.x} y={a.y} r={44} label="1 ИЗ 117 000 000 000" side={-1} />
            <Reticle fr={fr} at={W(7, "забыт") - 4} until={T.plain + 4} x={b.x} y={b.y} r={44} />
            <Markers fr={fr} at={W(7, "забыт") + 4} until={T.plain + 4} pts={markerPts} dur={16} />
          </>
        );
      })()}

      {/* 6. Собраны в известный день */}
      <Quote
        fr={fr}
        at={W(8, "Воистину") - 6}
        until={T.crowd18 + 4}
        y={270}
        label="СУРА АЛЬ-ВАКИА · 56:49–50"
        arabic="إِنَّ الْأَوَّلِينَ وَالْآخِرِينَ ۝ لَمَجْمُوعُونَ إِلَىٰ مِيقَاتِ يَوْمٍ مَّعْلُومٍ"
        arSize={46}
        text="«Воистину, как первые, | так и последние поколения | будут собраны | в определённом месте | в *известный день*»"
        textAt={W(8, "Воистину")}
        size={46}
      />
      <Quote fr={fr} at={W(9, "Мы") - 6} until={T.prophet1 + 4} y={300} label="СУРА АЛЬ-КАХФ · 18:47" arabic="وَحَشَرْنَاهُمْ فَلَمْ نُغَادِرْ مِنْهُمْ أَحَدًا" text="«Мы соберём их всех | и *никого не упустим*»" textAt={W(9, "Мы")} size={52} />

      {/* 7. Пророк ﷺ сказал — графическая заставка; затем «босыми»; вопрос Аиши */}
      <Cap fr={fr} at={W(10, "Пророк")} until={T.feet + 4} y={300} text="Пророк ﷺ сказал:" />
      <Calligraphy fr={fr} at={T.prophet1 + 6} until={T.feet + 6} y={770} text="قَالَ النَّبِيُّ ﷺ" />
      <Quote fr={fr} at={W(10, "люди") - 4} until={T.aisha + 4} y={300} label="АЛЬ-БУХАРИ 6527 · МУСЛИМ 2859" text="«Люди будут собраны | *босыми и нагими*»" textAt={W(10, "люди")} size={54} />
      <Quote fr={fr} at={T.aisha + 6} until={T.c117 + 4} y={330} label="АИША СПРОСИЛА" arabicSub="رَضِيَ اللَّهُ عَنْهَا" text="«Мужчины и женщины | будут смотреть | друг на друга?»" textAt={W(11, "мужчины")} size={50} />
      {fr >= W(12, "Он") - 6 && fr <= T.c117 + 4 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: interpolate(fr, [T.c117 - 6, T.c117 + 4], [1, 0], clamp) }}>
          <line x1={540} y1={735} x2={540} y2={735 + 70 * prog(fr, W(12, "Он") - 6, W(12, "Он") + 8)} stroke={C.line} strokeWidth={1.5} />
          <rect x={535} y={765} width={10} height={10} transform="rotate(45 540 770)" fill={C.gold} opacity={prog(fr, W(12, "Он"), W(12, "Он") + 10)} />
        </svg>
      )}
      <Quote fr={fr} at={W(12, "Он")} until={T.c117 + 4} y={815} label="ОН ОТВЕТИЛ" arabicSub="ﷺ" text="«Положение будет | *слишком тяжёлым,* | чтобы думать об этом»" textAt={W(12, "положение")} size={50} />

      {/* 8. 117 млрд в одном месте */}
      {fr >= T.c117 && fr <= W(14, "Казалось") && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, opacity: prog(fr, T.c117, T.c117 + 10) * interpolate(fr, [W(14, "Казалось") - 10, W(14, "Казалось")], [1, 0], clamp) }}>
          <Digits chars={scramble("117 000 000 000", fr, W(13, "Сто") - 2, W(13, "миллиардов") + 6)} size={92} />
        </div>
      )}
      <Kicker fr={fr} at={W(13, "миллиардов")} until={W(14, "Казалось")} y={425} text="ЧЕЛОВЕК" />
      <Cap fr={fr} at={W(13, "И")} until={W(13, "В") - 2} y={520} text="И это только те, | кто уже *родился*" />
      <Cap fr={fr} at={W(13, "В")} until={W(14, "Казалось") - 2} y={520} text="В *одном месте.* | В *один день.*" size={58} />
      <Cap fr={fr} at={W(14, "Казалось")} until={T.alone + 4} y={420} text="Казалось бы, | в такой толпе | легко *затеряться*" />
      <Searchers fr={fr} at={W(14, "в")} until={T.alone + 2} />

      {/* 9. В одиночестве */}
      <Cap fr={fr} at={W(15, "Но")} until={W(15, "Каждый") - 4} y={330} text="Но Аллах говорит:" />
      <Quote
        fr={fr}
        at={W(15, "Каждый") - 4}
        until={T.family + 4}
        y={290}
        label="СУРА МАРЬЯМ · 19:95"
        arabic="وَكُلُّهُمْ آتِيهِ يَوْمَ الْقِيَامَةِ فَرْدًا"
        text="«Каждый из них явится к Нему | в День воскресения | *в одиночестве*»"
        textAt={W(15, "Каждый")}
        size={46}
        arSize={48}
      />

      {/* 10. Бросит брата, мать, отца… */}
      <Quote
        fr={fr}
        at={W(16, "В") - 4}
        until={W(16, "ибо") - 2}
        y={262}
        label="СУРА АБАСА · 80:34–36"
        arabic="يَوْمَ يَفِرُّ الْمَرْءُ مِنْ أَخِيهِ ۝ وَأُمِّهِ وَأَبِيهِ ۝ وَصَاحِبَتِهِ وَبَنِيهِ"
        arSize={38}
        text="«В тот день человек бросит | своего брата, свою мать | и своего отца, | свою жену и своих сыновей,"
        textAt={W(16, "В")}
        size={40}
      />
      <Quote
        fr={fr}
        at={W(16, "ибо")}
        until={T.prophet2 + 4}
        y={262}
        label="СУРА АБАСА · 80:37"
        arabic="لِكُلِّ امْرِئٍ مِّنْهُمْ يَوْمَئِذٍ شَأْنٌ يُغْنِيهِ"
        arSize={44}
        text="ибо у каждого человека | своих забот | *будет сполна*»"
        textAt={W(16, "ибо")}
        size={46}
      />
      <Tag fr={fr} at={W(16, "человек")} until={T.prophet2 + 4} cam={CAM.family} x={528} y={916} text="ЧЕЛОВЕК" up={64} />
      <Tag fr={fr} at={W(16, "брата")} until={T.prophet2 + 4} cam={CAM.family} x={334} y={876} text="БРАТ" up={92} />
      <Tag fr={fr} at={W(16, "мать")} until={T.prophet2 + 4} cam={CAM.family} x={952} y={880} text="МАТЬ" up={70} />
      <Tag fr={fr} at={W(16, "отца")} until={T.prophet2 + 4} cam={CAM.family} x={124} y={862} text="ОТЕЦ" up={70} />
      <Tag fr={fr} at={W(16, "жену")} until={T.prophet2 + 4} cam={CAM.family} x={700} y={884} text="ЖЕНА" up={92} />
      <Tag fr={fr} at={W(16, "сыновей")} until={T.prophet2 + 4} cam={CAM.family} x={270} y={1040} text="СЫН" up={56} />
      <Tag fr={fr} at={W(16, "сыновей") + 3} until={T.prophet2 + 4} cam={CAM.family} x={806} y={990} text="СЫН" up={56} />

      {/* 11. Пророк ﷺ сказал — заставка; без переводчика; направо, налево, вперёд */}
      <Cap fr={fr} at={W(17, "Пророк")} until={T.talk + 4} y={300} text="Пророк ﷺ сказал:" />
      <Calligraphy fr={fr} at={T.prophet2 + 6} until={T.talk + 6} y={770} text="قَالَ النَّبِيُّ ﷺ" />
      <Quote fr={fr} at={WE(17, "с") - 4} until={W(18, "Человек") - 2} y={300} label="АЛЬ-БУХАРИ 7512 · МУСЛИМ 1016" text="«С каждым из вас | Господь будет говорить | *без переводчика*»" textAt={WE(17, "с")} size={50} />
      <Cap fr={fr} at={W(18, "Человек")} until={W(18, "и") - 2} y={330} text="Человек посмотрит | *направо*" />
      <Cap fr={fr} at={W(18, "и")} until={W(18, "Посмотрит", 1) - 2} y={330} text="и увидит | только *свои дела*" />
      <Cap fr={fr} at={W(18, "Посмотрит", 1)} until={W(18, "и", 1) - 2} y={330} text="Посмотрит | *налево…*" />
      <Cap fr={fr} at={W(18, "и", 1)} until={T.fire + 2} y={330} text="и увидит | только *свои дела*" />
      <Cap fr={fr} at={W(18, "Посмотрит", 2)} until={W(18, "и", 2) - 2} y={380} text="Посмотрит | *вперёд…*" size={58} />
      <Cap fr={fr} at={W(18, "и", 2)} until={T.billions + 2} y={380} text="и увидит | *огонь*" size={66} tone="ember" />

      {/* 12. Миллиарды вокруг */}
      <Cap fr={fr} at={W(19, "Миллиарды")} until={W(19, "А") - 2} y={330} text="Миллиарды людей | *вокруг*" />
      <Cap fr={fr} at={W(19, "А")} until={T.prophet3 + 2} y={330} text="А рядом с тобой — | только то, | что *ты сделал*" />

      {/* 13. Пророк ﷺ сказал — заставка; половинка финика */}
      <Cap fr={fr} at={W(20, "И")} until={T.date + 4} y={300} text="И Пророк ﷺ сказал:" />
      <Calligraphy fr={fr} at={T.prophet3 + 6} until={T.date + 6} y={770} text="قَالَ النَّبِيُّ ﷺ" />
      <Quote
        fr={fr}
        at={W(20, "Защитите") - 4}
        until={T.outro + 4}
        y={300}
        label="АЛЬ-БУХАРИ 7512 · МУСЛИМ 1016"
        arabic="اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ"
        text="«Защитите себя от огня, | хотя бы *половинкой финика*»"
        textAt={W(20, "Защитите")}
        size={50}
      />

      {/* 14. Подписывайся */}
      <Cap fr={fr} at={W(21, "Подписывайся")} until={TOTAL - 4} y={620} text="*Подписывайся,* | чтобы не пропустить | новые ролики" size={50} rule />
    </>
  );
};
