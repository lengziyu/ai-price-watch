import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {colors} from "../constants";

export const Background = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drift = interpolate(frame, [0, 33 * fps], [-140, 160]);
  const pulse = interpolate(Math.sin(frame / 24), [-1, 1], [0.76, 1]);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(circle at 48% 8%, rgba(0,188,125,0.20), transparent 32%), linear-gradient(150deg, #020706 0%, #06110e 52%, #020504 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -220,
          opacity: 0.46,
          transform: `translateX(${drift}px)`,
          backgroundImage:
            "linear-gradient(rgba(92,224,174,0.075) 1px, transparent 1px), linear-gradient(90deg, rgba(92,224,174,0.075) 1px, transparent 1px)",
          backgroundSize: "76px 76px",
          maskImage: "linear-gradient(to bottom, black, transparent 82%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 860,
          height: 860,
          borderRadius: "50%",
          left: -430 + drift * 0.38,
          top: 380,
          opacity: 0.34 * pulse,
          background: "rgba(0,188,125,0.24)",
          filter: "blur(120px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 680,
          height: 680,
          borderRadius: "50%",
          right: -300 - drift * 0.28,
          bottom: 90,
          opacity: 0.24 * pulse,
          background: "rgba(245,158,11,0.18)",
          filter: "blur(132px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 28,
          borderRadius: 42,
          border: `1px solid ${colors.line}`,
        }}
      />
    </AbsoluteFill>
  );
};
