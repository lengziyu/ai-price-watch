import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {DesktopBrowser, DesktopCapture} from "../components/DesktopBrowser";
import {Pill, Reveal} from "../components/Motion";
import {colors} from "../constants";

export const ComparisonScene = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scrollY = interpolate(frame, [0.8 * fps, 7.9 * fps], [-442, -825], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{padding: "92px 52px 226px"}}>
      <Reveal>
        <Pill accent>01 / 会员订阅价格对比</Pill>
      </Reveal>
      <Reveal delay={7}>
        <div style={{marginTop: 24, fontSize: 72, lineHeight: 1.02, fontWeight: 920, letterSpacing: -5}}>
          多地区价格
          <br />
          <span style={{color: colors.brightGreen}}>一屏看懂</span>
        </div>
      </Reveal>
      <Reveal delay={14} style={{position: "absolute", left: 28, right: 28, top: 388}}>
        <DesktopBrowser
          url="price.lengziyu.cn/zh-CN/pricing/subscriptions"
          style={{height: 1040}}
          contentStyle={{height: 982}}
        >
          <DesktopCapture src="site-captures/subscriptions-900-dark.png" y={scrollY} />
        </DesktopBrowser>
      </Reveal>
      <Reveal delay={24} style={{position: "absolute", left: 72, right: 72, bottom: 352}}>
        <div style={{fontSize: 36, lineHeight: 1.32, fontWeight: 880, letterSpacing: -1.7}}>
          人民币换算、套餐差价、
          <br />
          <span style={{color: colors.brightGreen}}>最低价和推荐标签</span>，全都看清。
        </div>
      </Reveal>
    </AbsoluteFill>
  );
};
