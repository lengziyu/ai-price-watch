import {execFileSync} from "node:child_process";
import {mkdirSync, rmSync, writeFileSync} from "node:fs";
import {dirname, join, relative} from "node:path";
import {fileURLToPath} from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = join(projectRoot, "public");
const audioRoot = join(publicRoot, "audio");
const voiceRoot = join(audioRoot, "voiceover");
const bgmRoot = join(audioRoot, "bgm");
const sfxRoot = join(audioRoot, "sfx");
const edgeTtsBin = process.env.EDGE_TTS_BIN;
const voiceName = edgeTtsBin ? "zh-CN-YunyangNeural" : "Reed (中文（中国大陆）)";
const voiceRate = edgeTtsBin ? "+0%" : "235";
const trimSilence =
  "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_duration=0.12:start_threshold=-50dB,areverse";

for (const directory of [voiceRoot, bgmRoot, sfxRoot]) {
  mkdirSync(directory, {recursive: true});
}

const sampleRate = 44100;
const clamp = (value, min = -1, max = 1) => Math.max(min, Math.min(max, value));

const writeWav = (path, channels, channelCount = 1) => {
  const length = channels[0].length;
  const dataSize = length * channelCount * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channelCount, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channelCount * 2, 28);
  buffer.writeUInt16LE(channelCount * 2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let index = 0; index < length; index++) {
    for (let channel = 0; channel < channelCount; channel++) {
      buffer.writeInt16LE(Math.round(clamp(channels[channel][index]) * 32767), offset);
      offset += 2;
    }
  }

  writeFileSync(path, buffer);
};

const midi = (note) => 440 * 2 ** ((note - 69) / 12);
let randomState = 20260602;
const noise = () => {
  randomState = (randomState * 1664525 + 1013904223) % 4294967296;
  return (randomState / 4294967296) * 2 - 1;
};

const createBgm = () => {
  const duration = 29.2;
  const length = Math.ceil(duration * sampleRate);
  const left = new Float32Array(length);
  const right = new Float32Array(length);
  const roots = [45, 48, 41, 43];
  const chordOffsets = [0, 7, 12];

  for (let index = 0; index < length; index++) {
    const time = index / sampleRate;
    const root = roots[Math.floor(time / 4) % roots.length];
    const beat = time % 0.5;
    const step = time % 0.25;
    const kickEnvelope = Math.exp(-beat * 16);
    const hatEnvelope = Math.exp(-step * 48);
    const arpStep = Math.floor(time / 0.25) % 8;
    const arpEnvelope = Math.exp(-step * 10);
    const arpNote = root + [12, 19, 24, 19, 15, 19, 24, 27][arpStep];
    const pad = chordOffsets.reduce((sum, offset) => sum + Math.sin(2 * Math.PI * midi(root + offset) * time), 0) / 3;
    const bass = Math.sin(2 * Math.PI * midi(root - 12) * time) * (0.56 + kickEnvelope * 0.24);
    const arp = Math.sin(2 * Math.PI * midi(arpNote) * time) * arpEnvelope;
    const kickFrequency = 56 + 55 * Math.exp(-beat * 14);
    const kick = Math.sin(2 * Math.PI * kickFrequency * time) * kickEnvelope;
    const hat = noise() * hatEnvelope;
    const shimmer = Math.sin(2 * Math.PI * midi(root + 31) * time) * (0.5 + 0.5 * Math.sin(time * 0.7));
    const fadeIn = Math.min(1, time / 0.8);
    const fadeOut = Math.min(1, (duration - time) / 1.4);
    const master = Math.min(fadeIn, fadeOut);

    left[index] = master * (pad * 0.16 + bass * 0.13 + arp * 0.15 + kick * 0.16 + hat * 0.032 + shimmer * 0.025);
    right[index] = master * (pad * 0.15 + bass * 0.12 + arp * 0.12 + kick * 0.16 + hat * 0.042 + shimmer * 0.032);
  }

  writeWav(join(bgmRoot, "tech-light-groove.wav"), [left, right], 2);
};

const createEffect = (fileName, duration, makeSample) => {
  const length = Math.ceil(duration * sampleRate);
  const samples = new Float32Array(length);
  for (let index = 0; index < length; index++) {
    const time = index / sampleRate;
    samples[index] = clamp(makeSample(time, duration));
  }
  writeWav(join(sfxRoot, fileName), [samples]);
};

const createSfx = () => {
  createEffect("whoosh.wav", 0.62, (time, duration) => {
    const progress = time / duration;
    const envelope = Math.sin(Math.PI * progress) ** 1.4;
    return envelope * (noise() * 0.34 + Math.sin(2 * Math.PI * (180 + 900 * progress) * time) * 0.08);
  });
  createEffect("card-pop.wav", 0.24, (time, duration) => {
    const progress = time / duration;
    return Math.exp(-time * 18) * Math.sin(2 * Math.PI * (210 + 420 * progress) * time) * 0.82;
  });
  createEffect("number-highlight.wav", 0.52, (time) => {
    const envelope = Math.exp(-time * 5.2);
    return envelope * (Math.sin(2 * Math.PI * 740 * time) * 0.42 + Math.sin(2 * Math.PI * 1110 * time) * 0.28);
  });
  createEffect("button-click.wav", 0.13, (time) => {
    const envelope = Math.exp(-time * 42);
    return envelope * (noise() * 0.4 + Math.sin(2 * Math.PI * 420 * time) * 0.28);
  });
  createEffect("page-switch.wav", 0.36, (time, duration) => {
    const progress = time / duration;
    const envelope = Math.sin(Math.PI * progress) ** 1.2;
    return envelope * (noise() * 0.18 + Math.sin(2 * Math.PI * (560 - 280 * progress) * time) * 0.22);
  });
  createEffect("card-zoom.wav", 0.58, (time, duration) => {
    const progress = time / duration;
    const envelope = Math.sin(Math.PI * progress);
    return envelope * (Math.sin(2 * Math.PI * (130 + 520 * progress) * time) * 0.34 + noise() * 0.06);
  });
};

const voiceSegments = [
  {id: "01-membership", startMs: 200, caption: "开 AI 会员前，", spoken: "开 AI 会员前，"},
  {id: "02-confused", startMs: 1600, caption: "你也被价格搞晕过吗？", spoken: "你也被价格搞晕过吗？"},
  {
    id: "03-products",
    startMs: 3400,
    caption: "ChatGPT、Claude、Cursor，各地区价格差别不小。",
    spoken: "不同工具、不同地区，差价真不小。",
  },
  {id: "04-website", startMs: 6200, caption: "所以，我做了一个网站：price.lengziyu.cn", spoken: "所以，我做了雷价通。"},
  {id: "05-compare", startMs: 7900, caption: "先看会员订阅价格对比。", spoken: "先看会员价格对比。"},
  {
    id: "06-one-screen",
    startMs: 9800,
    caption: "地区价格、人民币换算、套餐差价，一屏看懂。",
    spoken: "地区价格、人民币换算、套餐差价，一屏看懂。",
  },
  {id: "07-deals", startMs: 14300, caption: "还有 AI 优惠和白嫖攻略。", spoken: "还有 AI 优惠攻略。"},
  {
    id: "08-discover",
    startMs: 16300,
    caption: "Gemini、Claude、Cursor 等热门优惠，都能在这里找到。",
    spoken: "热门优惠，都能在这里找到。",
  },
  {id: "09-detail", startMs: 20900, caption: "点开卡片，攻略步骤直接查看。", spoken: "点开卡片，直接看步骤。"},
  {id: "10-check", startMs: 25100, caption: "下次开会员前，先查一下。", spoken: "下次开会员前，先查一下。"},
];

const getDurationMs = (path) =>
  Math.ceil(
    Number(
      execFileSync("ffprobe", [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        path,
      ])
        .toString()
        .trim(),
    ) * 1000,
  );

const createVoiceover = () => {
  rmSync(voiceRoot, {recursive: true, force: true});
  mkdirSync(voiceRoot, {recursive: true});
  for (const segment of voiceSegments) {
    const wavPath = join(voiceRoot, `${segment.id}.wav`);
    if (edgeTtsBin) {
      const mp3Path = join(voiceRoot, `${segment.id}.mp3`);
      execFileSync(edgeTtsBin, ["--voice", voiceName, `--rate=${voiceRate}`, "--text", segment.spoken, "--write-media", mp3Path]);
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", mp3Path, "-af", trimSilence, "-ac", "1", "-ar", `${sampleRate}`, wavPath]);
      rmSync(mp3Path);
    } else {
      const aiffPath = join(voiceRoot, `${segment.id}.aiff`);
      execFileSync("say", ["-v", voiceName, "-r", voiceRate, "-o", aiffPath, segment.spoken]);
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", aiffPath, "-af", trimSilence, "-ac", "1", "-ar", `${sampleRate}`, wavPath]);
      rmSync(aiffPath);
    }
  }

  const timeline = voiceSegments.map((segment, index) => {
    const file = `audio/voiceover/${segment.id}.wav`;
    const durationMs = getDurationMs(join(publicRoot, file));
    const nextStartMs = voiceSegments[index + 1]?.startMs ?? 29000;
    return {
      ...segment,
      file,
      durationMs,
      endMs: Math.min(segment.startMs + durationMs, nextStartMs - 80),
    };
  });
  for (let index = 0; index < timeline.length - 1; index++) {
    const cue = timeline[index];
    const nextCue = timeline[index + 1];
    if (cue.startMs + cue.durationMs >= nextCue.startMs) {
      throw new Error(`Voiceover overlap: ${cue.id} ends after ${nextCue.id} starts`);
    }
  }

  const timelineSource = `import type {Caption} from "@remotion/captions";

export type VoiceoverCue = {
  id: string;
  file: string;
  startMs: number;
  durationMs: number;
};

export const voiceoverCues: VoiceoverCue[] = ${JSON.stringify(
    timeline.map(({id, file, startMs, durationMs}) => ({id, file, startMs, durationMs})),
    null,
    2,
  )};

export const generatedCaptions: Caption[] = ${JSON.stringify(
    timeline.map(({caption, startMs, endMs}) => ({
      text: caption,
      startMs,
      endMs,
      timestampMs: startMs,
      confidence: 1,
    })),
    null,
    2,
  )};
`;

  writeFileSync(join(projectRoot, "src", "generatedAudioTimeline.ts"), timelineSource);
  writeFileSync(
    join(audioRoot, "manifest.json"),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        provider: edgeTtsBin ? "Edge TTS" : "macOS say fallback",
        voice: voiceName,
        rate: voiceRate,
        bgm: "audio/bgm/tech-light-groove.wav",
        sfx: [
          "audio/sfx/whoosh.wav",
          "audio/sfx/card-pop.wav",
          "audio/sfx/number-highlight.wav",
          "audio/sfx/button-click.wav",
          "audio/sfx/page-switch.wav",
          "audio/sfx/card-zoom.wav",
        ],
        voiceover: timeline,
      },
      null,
      2,
    )}\n`,
  );

  console.log("Generated voiceover timeline:");
  for (const cue of timeline) {
    console.log(`${cue.startMs}ms + ${cue.durationMs}ms  ${cue.caption}`);
  }
};

createBgm();
createSfx();
createVoiceover();

console.log(`Audio assets written to ${relative(projectRoot, audioRoot)}`);
