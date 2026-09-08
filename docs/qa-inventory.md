# 样段验证清单

范围：Hero、Sidekick 标题、简介/视频、Insights/Pulse。后续 11 章只链接官网，不宣称本地完成。

| 可见行为 | 验证方式 | 证据 |
|---|---|---|
| 固定桌面/手机构图 | 1280×720、390×844 的 Hero/Sidekick/paper | screenshots/ |
| 滚动与倒退 | 实际滚动和章节跳转后返回顶部；中间帧 | motion-map.md |
| 移动菜单 | 打开、章节跳转、Escape、恢复焦点 | verification.md |
| 搜索 | Pulse 命中和无结果；关闭恢复焦点 | verification.md |
| 视频 | 打开、播放、关闭 | verification.md |
| 无 GPU / 减少动效 | fallback 参数和媒体查询分支；普通图片保底 | differences.md |
| 性能 | ?qa 记录 RAF 分布、长任务；生产包尺寸 | verification.md |
| 恢复/跳转边界 | 初始 #insights、快速跳转、调整尺寸 | verification.md |

固定帧仅用于视觉重现，关闭交互验收时的 frame 参数。RAF 间隔不是 GPU 时间，也不能代替真实手机测试。
