# Portfolio release check — 2026-10-08

Scope: package the existing Hero-to-Sidekick sample for a public portfolio repository; restore local preview. No new visual-fidelity claim is made.

- `npm run build`: passed; large client chunk warning remains.
- `npx tsc --noEmit`: passed.
- `npx vitest run --config vitest.config.ts`: 4 tests passed.
- Fresh Playwright check at 1440×900: HTTP 200, scene `models-ready`, no page errors. Hero and Sidekick screenshots saved as `portfolio-hero.png` and `portfolio-sidekick.png`; visually reviewed.
- Existing transition and app-card evidence retained with original capture dates.
- Reference assets attributed; full-page completion and original artwork authorship are not claimed.
