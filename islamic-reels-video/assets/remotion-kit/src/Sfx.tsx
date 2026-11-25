import React from "react";
import { Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";

/**
 * Звук. Голос — public/audio/voice.wav (scripts/prep_voice.py).
 * Фон — public/audio/bed.mp3 (нашид без инструментов, scripts/mix_bed.py) ИЛИ тихий эмбиент без музыки.
 * Эффекты — public/sfx/*.wav (scripts/gen_sfx.py), громкость 0.02–0.12. Примеры: assets/examples/*-Sfx.tsx.
 */
type Cue = { at: number; file: string; vol: number };
const CUES: Cue[] = [
  // { at: T.scene2 - 4, file: "whoosh", vol: 0.035 },
];

export const Sfx: React.FC = () => (
  <>
    <Audio name="Голос" src={staticFile("audio/voice.wav")} />
    {/* <Audio name="Фон" src={staticFile("audio/bed.mp3")} /> */}
    {CUES.map((c, i) => (
      <Sequence key={i} from={c.at} durationInFrames={90} name={`sfx ${c.file}`} layout="none">
        <Audio src={staticFile(`sfx/${c.file}.wav`)} volume={c.vol} />
      </Sequence>
    ))}
  </>
);
