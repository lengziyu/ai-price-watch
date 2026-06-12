import {AbsoluteFill} from "remotion";
import {DesktopBrowser, DesktopCapture} from "../components/DesktopBrowser";
import {Brand} from "../components/Brand";
import {GlassCard, Pop, Reveal} from "../components/Motion";
import {colors} from "../constants";

export const HomeCtaScene = () => (
  <AbsoluteFill style={{padding: "104px 54px 228px", alignItems: "center", textAlign: "center"}}>
    <Reveal>
      <Brand />
    </Reveal>
    <Reveal delay={7} style={{position: "absolute", left: 0, right: 0, top: 318}}>
      <DesktopBrowser url="price.lengziyu.cn" style={{height: 860, borderRadius: 0}} contentStyle={{height: 802}}>
        <DesktopCapture src="site-captures/home-dark.png" y={-10} />
      </DesktopBrowser>
    </Reveal>
    <Reveal delay={18} style={{position: "absolute", left: 72, right: 72, bottom: 432}}>
      <div style={{fontSize: 69, lineHeight: 1.06, fontWeight: 920, letterSpacing: -5}}>
        开 AI 会员前
        <br />
        <span style={{color: colors.brightGreen}}>先查一下</span>
      </div>
    </Reveal>
    <Pop delay={31} style={{position: "absolute", left: 72, right: 72, bottom: 278}}>
      <GlassCard style={{padding: "27px 18px", borderColor: "rgba(92,224,174,0.38)"}}>
        <div style={{fontFamily: "monospace", color: colors.brightGreen, fontSize: 42, fontWeight: 920, letterSpacing: -2.5}}>
          price.lengziyu.cn
        </div>
      </GlassCard>
    </Pop>
  </AbsoluteFill>
);
