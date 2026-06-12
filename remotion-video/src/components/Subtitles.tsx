import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {captions} from "../captions";
import {colors} from "../constants";

export const Subtitles = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const now = (frame / fps) * 1000;
  const caption = captions.find((item) => item.startMs <= now && now < item.endMs);

  if (!caption) {
    return null;
  }

  const local = now - caption.startMs;
  const opacity = interpolate(local, [0, 140, caption.endMs - caption.startMs - 160, caption.endMs - caption.startMs], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const emphasized = ["价格", "price.lengziyu.cn", "少踩坑", "先查价格"].some((keyword) =>
    caption.text.includes(keyword),
  );

  return (
    <AbsoluteFill style={{justifyContent: "flex-end", alignItems: "center", pointerEvents: "none"}}>
      <div
        style={{
          marginBottom: 128,
          maxWidth: 934,
          padding: "18px 30px 20px",
          borderRadius: 22,
          border: `1px solid ${emphasized ? "rgba(92,224,174,0.32)" : "rgba(255,255,255,0.10)"}`,
          background: "rgba(0, 7, 6, 0.78)",
          boxShadow: "0 18px 44px rgba(0,0,0,0.28)",
          color: emphasized ? colors.brightGreen : "#ffffff",
          fontSize: 42,
          lineHeight: 1.32,
          fontWeight: 850,
          letterSpacing: -1.6,
          textAlign: "center",
          opacity,
          transform: `translateY(${(1 - opacity) * 12}px)`,
        }}
      >
        {caption.text}
      </div>
    </AbsoluteFill>
  );
};
