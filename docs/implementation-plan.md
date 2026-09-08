# Hero to Sidekick implementation plan

Approved specification: `../../shopify-winter2026-research/Shopify-Winter2026-复刻说明.md`.

Scope: English Hero, scroll transition, Sidekick introduction, Insights paper content and Pulse demonstration. Remaining chapter links retain the reference destinations. Full-page expansion follows this slice's acceptance. Preserve the current reference identity.

Architecture: React + TypeScript DOM on the Sites Vite/Vinext scaffold. A single R3F Canvas handles scene assets and GLSL transitions. Lenis supplies one progress value; Theatre sequences map that value onto camera/object animation. Native image/DOM fallback remains usable without WebGL. Rive is independently visibility-controlled.

- [ ] Verify/download Hero and Sidekick GLB, KTX2, Theatre JSON, fonts and Pulse Rive. Record source, hash, size, format and parse result in `docs/assets-manifest.json`; keep source evidence outside published output.
- [ ] Establish deterministic desktop/mobile reference states and a motion map. Write tests for section progress clamping, reverse/fast-scroll determinism and reduced-motion quality decisions before implementing `lib/motion.ts`.
- [ ] Build the first coherent DOM slice in `app/page.tsx` / `app/globals.css` using reference fonts and fallback imagery; show one continuous preview after compile succeeds.
- [ ] Implement `components/edition-scene.tsx` and `components/scroll-director.tsx`; validate GLB node/camera bindings against Theatre data; integrate original assets and record any reconstruction.
- [ ] Implement search/menu/video controls and Rive Pulse media with posters, focus restoration and explicit failure handling. Keep future sections linked to the reference, not inert controls.
- [ ] Capture fixed-state desktop/mobile images, compare reference geometry, test scroll/anchor/reverse/menu/modal, reduced motion and forced no-WebGL states; measure frame samples with conditions recorded.
- [ ] Run tests, TypeScript/build and one targeted visual correction round. Write `docs/visual-parameters.md`, `docs/motion-map.md`, `docs/differences.md`, `docs/validation.md` and README build/deployment instructions.
- [ ] Validate/install `shopify-editions-replica` skill. Publish privately through Sites when validated, retaining the local runnable source and evidence.

Boundaries: no customer backend, payment flow, personal portfolio redesign or translation. No scraped analytics, private credentials or third-party tracking in the replica. Assets are research-source originals, not newly licensed artwork; public reuse requires replacing or clearing relevant brand assets.


2026-09-08 checkpoint：工程、原始资源运行、关键帧、skill安装、构建检查完成；像素级收敛与完整性能/故障矩阵仍见 differences.md 和 verification.md，后续章节暂不扩展。
