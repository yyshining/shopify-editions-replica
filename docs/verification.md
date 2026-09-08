# 验证记录

2026-09-08，本机 macOS / Codex 内嵌 Chromium，开发3000端口和构建后Worker3001端口。

## 已验证

- `npx tsc --noEmit` 通过。
- `npx vitest run --config vitest.config.ts`：4/4，覆盖进度边界、可逆seek、纸面终态、降级决策。
- `npm run build` 通过。构建提示大于500KB的分包；详情见 `bundle-sizes.json`。
- 3款原网页字体加载；Hero/Sidekick GLB 经 Draco 解码，KTX2 经 Basis 解码，Theatre JSON 运行，页面 `data-scene=models-ready`。
- Rive 主文件及25项外置依赖加载后出现带图片和英文的卡片。固定截图模式使用官方 poster。
- 搜索 Pulse 出现 Smart suggestions；zzzz 显示无结果；Escape 关闭后焦点回到 Search。
- 移动菜单打开、Sidekick跳转关闭菜单，scrollY=1266 / sectionTop=0（390×844）。
- 视频弹窗打开显示原生媒体控件；关闭逻辑卸载video。未作音轨完整性与全片审看。
- 正反向滚动、本地 #insights 初始跳转、移动到桌面调整尺寸运行。
- `?fallback&frame=0`：主Canvas数量0，普通图片/英文DOM可用；390宽时document.scrollWidth=390，无水平溢出。
- skill quick_validate 通过，并安装到 Codex技能目录。

## 性能与未验证范围

最大的场景分包约1.08MB，gzip约303KB；Rive分包约220KB，gzip约60KB。静态素材另计，见两份manifest。Canvas使用demand渲染、DPR上限1.5；Rive离开视区暂停。

`performance-sample.json`（若存在）来自 `?qa` 的RAF调度采样，包含初次加载/交互间隔，不是GPU帧时或真实手机成绩。当前不宣称60fps达标。真实iOS/Android、网络限速冷启动、context-loss、长时间GPU资源稳定性、减少动效系统设置切换仍待专门测试。

视觉为部分验证：两种视口关键帧已保存，重要差异见 `differences.md`。没有扩展后续章节，也没有把当前样段标为像素级完成。

本机生产采样：1200个RAF间隔，P50=8.3ms，P95=9.2ms，最大24.1ms，观测长任务0；1280×720/DPR1，本地未限速且素材缓存已热。此结果只支持本环境调度表现，不能推导移动设备60fps。生产页图片检查未发现未加载/零尺寸图片。
