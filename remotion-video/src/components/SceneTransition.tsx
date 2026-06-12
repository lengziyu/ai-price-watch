import type {ReactNode} from "react";
import {interpolate, useCurrentFrame, useVideoConfig} from "remotion";

export const SceneTransition = ({
  children,
  durationInSeconds,
}: {
  children: ReactNode;
  durationInSeconds: number;
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const duration = durationInSeconds * fps;
  const fadeFrames = 0.28 * fps;
  const opacity = interpolate(
    frame,
    [0, fadeFrames, duration - fadeFrames, duration],
    [0, 1, 1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );
  const scale = interpolate(frame, [0, fadeFrames], [1.025, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return <div style={{position: "absolute", inset: 0, opacity, transform: `scale(${scale})`}}>{children}</div>;
};
