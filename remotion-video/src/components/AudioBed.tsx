import {Audio} from "@remotion/media";
import {Sequence, interpolate, staticFile} from "remotion";
import {FPS} from "../constants";
import {voiceoverCues} from "../generatedAudioTimeline";

const seconds = (value: number) => Math.round(value * FPS);
const milliseconds = (value: number) => Math.round((value / 1000) * FPS);

const sfx = [
  {file: "whoosh.wav", at: 2.42, volume: 0.14},
  {file: "card-pop.wav", at: 3.04, volume: 0.17},
  {file: "card-pop.wav", at: 3.48, volume: 0.13},
  {file: "whoosh.wav", at: 5.92, volume: 0.14},
  {file: "number-highlight.wav", at: 7.34, volume: 0.18},
  {file: "page-switch.wav", at: 13.92, volume: 0.13},
  {file: "card-pop.wav", at: 14.54, volume: 0.12},
  {file: "button-click.wav", at: 20.72, volume: 0.2},
  {file: "card-zoom.wav", at: 20.76, volume: 0.17},
  {file: "page-switch.wav", at: 21.08, volume: 0.14},
  {file: "whoosh.wav", at: 24.42, volume: 0.13},
  {file: "number-highlight.wav", at: 26.12, volume: 0.14},
];

export const AudioBed = () => (
  <>
    <Audio
      src={staticFile("audio/bgm/tech-light-groove.wav")}
      volume={(frame) =>
        interpolate(frame, [0, seconds(0.8), seconds(27.4), seconds(29)], [0, 0.16, 0.16, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
    {voiceoverCues.map((cue) => (
      <Sequence key={cue.id} from={milliseconds(cue.startMs)} durationInFrames={milliseconds(cue.durationMs)}>
        <Audio src={staticFile(cue.file)} volume={0.96} />
      </Sequence>
    ))}
    {sfx.map((effect, index) => (
      <Sequence key={`${effect.file}-${effect.at}-${index}`} from={seconds(effect.at)}>
        <Audio src={staticFile(`audio/sfx/${effect.file}`)} volume={effect.volume} />
      </Sequence>
    ))}
  </>
);
