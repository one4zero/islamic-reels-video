import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { AllScenes } from "./Scenes";
import { Sfx } from "./Sfx";
import { Grain, SafeProbe, Watermark } from "./ui";

const Visuals: React.FC = () => {
  const fr = useCurrentFrame();
  return <AllScenes fr={fr} />;
};

/** probe=true — режим проверки безопасной зоны (без звука), см. scripts/probe.mjs. */
export const Reel: React.FC<{ probe?: boolean }> = ({ probe }) => (
  <AbsoluteFill data-reel-root style={{ backgroundColor: "#05070d" }}>
    <Visuals />
    <AbsoluteFill style={{ background: "radial-gradient(100% 75% at 50% 45%, rgba(0,0,0,0) 58%, rgba(2,3,8,0.45) 100%)", pointerEvents: "none" }} />
    <Watermark />
    <Grain />
    {probe ? <SafeProbe /> : <Sfx />}
  </AbsoluteFill>
);
