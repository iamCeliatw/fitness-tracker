## Why

`/` 目前仍是 create-next-app 的預設模板頁，作為全端面試 DEMO 作品缺了門面：訪客（面試官）第一眼看不到平台是什麼、有哪些功能。需要一個與 app 內部視覺一致的 landing page，讓作品從入口到 dashboard 呈現完整感。

## What Changes

- 以 LIFTLOG 品牌 landing page 取代 `/` 的預設模板
- 新增 `(marketing)` route group 與獨立 layout（深色 gray-950 + orange-500，遵守 layout 分層契約）
- 頁面結構：Sticky Nav、Hero（雙 CTA）、功能介紹區（陣列驅動、可擴充）、三種角色區、CTA Banner + Footer
- 動態效果：CSS-first scroll-reveal（IntersectionObserver `<Reveal>` 元件），零新依賴，尊重 `prefers-reduced-motion`
- 新增 landing page 的 SEO metadata（title / description / OG）
- 新增 E2E 測試 `e2e/landing.spec.ts`

## Capabilities

### New Capabilities
- `landing-page`: 公開行銷首頁 — 品牌呈現、功能介紹、角色情境、註冊/登入導流、滾動動態與無障礙（reduced-motion）行為

### Modified Capabilities

（無 — 不影響既有 capability 的需求）

## Impact

- **程式碼**：`src/app/page.tsx` 移除，改為 `src/app/(marketing)/layout.tsx` + `src/app/(marketing)/page.tsx`；新增 `src/components/landing/`（nav、reveal、features-data 等）
- **路由**：`/` 已是 public path（`src/proxy.ts`），無需改動
- **依賴**：零新增（動態用 CSS + IntersectionObserver）
- **資料庫 / API**：無影響
- **測試**：新增 `e2e/landing.spec.ts`（不需登入帳號）
