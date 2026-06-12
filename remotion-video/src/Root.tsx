import {Composition} from "remotion";
import {LeijiatongVideo} from "./Video";
import {DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH} from "./constants";

export const RemotionRoot = () => {
  return (
    <Composition
      id="LeijiatongDouyin"
      component={LeijiatongVideo}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
