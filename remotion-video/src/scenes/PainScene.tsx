import {AbsoluteFill, Img, staticFile} from "remotion";
import {GlassCard, Pill, Pop, Reveal} from "../components/Motion";
import {colors} from "../constants";

const tools = [
  ["openai.png", "ChatGPT", "$20 / mo"],
  ["anthropic.png", "Claude", "$20 / mo"],
  ["cursor.png", "Cursor", "$20 / mo"],
  ["google.png", "Gemini", "$19.99 / mo"],
  ["deepseek.png", "DeepSeek", "按量计费"],
];

export const PainScene = () => (
  <AbsoluteFill style={{padding: "126px 68px 250px"}}>
    <Reveal>
      <Pill>01 / 订阅选择困难</Pill>
    </Reveal>
    <Reveal delay={6}>
      <div style={{marginTop: 28, fontSize: 80, lineHeight: 1.02, fontWeight: 900, letterSpacing: -5}}>
        工具越来越多
        <br />
        <span style={{color: colors.gold}}>价格越来越绕</span>
      </div>
    </Reveal>
    <div style={{position: "relative", marginTop: 72, height: 770}}>
      {tools.map(([logo, name, price], index) => (
        <Pop
          key={name}
          delay={13 + index * 5}
          style={{
            position: "absolute",
            left: index % 2 === 0 ? 0 : 265,
            top: index * 124,
            width: 670,
          }}
        >
          <GlassCard style={{padding: "24px 28px", display: "flex", alignItems: "center", gap: 21}}>
            <Img src={staticFile(`vendor-logos/${logo}`)} style={{width: 62, height: 62, borderRadius: 16}} />
            <div style={{flex: 1}}>
              <div style={{fontSize: 36, fontWeight: 850}}>{name}</div>
              <div style={{marginTop: 4, fontSize: 22, color: colors.muted}}>不同地区 · 不同套餐</div>
            </div>
            <div style={{fontFamily: "monospace", fontSize: 26, color: colors.green, fontWeight: 800}}>{price}</div>
          </GlassCard>
        </Pop>
      ))}
      <Reveal delay={48} style={{position: "absolute", right: 18, bottom: 12}}>
        <div
          style={{
            fontSize: 31,
            fontWeight: 850,
            color: colors.danger,
            padding: "18px 24px",
            border: "1px solid rgba(255,115,95,0.35)",
            borderRadius: 18,
            background: "rgba(255,115,95,0.10)",
          }}
        >
          差价真的不小
        </div>
      </Reveal>
    </div>
  </AbsoluteFill>
);
