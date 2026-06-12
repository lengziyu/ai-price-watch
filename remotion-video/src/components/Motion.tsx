import type {CSSProperties, ReactNode} from "react";
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {colors} from "../constants";

export const Reveal = ({
  children,
  delay = 0,
  distance = 44,
  style,
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  style?: CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: {damping: 18, stiffness: 145, mass: 0.75},
  });

  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${(1 - progress) * distance}px) scale(${0.96 + progress * 0.04})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Pop = ({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: {damping: 11, stiffness: 190, mass: 0.62},
  });

  return (
    <div style={{transform: `scale(${progress})`, opacity: progress, ...style}}>
      {children}
    </div>
  );
};

export const ScanLine = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const x = interpolate(frame, [0, 2.6 * fps], [-520, 1460], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div
      style={{
        position: "absolute",
        width: 440,
        height: 2200,
        left: x,
        top: -120,
        transform: "rotate(16deg)",
        background: "linear-gradient(90deg, transparent, rgba(92,224,174,0.13), transparent)",
        filter: "blur(20px)",
      }}
    />
  );
};

export const GlassCard = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <div
    style={{
      border: `1px solid ${colors.line}`,
      borderRadius: 30,
      background: "linear-gradient(145deg, rgba(18,35,31,0.86), rgba(6,15,13,0.72))",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10), 0 24px 80px rgba(0,0,0,0.24)",
      backdropFilter: "blur(22px)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Pill = ({children, accent = false}: {children: ReactNode; accent?: boolean}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 18px",
      borderRadius: 999,
      border: `1px solid ${accent ? "rgba(92,224,174,0.35)" : colors.line}`,
      background: accent ? "rgba(0,188,125,0.14)" : "rgba(255,255,255,0.045)",
      color: accent ? colors.brightGreen : colors.muted,
      fontSize: 26,
      fontWeight: 700,
    }}
  >
    {children}
  </span>
);
