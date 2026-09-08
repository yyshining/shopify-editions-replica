# 视觉参数

基线：[Shopify Winter 2026 英文官网](https://www.shopify.com/editions/winter2026)，2026-09-07 采集。原始证据在相邻 `shopify-winter2026-research/evidence/`。本地截图是候选实现，不能当作官网证据。

| 项目 | 数值/角色 | 依据 |
|---|---|---|
| 纸色 | #dcdcd0 | 原 CSS |
| 墨色 | #292919 | 原 CSS |
| 浅色文字 | #f7f7ee | 原 CSS |
| NeueMontreal | bold，导航/章节标题 | 原 WOFF2 与 CSS |
| HWCigars | regular，叙述标题/正文 | 原 WOFF2 与 CSS |
| ImperialScript | 装饰首字 | 原 WOFF2 与 CSS |
| 桌面主框 | 342×466，视口居中 | 1280×720 参考截图 |
| 桌面正文 | 左边距 20%，右边距 5% | DOM 取样 |
| 固定侧栏 | x=12，宽145，顶部62 | DOM 取样 |
| Sidekick 标题 | 13.76vw，范围100–220px | 参考字号约176px |
| 叙述标题 | 1280宽时约40.98px，行高.96，字距-.05em | 原 CSS |
| 正文 | 1280宽时约27.25px，行高.97 | 原 CSS |
| 移动正文 | 左右24px，标题30px，正文27px | 当前适配值，待更细官网状态对齐 |

CSS 参数集中于 `app/globals.css`。首屏标题斜体当前由字体合成；原站粒子连线、屏幕空间效果尚未逐像素复原。Three 主场景使用原素材，镜头适配补偿属于本地测量推断，见动效表。
