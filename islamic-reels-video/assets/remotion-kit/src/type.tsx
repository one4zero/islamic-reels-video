import React from "react";
import { interpolate } from "remotion";
import { wordTimes } from "./timing";
import { ARABIC, C, clamp, prog, SAFE_W, SANS, SERIF } from "./ui";

/**
 * Строгая типографика: капс Montserrat с трекингом, слова проявляются точно по озвучке
 * (подъём на несколько пикселей + расфокус → резкость), без прыжков и вращений.
 * `*слово*` — золотой акцент, ` | ` — перенос строки.
 */

type Tok = { t: string; hi: boolean; br?: boolean };

const parse = (text: string): Tok[] => {
  const out: Tok[] = [];
  let hi = false;
  for (const raw of text.split(/\s+/).filter(Boolean)) {
    if (raw === "|") {
      out.push({ t: "", hi: false, br: true });
      continue;
    }
    let t = raw;
    let h = hi;
    if (t.startsWith("*")) {
      h = true;
      hi = true;
      t = t.slice(1);
    }
    if (t.includes("*")) {
      t = t.replace("*", "");
      hi = false;
    }
    out.push({ t, hi: h });
  }
  return out;
};

const Words: React.FC<{ fr: number; toks: Tok[]; times: number[]; hiColor: string; hiGlow: string; dur?: number; rise?: number }> = ({ fr, toks, times, hiColor, hiGlow, dur = 10, rise = 16 }) => {
  let wi = 0;
  return (
    <>
      {toks.map((tk, i) => {
        if (tk.br) return <span key={i} style={{ display: "block", height: 0 }} />;
        const at = times[wi++];
        const p = prog(fr, at, at + dur);
        const next = toks[i + 1];
        return (
          <React.Fragment key={i}>
            <span
              data-w="1"
              style={{
                display: "inline-block",
                whiteSpace: "pre",
                opacity: p,
                transform: `translateY(${(1 - p) * rise}px)`,
                filter: p < 0.99 ? `blur(${(1 - p) * 7}px)` : undefined,
                color: tk.hi ? hiColor : undefined,
                textShadow: tk.hi ? hiGlow : undefined,
              }}
            >
              {tk.t}
            </span>
            {next && !next.br ? " " : ""}
          </React.Fragment>
        );
      })}
    </>
  );
};

const exitOf = (fr: number, until: number, len = 9) => interpolate(fr, [until - len, until], [1, 0], clamp);

/** Повествовательный титр капсом. */
export const Cap: React.FC<{
  fr: number;
  at: number;
  until: number;
  y: number;
  text: string;
  size?: number;
  weight?: number;
  tone?: "gold" | "ember";
  width?: number;
  rule?: boolean;
}> = ({ fr, at, until, y, text, size = 54, weight = 600, tone = "gold", width = SAFE_W, rule }) => {
  if (fr < at - 2 || fr > until) return null;
  const toks = parse(text.toUpperCase());
  const times = wordTimes(
    toks.filter((t) => !t.br).map((t) => t.t),
    at,
  );
  const out = exitOf(fr, until);
  const hiColor = tone === "ember" ? C.ember : C.gold;
  const hiGlow = tone === "ember" ? "0 0 22px rgba(255,120,50,0.55), 0 2px 10px rgba(0,0,0,0.6)" : "0 0 20px rgba(230,190,110,0.35), 0 2px 10px rgba(0,0,0,0.6)";
  const r = prog(fr, at - 2, at + 16);
  return (
    <div
      data-safe={`cap ${text.slice(0, 26)}`}
      style={{
        position: "absolute",
        left: (1080 - width) / 2,
        width,
        top: y,
        textAlign: "center",
        opacity: out,
        transform: `translateY(${(1 - out) * -10}px)`,
        filter: out < 0.99 ? `blur(${(1 - out) * 5}px)` : undefined,
      }}
    >
      {rule && <div style={{ width: 70 * r, height: 2, margin: "0 auto 26px", background: `linear-gradient(90deg, rgba(230,194,122,0), ${C.gold}, rgba(230,194,122,0))` }} />}
      <div
        data-lines={text.split("|").length}
        style={{
          fontFamily: SANS,
          fontWeight: weight,
          fontSize: size,
          lineHeight: 1.2,
          letterSpacing: "0.045em",
          color: C.white,
          textShadow: "0 2px 14px rgba(0,0,0,0.65), 0 0 3px rgba(0,0,0,0.35)",
        }}
      >
        <Words fr={fr} toks={toks} times={times} hiColor={hiColor} hiGlow={hiGlow} />
      </div>
    </div>
  );
};

/** Маленькая подпись капсом с золотыми линиями по бокам. */
export const Kicker: React.FC<{ fr: number; at: number; until: number; y: number; text: string; color?: string; size?: number; lines?: boolean; x?: number }> = ({
  fr, at, until, y, text, color = C.gold, size = 24, lines = true, x = 540,
}) => {
  if (fr < at || fr > until) return null;
  const k = prog(fr, at, at + 18);
  const out = exitOf(fr, until);
  return (
    <div
      data-safe={`kicker ${text}`}
      style={{
        position: "absolute",
        left: x - 500,
        width: 1000,
        top: y,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        opacity: k * out,
        fontFamily: SANS,
        fontWeight: 500,
        fontSize: size,
        letterSpacing: "0.32em",
        color,
        textShadow: "0 1px 8px rgba(0,0,0,0.6)",
        whiteSpace: "nowrap",
      }}
    >
      {lines && <span style={{ width: 64 * k, height: 1.5, background: `linear-gradient(90deg, rgba(230,194,122,0), ${C.line})` }} />}
      <span style={{ marginRight: "-0.32em" }}>{text}</span>
      {lines && <span style={{ width: 64 * k, height: 1.5, background: `linear-gradient(90deg, ${C.line}, rgba(230,194,122,0))` }} />}
    </div>
  );
};

/** Рамка панели: линии прорисовываются от центра верхней грани по периметру, в углах — ромбы. */
const PanelFrame: React.FC<{ k: number }> = ({ k }) => {
  const top = prog(k, 0, 0.35, (x) => x);
  const side = prog(k, 0.3, 0.7, (x) => x);
  const bot = prog(k, 0.65, 1, (x) => x);
  const g = C.line;
  const line = (st: React.CSSProperties) => <div style={{ position: "absolute", background: g, ...st }} />;
  const dia = (st: React.CSSProperties, o: number) => (
    <div style={{ position: "absolute", width: 9, height: 9, background: C.gold, transform: "rotate(45deg)", opacity: o, boxShadow: "0 0 10px rgba(255,210,140,0.8)", ...st }} />
  );
  return (
    <>
      {line({ top: 0, left: "50%", width: `${top * 50}%`, height: 1.5 })}
      {line({ top: 0, right: "50%", width: `${top * 50}%`, height: 1.5 })}
      {line({ top: 0, left: 0, width: 1.5, height: `${side * 100}%` })}
      {line({ top: 0, right: 0, width: 1.5, height: `${side * 100}%` })}
      {line({ bottom: 0, left: 0, width: `${bot * 50}%`, height: 1.5 })}
      {line({ bottom: 0, right: 0, width: `${bot * 50}%`, height: 1.5 })}
      {dia({ top: -4.5, left: -4.5 }, top)}
      {dia({ top: -4.5, right: -4.5 }, top)}
      {dia({ bottom: -4.5, left: -4.5 }, bot)}
      {dia({ bottom: -4.5, right: -4.5 }, bot)}
      {dia({ top: -4.5, left: "calc(50% - 4.5px)" }, top)}
    </>
  );
};

/** Аят/хадис в стеклянной панели: рамка рисуется, источник сверху, арабский с бликом, перевод — слова по озвучке. */
export const Quote: React.FC<{
  fr: number;
  at: number;
  until: number;
  y: number;
  label: string;
  text: string;
  arabic?: string;
  arabicSub?: string;
  size?: number;
  arSize?: number;
  textAt?: number;
  width?: number;
}> = ({ fr, at, until, y, label, text, arabic, arabicSub, size = 48, arSize = 52, textAt, width = SAFE_W }) => {
  if (fr < at - 2 || fr > until) return null;
  const toks = parse(text);
  const times = wordTimes(
    toks.filter((t) => !t.br).map((t) => t.t),
    textAt ?? at,
  );
  const out = exitOf(fr, until, 10);
  const kp = prog(fr, at - 2, at + 14);
  const kf = interpolate(fr, [at, at + 26], [0, 1], clamp);
  const ka = prog(fr, at + 6, at + 30);
  const kl = prog(fr, at + 4, at + 22);
  const sh = interpolate(fr, [at + 20, at + 70], [125, -25], clamp);
  return (
    <div data-safe={`quote ${label}`} style={{ position: "absolute", left: (1080 - width) / 2, width, top: y, textAlign: "center", opacity: out, filter: out < 0.99 ? `blur(${(1 - out) * 5}px)` : undefined, transform: `translateY(${(1 - out) * -12}px)` }}>
      <div
        style={{
          position: "relative",
          padding: "34px 34px 38px",
          background: `linear-gradient(180deg, rgba(7,10,20,${0.5 * kp}), rgba(7,10,20,${0.34 * kp}))`,
          backdropFilter: kp > 0.01 ? `blur(${12 * kp}px)` : undefined,
          WebkitBackdropFilter: kp > 0.01 ? `blur(${12 * kp}px)` : undefined,
        }}
      >
        <PanelFrame k={kf} />
        <div style={{ opacity: kl, fontFamily: SANS, fontWeight: 500, fontSize: 21, letterSpacing: "0.3em", color: C.gold, textShadow: "0 1px 8px rgba(0,0,0,0.6)", whiteSpace: "nowrap", transform: `translateY(${(1 - kl) * 8}px)` }}>
          <span style={{ marginRight: "-0.3em" }}>{label}</span>
        </div>
        {arabic && (
          <div
            style={{
              marginTop: 22,
              fontFamily: ARABIC,
              fontWeight: 700,
              fontSize: arSize,
              lineHeight: 1.55,
              direction: "rtl",
              opacity: ka,
              filter: `blur(${(1 - ka) * 8}px) drop-shadow(0 0 16px rgba(230,190,110,0.35))`,
              transform: `scale(${0.96 + 0.04 * ka})`,
              ...({ textWrap: "balance" } as React.CSSProperties),
            }}
          >
            <span
              style={{
                backgroundImage: `linear-gradient(100deg, #d9b56c 0%, #f0d9a6 ${sh - 12}%, #fffaf0 ${sh}%, #f0d9a6 ${sh + 12}%, #d9b56c 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                padding: "0.45em 0.1em",
                WebkitBoxDecorationBreak: "clone",
                boxDecorationBreak: "clone",
              }}
            >
              {arabic}
            </span>
          </div>
        )}
        {arabicSub && <div style={{ marginTop: 4, fontFamily: ARABIC, fontWeight: 700, fontSize: 30, direction: "rtl", color: "#e8cf98", opacity: ka }}>{arabicSub}</div>}
        <div style={{ width: 140 * ka, height: 1, margin: arabic ? "20px auto 20px" : "22px auto 18px", background: `linear-gradient(90deg, rgba(230,194,122,0), ${C.line}, rgba(230,194,122,0))` }} />
        <div data-lines={text.split("|").length} style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: size, lineHeight: 1.3, color: C.white, textShadow: "0 2px 14px rgba(0,0,0,0.7)" }}>
          <Words fr={fr} toks={toks} times={times} hiColor={C.gold} hiGlow="0 0 20px rgba(230,190,110,0.4), 0 2px 10px rgba(0,0,0,0.6)" dur={9} rise={12} />
        </div>
      </div>
    </div>
  );
};
