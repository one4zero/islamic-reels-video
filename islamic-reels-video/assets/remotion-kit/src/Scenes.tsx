import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Calligraphy, CineBg, Trans, transIn, zoomOut } from "./fx";
import { s, TOTAL } from "./timing";
import { Cap, Kicker, Quote } from "./type";
import { C, CamKey, clamp, Scrim, Shot } from "./ui";

/**
 * EN: EDIT TEMPLATE. 1) T — scene boundaries (after alignment use W(para, "word") / WE(...) instead of s(sec));
 *     2) shots — scene backgrounds (picture with camera or graphics) + transition; 3) Overlays — captions (Cap),
 *     ayah/hadith quotes (Quote), calligraphy, infographics. Full example: assets/examples/rolik4-Scenes.tsx.
 *
 * RU: ШАБЛОН монтажа. Порядок работы:
 * 1) T — границы сцен. После выравнивания текста по голосу используйте W(абзац, "слово") / WE(...) из timing.ts
 *    вместо s(секунды): так всё привязано к озвучке.
 * 2) shots — фоны сцен: картинка с камерой (Shot) или графический фон (CineBg, EmBg, свой компонент) + переход trans.
 * 3) Overlays — титры (Cap), цитаты аятов/хадисов (Quote), каллиграфия, инфографика.
 * Большие рабочие примеры: assets/examples/rolik4-Scenes.tsx (космос + инфографика), rolik5-Scenes.tsx (сад, бренд).
 */

export const T = {
  intro: 0,
  quote: s(6),
};
const FIN = 16;

const CAM = {
  // пример камеры для картинки 9:16: [кадр, зум, центр X, центр Y]
  img: [[T.quote, 1.0, 540, 960], [TOTAL, 1.12, 540, 1060]] as CamKey[],
};

type ShotDef = { key: string; from: number; bg: React.ReactNode; fin?: number; trans?: Trans; ix?: number; iy?: number };

export const AllScenes: React.FC<{ fr: number }> = ({ fr }) => {
  const shots: ShotDef[] = [
    { key: "intro", from: T.intro, fin: 0, trans: "cut", bg: <CineBg fr={fr} at={T.intro} /> },
    {
      key: "quote",
      from: T.quote,
      trans: "iris",
      bg: (
        <>
          {/* картинка: <Shot fr={fr} from={0} to={TOTAL} src="art/имя.jpg" cam={CAM.img} fin={0} /> */}
          <CineBg fr={fr} at={T.quote} seed={3} />
          <Scrim top={0.5} topTo={900} />
        </>
      ),
    },
  ];
  void Shot;
  void CAM;
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      {shots.map((sh, i) => {
        const next = shots[i + 1];
        const to = next ? next.from + (next.fin ?? FIN) : TOTAL;
        if (fr < sh.from || fr >= to) return null;
        const fin = sh.fin ?? FIN;
        const p = fin ? interpolate(fr, [sh.from, sh.from + fin], [0, 1], clamp) : 1;
        const tin = transIn(sh.trans ?? "fade", p, sh.ix, sh.iy);
        const exit = next && next.trans === "zoom" && fr >= next.from ? zoomOut(interpolate(fr, [next.from, next.from + (next.fin ?? FIN)], [0, 1], clamp)) : {};
        return (
          <React.Fragment key={sh.key}>
            <AbsoluteFill style={tin.style}>
              <AbsoluteFill style={exit}>{sh.bg}</AbsoluteFill>
            </AbsoluteFill>
            {tin.overlay}
          </React.Fragment>
        );
      })}
      <Overlays fr={fr} />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: interpolate(fr, [TOTAL - 20, TOTAL - 2], [0, 1], clamp) }} />
    </AbsoluteFill>
  );
};

const Overlays: React.FC<{ fr: number }> = ({ fr }) => (
  <>
    <Calligraphy fr={fr} at={4} until={T.quote} y={420} text="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" size={80} />
    <Kicker fr={fr} at={20} until={T.quote} y={640} text="ПОДПИСЬ · LABEL" />
    {/* Титр: слова проявляются по озвучке (нужен words.json). *слово* — золото, | — перенос строки. */}
    <Cap fr={fr} at={s(1)} until={T.quote} y={760} text="Example caption | *in caps*" />
    <Quote fr={fr} at={T.quote + 4} until={TOTAL} y={300} label="СУРА АЛЬ-ФАТИХА · 1:1" arabic="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" text="«Во имя Аллаха, | Милостивого, Милосердного»" />
  </>
);
