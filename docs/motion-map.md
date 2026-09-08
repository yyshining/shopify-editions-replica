# 动效映射

共同来源为 Lenis 对应的 `scrollY / viewportHeight`，实现于 `lib/motion.ts`。DOM 与 Canvas 接收同一个状态；Theatre 不自主播放。Rive 是独立的可见区域动画，不把它的播放时间误当作主滚动时间。

| 状态 | 当前区间/映射 | 绑定 | 验证等级 |
|---|---|---|---|
| 首屏框淡出/侧栏出现 | s=.1→.65 | opacity | 已运行，节奏待逐帧对齐 |
| Hero→Sidekick | s=.65→1.45 | noise/radial GLSL 双 render target 合成 | 已运行，自写替代 Shader |
| Hero Theatre | 1 + transition×1.6 | Scene/camera、asset-1、asset-2、Scene clip | 原 JSON 加载/运行；映射为推断 |
| Sidekick Theatre | .6 + sidekick×1.9 | camera、asset-1、asset-2、眼睑和环动画 | 原 JSON 加载/运行；映射为推断 |
| Sidekick 局部进度 | clamp((s−1.45)/1.75) | 相机和模型 | 可正反向 seek |
| 纸面 | 桌面起点3.35h，移动3.05h | DOM 文档流 + SVG noise 纸边 | 可运行，非原合成 Shader |
| 文字颜色切换 | 桌面s>3.1，移动s>2.85 | 根节点 data-theme | 已运行 |
| Pulse | 进入可视区域 play，离开 pause | digestMain / State Machine 1 | 外置25项依赖已补齐 |

当前镜头补偿：Hero FOV×.88、targetY+.35、模型X scale×1.15；移动 Sidekick targetX+.45。它们是当前对照实验值，非原站已证实参数。后续应复原原站相机包装器、材质和屏幕空间效果后移除这些补偿再比较。

## 固定截图

`?frame=N` 把场景状态与页面位置设为 N 个视口高度，固定主进度；Rive 显示官方 poster，避免非确定性动画帧。它是验收辅助模式，交互测试必须去掉 frame。

桌面1280×720：Hero=0、过渡=.85/1.05/1.25、Sidekick=1.75、简介=2.55、paper=3.28。移动390×844：Hero=0、Sidekick=1.5、paper=3。

`?fallback` 强制普通图片+DOM，`?qa` 把 RAF 间隔诊断写入 `document.documentElement.dataset.qa`。测量只反映浏览器主线程调度，不等于 GPU 渲染耗时。
