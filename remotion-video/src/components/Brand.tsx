import {Img, staticFile} from "remotion";
import {colors} from "../constants";

export const Brand = ({compact = false}: {compact?: boolean}) => (
  <div style={{display: "flex", alignItems: "center", gap: compact ? 13 : 18}}>
    <Img
      src={staticFile("leijiatong-logo.svg")}
      style={{width: compact ? 46 : 60, height: compact ? 46 : 60}}
    />
    <div>
      <div style={{fontSize: compact ? 26 : 34, fontWeight: 850, letterSpacing: -1.5}}>雷价通</div>
      <div style={{fontSize: compact ? 14 : 18, letterSpacing: 3.6, color: colors.green, fontWeight: 800}}>
        PRICERADAR AI
      </div>
    </div>
  </div>
);
