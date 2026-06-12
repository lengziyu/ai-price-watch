import type {CSSProperties, ReactNode} from "react";
import {Img, staticFile} from "remotion";
import {colors} from "../constants";

export const DesktopBrowser = ({
  children,
  url,
  style,
  contentStyle,
  fadeBottom = true,
}: {
  children?: ReactNode;
  url: string;
  style?: CSSProperties;
  contentStyle?: CSSProperties;
  fadeBottom?: boolean;
}) => (
  <div
    style={{
      position: "relative",
      overflow: "hidden",
      borderRadius: 28,
      border: "1px solid rgba(151,255,215,0.22)",
      background: "#040706",
      boxShadow: "0 30px 90px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.09)",
      ...style,
    }}
  >
    <div
      style={{
        height: 58,
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "0 18px",
        borderBottom: "1px solid rgba(151,255,215,0.12)",
        background: "rgba(6,15,13,0.98)",
      }}
    >
      {["#ff735f", "#f59e0b", "#00bc7d"].map((color) => (
        <span key={color} style={{width: 13, height: 13, borderRadius: "50%", background: color}} />
      ))}
      <div
        style={{
          marginLeft: 12,
          flex: 1,
          padding: "9px 18px",
          borderRadius: 999,
          border: "1px solid rgba(151,255,215,0.12)",
          color: colors.muted,
          background: "rgba(255,255,255,0.025)",
          fontFamily: "monospace",
          fontSize: 18,
        }}
      >
        {url}
      </div>
    </div>
    <div style={{position: "relative", overflow: "hidden", ...contentStyle}}>
      {children}
      {fadeBottom ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "34%",
            background: "linear-gradient(to bottom, rgba(3,8,7,0), rgba(3,8,7,0.96) 84%, #030807)",
          }}
        />
      ) : null}
    </div>
  </div>
);

export const DesktopCapture = ({
  src,
  y = 0,
  width = "100%",
  style,
}: {
  src: string;
  y?: number;
  width?: number | string;
  style?: CSSProperties;
}) => (
  <Img
    src={staticFile(src)}
    style={{
      display: "block",
      width,
      transform: `translateY(${y}px)`,
      ...style,
    }}
  />
);
