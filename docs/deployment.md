# 构建与部署

本工程是 Vinext/Vite Worker 应用，不是直接双击 HTML 的静态文件。`npm ci` 后运行 `npm run build`；本地生产预览为 `npm run start -- --port 3001`。

已建立 Sites 私人项目，`.openai/hosting.json` 保存对应项目标识。发布应使用该项目，不重新创建。部署包由 Sites `package-site.sh` 从已验证的构建输出生成。必须保留 `dist/server/index.js`、客户端静态资源与 hosting metadata。其他宿主需适配 Cloudflare Workers 兼容输出；不能直接把源码目录当静态站部署。

素材路径以 `/assets/` 为根，Draco/KTX2 解码器在 `/decoders/`。子路径部署必须统一调整资源 base。Rive runtime 还会请求其 WASM；离线/严格 CSP 部署应把对应版本 runtime WASM 本地化并验证，当前不宣称完整离线可运行。

发布验证：首页200；字体/GLB/KTX2/RIV/25项外置依赖无404；WebGL失败仍有普通图片与可读DOM；检查隐私访问范围不被改变。
