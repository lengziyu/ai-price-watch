import type {Caption} from "@remotion/captions";

export type VoiceoverCue = {
  id: string;
  file: string;
  startMs: number;
  durationMs: number;
};

export const voiceoverCues: VoiceoverCue[] = [
  {
    "id": "01-membership",
    "file": "audio/voiceover/01-membership.wav",
    "startMs": 200,
    "durationMs": 1030
  },
  {
    "id": "02-confused",
    "file": "audio/voiceover/02-confused.wav",
    "startMs": 1600,
    "durationMs": 1225
  },
  {
    "id": "03-products",
    "file": "audio/voiceover/03-products.wav",
    "startMs": 3400,
    "durationMs": 2589
  },
  {
    "id": "04-website",
    "file": "audio/voiceover/04-website.wav",
    "startMs": 6200,
    "durationMs": 1399
  },
  {
    "id": "05-compare",
    "file": "audio/voiceover/05-compare.wav",
    "startMs": 7900,
    "durationMs": 1343
  },
  {
    "id": "06-one-screen",
    "file": "audio/voiceover/06-one-screen.wav",
    "startMs": 9800,
    "durationMs": 3437
  },
  {
    "id": "07-deals",
    "file": "audio/voiceover/07-deals.wav",
    "startMs": 14300,
    "durationMs": 1365
  },
  {
    "id": "08-discover",
    "file": "audio/voiceover/08-discover.wav",
    "startMs": 16300,
    "durationMs": 1735
  },
  {
    "id": "09-detail",
    "file": "audio/voiceover/09-detail.wav",
    "startMs": 20900,
    "durationMs": 1727
  },
  {
    "id": "10-check",
    "file": "audio/voiceover/10-check.wav",
    "startMs": 25100,
    "durationMs": 1872
  }
];

export const generatedCaptions: Caption[] = [
  {
    "text": "开 AI 会员前，",
    "startMs": 200,
    "endMs": 1230,
    "timestampMs": 200,
    "confidence": 1
  },
  {
    "text": "你也被价格搞晕过吗？",
    "startMs": 1600,
    "endMs": 2825,
    "timestampMs": 1600,
    "confidence": 1
  },
  {
    "text": "ChatGPT、Claude、Cursor，各地区价格差别不小。",
    "startMs": 3400,
    "endMs": 5989,
    "timestampMs": 3400,
    "confidence": 1
  },
  {
    "text": "所以，我做了一个网站：price.lengziyu.cn",
    "startMs": 6200,
    "endMs": 7599,
    "timestampMs": 6200,
    "confidence": 1
  },
  {
    "text": "先看会员订阅价格对比。",
    "startMs": 7900,
    "endMs": 9243,
    "timestampMs": 7900,
    "confidence": 1
  },
  {
    "text": "地区价格、人民币换算、套餐差价，一屏看懂。",
    "startMs": 9800,
    "endMs": 13237,
    "timestampMs": 9800,
    "confidence": 1
  },
  {
    "text": "还有 AI 优惠和白嫖攻略。",
    "startMs": 14300,
    "endMs": 15665,
    "timestampMs": 14300,
    "confidence": 1
  },
  {
    "text": "Gemini、Claude、Cursor 等热门优惠，都能在这里找到。",
    "startMs": 16300,
    "endMs": 18035,
    "timestampMs": 16300,
    "confidence": 1
  },
  {
    "text": "点开卡片，攻略步骤直接查看。",
    "startMs": 20900,
    "endMs": 22627,
    "timestampMs": 20900,
    "confidence": 1
  },
  {
    "text": "下次开会员前，先查一下。",
    "startMs": 25100,
    "endMs": 26972,
    "timestampMs": 25100,
    "confidence": 1
  }
];
