import {AbsoluteFill} from "remotion";
import {Brand} from "../components/Brand";
import {Pill, Pop, Reveal, ScanLine} from "../components/Motion";
import {colors} from "../constants";

export const OpeningScene = () => (
  <AbsoluteFill style={{padding: "116px 78px 270px"}}>
    <Reveal style={{position: "absolute", left: 78, top: 116}}>
      <Brand />
    </Reveal>
    <div
      style={{
        position: "absolute",
        left: 78,
        right: 78,
        top: "50%",
        transform: "translateY(-42%)",
      }}
    >
      <Reveal delay={8}>
        <Pill accent>
          <span style={{width: 11, height: 11, borderRadius: "50%", background: colors.green}} />
          AI 订阅价格雷达
        </Pill>
      </Reveal>
      <Reveal delay={14} distance={80}>
        <div style={{marginTop: 46, fontSize: 126, lineHeight: 0.96, letterSpacing: -9, fontWeight: 920}}>
          AI 订阅价格
          <br />
          <span style={{color: colors.brightGreen}}>一站看清</span>
        </div>
      </Reveal>
      <Reveal delay={24}>
        <div style={{marginTop: 34, color: colors.muted, fontSize: 43, fontWeight: 650, letterSpacing: -1.8}}>
          不用再到处查价格
        </div>
      </Reveal>
      <Pop delay={39} style={{marginTop: 44}}>
        <div style={{fontFamily: "monospace", fontSize: 31, fontWeight: 800, color: colors.gold}}>
          price.lengziyu.cn
        </div>
      </Pop>
    </div>
    <ScanLine />
  </AbsoluteFill>
);
