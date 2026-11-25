import React from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { T } from "./Scenes";
import { TOTAL, W, WE } from "./timing";

/**
 * Звук: голос (+2 % темп, rubberband) и нашид без инструментов (зациклен, тихо, приглушается под голос) —
 * оба подготовлены scripts/gen_audio.py. Эффекты синтезированы там же и звучат очень тихо.
 */

type Cue = { at: number; file: string; vol: number };

const cues = (): Cue[] => {
  const c: Cue[] = [];
  const add = (at: number, file: string, vol: number) => c.push({ at, file, vol });
  // переходы
  [T.galaxy, T.graves, T.earth8, T.names, T.hourglass, T.mushaf, T.one, T.plain, T.crowd18, T.prophet1, T.feet, T.aisha, T.c117, T.born, T.c117b, T.family, T.prophet2, T.talk, T.billions, T.prophet3, T.date, T.outro].forEach((f) =>
    add(f - 4, "whoosh", 0.035),
  );
  // заставки «Пророк ﷺ сказал»: мягкий перелив на каллиграфии
  [T.prophet1, T.prophet2, T.prophet3].forEach((f) => add(f + 6, "shimmer", 0.04));
  // толпа рассыпается в пыль
  add(T.alone - 2, "riser", 0.03);
  // защёлкивание цифр 117 000 000 000
  const lockDigits = (a: number, b: number) => {
    for (let i = 0; i < 12; i++) add(Math.round(a + ((b - a) * i) / 11), "tick", 0.05);
    add(b + 2, "boom", 0.12);
  };
  lockDigits(W(1, "ста"), W(1, "миллиардов") + 4);
  lockDigits(W(13, "Сто") - 2, W(13, "миллиардов") + 6);
  // 117 → 8 млрд
  add(W(3, "восьми") - 4, "roll", 0.05);
  // сетка 100 человек и 7 %
  add(W(3, "Но"), "shimmer", 0.03);
  add(W(3, "семи"), "lock", 0.06);
  // имена: раз в секунду, потом разгон
  for (let f = W(4, "называть"); f < W(4, "Без"); f += 30) add(f, "tick", 0.05);
  add(W(4, "Без"), "riser", 0.05);
  add(W(5, "лет"), "boom", 0.1);
  // аяты и хадисы — тихий перелив
  [W(6, "Он") - 4, W(8, "Воистину") - 6, W(9, "Мы") - 6, W(10, "люди") - 4, W(15, "Каждый") - 4, W(16, "В") - 4, WE(17, "с") - 4, W(20, "Защитите") - 4].forEach((f) => add(f, "shimmer", 0.03));
  // прицелы и метки
  add(W(7, "потерян") - 4, "lock", 0.06);
  add(W(7, "забыт") - 4, "lock", 0.05);
  add(W(7, "забыт") + 4, "shimmer", 0.03);
  // подписи на семье
  ["человек", "брата", "мать", "отца", "жену", "сыновей"].forEach((w) => add(W(16, w), "tick", 0.04));
  // дела
  add(W(18, "увидит") - 6, "shimmer", 0.03);
  add(W(18, "увидит", 1) - 6, "shimmer", 0.03);
  add(W(19, "только") - 10, "shimmer", 0.03);
  // огонь
  add(T.fire - 2, "boom", 0.1);
  return c.filter((x) => x.at >= 0 && x.at < TOTAL);
};

const fireVol = (f: number) =>
  interpolate(f, [T.fire - 6, T.fire + 10, T.billions, T.billions + 24], [0, 0.09, 0.09, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const Sfx: React.FC = () => (
  <>
    <Audio name="Голос" src={staticFile("audio/voice_mix.wav")} />
    <Audio name="Нашид (фон)" src={staticFile("audio/bed.mp3")} />
    <Sequence from={T.fire - 6} durationInFrames={T.billions + 30 - (T.fire - 6)} name="Огонь (фон)" layout="none">
      <Audio src={staticFile("sfx/fire.wav")} volume={(f) => fireVol(f + T.fire - 6)} />
    </Sequence>
    {cues().map((c, i) => (
      <Sequence key={i} from={c.at} durationInFrames={120} name={`sfx ${c.file}`} layout="none">
        <Audio src={staticFile(`sfx/${c.file}.wav`)} volume={c.vol} />
      </Sequence>
    ))}
  </>
);
