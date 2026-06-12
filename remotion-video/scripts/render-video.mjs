import {execFileSync} from "node:child_process";
import {rmSync} from "node:fs";
import {join} from "node:path";

const rawOutput = join("out", "leijiatong-douyin.raw.mp4");
const finalOutput = join("out", "leijiatong-douyin.mp4");

execFileSync(
  "npx",
  ["remotion", "render", "src/index.ts", "LeijiatongDouyin", rawOutput],
  {stdio: "inherit"},
);

execFileSync(
  "ffmpeg",
  [
    "-y",
    "-loglevel",
    "error",
    "-i",
    rawOutput,
    "-c:v",
    "copy",
    "-af",
    "loudnorm=I=-16:TP=-1.5:LRA=11",
    "-c:a",
    "aac",
    "-ar",
    "48000",
    "-b:a",
    "192k",
    finalOutput,
  ],
  {stdio: "inherit"},
);

rmSync(rawOutput);
console.log(`Normalized video written to ${finalOutput}`);
