import {AbsoluteFill, Sequence} from "remotion";
import {Background} from "./components/Background";
import {Subtitles} from "./components/Subtitles";
import {OpeningScene} from "./scenes/OpeningScene";
import {PainScene} from "./scenes/PainScene";
import {ComparisonScene} from "./scenes/ComparisonScene";
import {DealsDesktopScene} from "./scenes/DealsDesktopScene";
import {HomeCtaScene} from "./scenes/HomeCtaScene";
import {FPS} from "./constants";
import {SceneTransition} from "./components/SceneTransition";
import {AudioBed} from "./components/AudioBed";

const seconds = (value: number) => value * FPS;

export const LeijiatongVideo = () => (
  <AbsoluteFill
    style={{
      color: "#f5f7f6",
      fontFamily: '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
    }}
  >
    <Background />
    <AudioBed />
    <Sequence from={0} durationInFrames={seconds(2.5)} premountFor={seconds(1)}>
      <SceneTransition durationInSeconds={2.5}>
        <OpeningScene />
      </SceneTransition>
    </Sequence>
    <Sequence from={seconds(2.5)} durationInFrames={seconds(3.5)} premountFor={seconds(1)}>
      <SceneTransition durationInSeconds={3.5}>
        <PainScene />
      </SceneTransition>
    </Sequence>
    <Sequence from={seconds(6)} durationInFrames={seconds(8)} premountFor={seconds(1)}>
      <SceneTransition durationInSeconds={8}>
        <ComparisonScene />
      </SceneTransition>
    </Sequence>
    <Sequence from={seconds(14)} durationInFrames={seconds(10.5)} premountFor={seconds(1)}>
      <SceneTransition durationInSeconds={10.5}>
        <DealsDesktopScene />
      </SceneTransition>
    </Sequence>
    <Sequence from={seconds(24.5)} durationInFrames={seconds(4.5)} premountFor={seconds(1)}>
      <SceneTransition durationInSeconds={4.5}>
        <HomeCtaScene />
      </SceneTransition>
    </Sequence>
    <Subtitles />
  </AbsoluteFill>
);
