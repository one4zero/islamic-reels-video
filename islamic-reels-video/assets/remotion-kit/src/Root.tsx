import { Composition } from "remotion";
import { Reel } from "./Reel";
import { FPS, TOTAL } from "./timing";

export const RemotionRoot: React.FC = () => {
  return <Composition id="Reel" component={Reel} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} defaultProps={{ probe: false }} />;
};
