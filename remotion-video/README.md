# 雷价通 PC 网站抖音介绍视频

这是一个独立的 Remotion + React + TypeScript 项目，用于生成 `price.lengziyu.cn` 的竖屏抖音产品介绍视频。画面主体使用线上网站的 PC 深色主题截图，并放入桌面端浏览器窗口中展示。

## 视频规格

- 竖屏 `1080x1920`
- `30fps`
- 时长 `29s`
- Composition ID：`LeijiatongDouyin`
- 输出格式：H.264 MP4

## 运行和导出

```bash
cd remotion-video
npm install
npm run start
```

Remotion Studio 会打开预览页面。选择 `LeijiatongDouyin` 即可预览。

导出 MP4：

```bash
npm run render
```

输出文件：

```text
out/leijiatong-douyin.mp4
```

`npm run render` 会先由 Remotion 输出音视频，再使用 FFmpeg 做响度标准化，目标为约 `-16 LUFS / -1.5 dBTP`，适合短视频平台播放。

生成代表性预览图：

```bash
npm run still
```

## 分镜

- `0-2.5s`：开场标题与网站地址
- `2.5-6s`：订阅价格难对比的痛点
- `6-14s`：PC 会员订阅价格对比页面，地区榜单滚动、最低价和推荐标签高亮
- `14-24.5s`：PC AI 优惠网格慢速滚动，定位最后一篇半价订阅 ChatGPT Plus 卡片，点击放大并进入详情
- `24.5-29s`：PC 首页展示与收藏 CTA

## 线上 PC 截图

线上深色主题截图位于：

```text
public/site-captures/home-dark.png
public/site-captures/subscriptions-dark.png
public/site-captures/subscriptions-900-dark.png
public/site-captures/deals-dark.png
public/site-captures/deal-detail-dark.png
```

会员比价截图使用 `900px` 宽、`100%` 页面比例的线上深色页面；优惠与首页截图使用约 `1200px` 宽的 iPad 尺寸线上页面。这样表格和优惠卡片的字号更饱满。截图被放在桌面浏览器窗口中，并通过底部渐隐遮罩自然融入背景。替换同名 PNG 文件即可更新网站画面。

## 旁白与字幕

- 旁白文案：`src/voiceover.ts`
- 音频生成脚本：`scripts/generate-audio.mjs`
- 自动生成的旁白与字幕时间轴：`src/generatedAudioTimeline.ts`
- 字幕入口：`src/captions.ts`
- 字幕组件：`src/components/Subtitles.tsx`

## 音频资源

项目包含可直接导出的本地音频资源：

```text
public/audio/bgm/tech-light-groove.wav       # 原创轻快科技感 BGM
public/audio/sfx/whoosh.wav                  # 转场
public/audio/sfx/card-pop.wav                # 卡片弹出
public/audio/sfx/number-highlight.wav        # 数字高亮
public/audio/sfx/button-click.wav            # 按钮点击
public/audio/sfx/page-switch.wav             # 页面切换
public/audio/sfx/card-zoom.wav               # 卡片放大
public/audio/voiceover/*.wav                 # 中文男声 TTS 分段旁白
public/audio/manifest.json                   # 音频资源和实测时长清单
```

项目内置的旁白使用 Edge TTS 自然中文男声 `zh-CN-YunyangNeural`，采用精简播音版口播稿。生成后会用 `ffprobe` 读取每句实际时长，并自动更新中文字幕时间轴。BGM、人声和音效通过 `src/components/AudioBed.tsx` 混音：人声为主，BGM 保持低音量，音效只在转场和交互节点短促出现。

音频已经随项目提供，普通预览和导出无需重新生成。需要替换旁白或重新生成全部音频时，可以安装 `edge-tts`，并通过 `EDGE_TTS_BIN` 指定命令位置；未指定时会自动回退到 macOS 系统男声：

```bash
EDGE_TTS_BIN=/path/to/edge-tts npm run audio:generate
```

## 核心组件

```text
src/components/DesktopBrowser.tsx   # PC 浏览器窗口、线上截图、底部渐隐遮罩
src/components/AudioBed.tsx         # BGM、中文旁白、交互音效混音
src/components/SceneTransition.tsx  # 场景淡入淡出与轻微缩放转场
src/scenes/ComparisonScene.tsx      # 会员价格榜单、套餐切换和滚动动画
src/scenes/DealsDesktopScene.tsx    # 优惠网格滚动、卡片放大、详情页进入动画
src/scenes/HomeCtaScene.tsx         # PC 首页展示和最终 CTA
```
