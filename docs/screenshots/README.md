# 关键帧索引

2026-09-08 更新，本机 Codex Chromium 浏览器。桌面1280×720；移动390×844。URL参数见动效映射。截图只固定主滚动状态；Pulse使用官方poster，未冒充Rive逐帧复原。

| 文件 | frame | 用途 |
|---|---:|---|
| desktop-hero.png | 0 | 首屏 |
| desktop-transition.png | 1.05 | 场景混合中间态 |
| desktop-sidekick.png | 1.75 | 章节标题 |
| desktop-intro.png | 2.55 | 简介和视频 |
| desktop-paper.png | 3.28 | 纸面内容 |
| mobile-hero.png | 0 | 手机首屏 |
| mobile-transition.png | 1.05 | 手机过渡 |
| mobile-sidekick.png | 1.5 | 手机简介 |
| mobile-paper.png | 3 | 手机纸面 |
| mobile-fallback.png | 0 + fallback | 无主Canvas模式 |

官网原始截图保持在研究目录 `evidence/`，本目录全为本地实现。上述是关键状态抽样，尚未覆盖每个过渡五个进度点、平板和所有移动浏览器；不能据此宣称全面验收。

`desktop-pulse-live.png` 为生产构建实际Rive动画截图，不是固定poster；时间为交互抽样，不用于逐像素帧匹配。
