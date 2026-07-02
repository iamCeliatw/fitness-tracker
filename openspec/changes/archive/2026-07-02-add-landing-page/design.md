## Context

`/` 目前是 create-next-app 預設模板。App 內部（auth、dashboard）已建立一致的深色健身風：gray-950 底、orange-500 強調色、LIFTLOG 品牌（LIFT 白 + LOG 橘）、tagline "Track. Train. Transform."。`src/proxy.ts` 已將 `/` 列為 public path。

使用者已確認的設計方向（詳見 `docs/superpowers/specs/2026-07-02-landing-page-design.md`）：深色一致風、繁體中文文案 + 英文品牌點綴、CSS-first 動態、不過於科技感（不用霓虹漸層／粒子背景／玻璃擬態）。

## Goals / Non-Goals

**Goals:**
- 取代 `/` 預設模板，建立與 app 視覺無縫的品牌 landing page
- 克制優雅的滾動動態（60fps，只動 transform / opacity）
- 功能介紹區由資料陣列驅動，日後新功能只需加陣列元素
- E2E 測試覆蓋（happy path + edge cases）

**Non-Goals:**
- 多語系切換、深淺色主題切換
- 已登入狀態偵測與個人化 nav（維持靜態 CTA）
- 引入動畫函式庫（framer-motion / GSAP）

## Decisions

### D1：Route group `(marketing)` 承載 layout 背景
遵守 harness 分層契約：`bg-gray-950 min-h-screen` 只放 `src/app/(marketing)/layout.tsx`；`page.tsx` 只管內容排版與限寬容器。原 `src/app/page.tsx` 刪除，改為 `src/app/(marketing)/page.tsx`。
（替代方案：直接改寫 root `page.tsx` 並把背景寫在頁面上 → 違反分層契約，否決。）

### D2：CSS-first 動態，零新依賴
`<Reveal>` client 元件用 IntersectionObserver 切換 `opacity-0 translate-y-4` → `opacity-100 translate-y-0`。只動 transform/opacity 保證滑順。
（替代方案：framer-motion +35kB 且易做過頭偏「AI 產品感」；GSAP overkill — 均否決。）

### D3：功能卡片陣列驅動（bento 產品實境格）
`src/components/landing/features-data.ts` 匯出 `features: { title, description, visual, span }[]`，目前 4 筆（訓練日誌、體重趨勢、教練預約、管理後台）。每張卡片嵌入迷你產品 UI 示意（`feature-visuals.tsx`，延續 hero mock 風格）取代抽象 icon，格寬 wide/narrow 交錯（5 欄制 3+2／2+3）。新功能上線 = 加一筆資料，grid 自動排版。
（迭代備註：原 icon 卡片版被使用者評為「AI 感」，2026-07-02 改為 bento 產品實境格。）

### D4：Server component 為主
頁面與各區塊為 server component；client component 僅 `<Reveal>` 與 `<LandingNav>`（需監聽 scroll 狀態切換 backdrop-blur）。

### D5：Hero 截圖素材
實作時用 Playwright 對本機 dashboard 截圖存 `public/landing/`；品質不佳則 fallback 為純 JSX 假 UI 卡片（stat card + 折線示意），不阻塞開發。

## 頁面結構

1. **Sticky Nav**：logo、錨點連結（功能／角色／開始使用）、「登入」ghost 按鈕 → `/login`、「免費註冊」橘色實心 → `/register`
2. **Hero**：大粗體中文標題 + tagline + 雙 CTA + 橘色暖光暈截圖區
3. **功能介紹區**：4 張陣列驅動 bento 卡片（內嵌迷你產品 UI）
4. **三種角色區**：學員／教練／管理員使用情境
5. **CTA Banner + Footer**：footer 含一行技術棧標示（Next.js 16・Supabase・Prisma）

## 互動視覺規格

- 卡片：`transition-colors duration-150 hover:border-orange-500/40`
- 按鈕／連結：至少 `transition-colors`；主 CTA `hover:bg-orange-400`
- Scroll reveal：`opacity-0 translate-y-4` → `opacity-100 translate-y-0`，`duration-500 ease-out`，同區塊卡片 stagger 75ms
- Nav：滾動 > 0 後浮現 `backdrop-blur` + `border-b border-gray-800`，`transition-colors`
- 錨點滾動：`scroll-behavior: smooth` + section `scroll-margin-top` 補償 nav 高度
- 無障礙：`prefers-reduced-motion: reduce` 時停用 reveal 位移與 smooth scroll
- 空狀態：不適用（靜態行銷頁）

## Risks / Trade-offs

- [IntersectionObserver 在 SSR 首屏前不觸發，JS 載入前內容隱形] → `<Reveal>` 初始為可見、僅在 JS 掛載後才套用隱藏＋觀察；或用 `no-js` fallback，確保無 JS 時內容完整可讀
- [Playwright 截圖品質／尺寸不穩定] → D5 已定 fallback 為 JSX 假 UI，不阻塞
- [中文大標在窄螢幕斷行醜] → 用 `text-balance` 與手動 `<br className="hidden sm:block">` 控制

## Migration Plan

純新增頁面（`/` 原本就是廢棄模板），無資料庫、無 API 變更。rollback = revert commit。
