# Shopify Editions Replica

英文官网 Hero → Sidekick → Insights/Pulse 的可运行样段候选版。整页复刻尚未完成；重要视觉差异见 [差异记录](docs/differences.md)。基线说明在相邻研究目录的 `Shopify-Winter2026-复刻说明.md`。

## 运行

要求 Node.js ≥22.13。

```sh
npm ci
npm run dev
```

开发地址 http://localhost:3000。生产构建与预览：

```sh
npm run build
npm run start -- --port 3001
```

```sh
npx tsc --noEmit
npx vitest run --config vitest.config.ts
```

React 19 + TypeScript + Tailwind 4；Vinext/Vite；Three r181 + R3F 9；Theatre core 0.7.2；Lenis；Rive。没有采用与 React19 peer 冲突的 @theatre/r3f，直接同步 Theatre core。

## 交付文件

- [资源清单](docs/assets-manifest.json)及 [Rive外置依赖](docs/rive-assets-manifest.json)：URL、大小、SHA256。
- [视觉参数](docs/visual-parameters.md)、[动效映射](docs/motion-map.md)、[差异记录](docs/differences.md)。
- [验证记录](docs/verification.md)、[截图索引](docs/screenshots/README.md)。
- [构建部署说明](docs/deployment.md)。

`?frame=0` 等固定状态用于截图；`?fallback` 强制普通图片模式；`?qa` 启用诊断。

## Skill

已创建并安装 `shopify-editions-replica`，可用 `$shopify-editions-replica` 调用。可搬迁的源码包在相邻 `shopify-winter2026-research/skill-package/shopify-editions-replica/`。Skill 不内置 Shopify 素材，先定位项目证据再执行。
