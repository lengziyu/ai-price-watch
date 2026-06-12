import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {DesktopBrowser, DesktopCapture} from "../components/DesktopBrowser";
import {Pill, Reveal} from "../components/Motion";
import {colors} from "../constants";

export const DealsDesktopScene = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const listY = interpolate(frame, [0, 6.2 * fps], [-320, -2760], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const zoom = interpolate(frame, [6.35 * fps, 6.82 * fps], [1, 1.035], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const detailOpacity = interpolate(frame, [6.68 * fps, 6.92 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const detailY = interpolate(frame, [6.68 * fps, 10.3 * fps], [-18, -108], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{padding: "92px 52px 226px"}}>
      <Reveal>
        <Pill accent>02 / AI 优惠和白嫖攻略</Pill>
      </Reveal>
      <Reveal delay={7}>
        <div style={{marginTop: 24, fontSize: 69, lineHeight: 1.02, fontWeight: 920, letterSpacing: -5}}>
          热门 AI 优惠
          <br />
          <span style={{color: colors.gold}}>及时发现</span>
        </div>
      </Reveal>
      <Reveal delay={14} style={{position: "absolute", left: 28, right: 28, top: 384}}>
        <div style={{transform: `scale(${zoom})`, transformOrigin: "center 42%"}}>
          <DesktopBrowser
            url={detailOpacity > 0.5 ? "price.lengziyu.cn/zh-CN/deals/articles/chatgpt-plus-codex" : "price.lengziyu.cn/zh-CN/deals"}
            style={{height: 1044}}
            contentStyle={{height: 986}}
          >
            <div style={{opacity: 1 - detailOpacity}}>
              <DesktopCapture src="site-captures/deals-dark.png" y={listY} />
            </div>
            <div style={{position: "absolute", inset: 0, opacity: detailOpacity, background: "#040505"}}>
              <DesktopCapture src="site-captures/deal-detail-dark.png" y={detailY} />
            </div>
          </DesktopBrowser>
        </div>
      </Reveal>
      <Reveal delay={25} style={{position: "absolute", left: 72, right: 72, bottom: 352}}>
        <div style={{fontSize: 35, lineHeight: 1.34, fontWeight: 880, letterSpacing: -1.5}}>
          Gemini、Claude、Cursor 优惠持续更新。
          <br />
          <span style={{color: colors.gold}}>点开卡片，攻略步骤直接查看。</span>
        </div>
      </Reveal>
    </AbsoluteFill>
  );
};
