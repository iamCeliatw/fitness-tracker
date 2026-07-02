## 1. 架構與基礎

- [x] 1.1 建立 `src/app/(marketing)/layout.tsx`（`bg-gray-950 min-h-screen` + landing metadata：title / description / OG）
- [x] 1.2 刪除 `src/app/page.tsx`，建立 `src/app/(marketing)/page.tsx` 骨架（server component，區塊佔位）
- [x] 1.3 建立 `src/components/landing/reveal.tsx`（IntersectionObserver scroll-reveal，JS 未載入時內容可見，尊重 `prefers-reduced-motion`）
- [x] 1.4 瀏覽器目視確認 `/` 渲染深色骨架、未登入不重導

## 2. 區塊實作

- [x] 2.1 `landing-nav.tsx`：sticky nav（logo、錨點連結、登入/免費註冊按鈕、滾動後 backdrop-blur + border）
- [x] 2.2 Hero 區：中文主標題、tagline、雙 CTA、橘色暖光暈截圖區（截圖或 JSX fallback，見 design D5）
- [x] 2.3 `features-data.ts` + 功能介紹區：4 張陣列驅動卡片（訓練日誌、體重趨勢、教練預約、管理後台），含 hover transition
- [x] 2.4 三種角色區（學員／教練／管理員使用情境）
- [x] 2.5 CTA Banner + Footer（含技術棧標示一行）
- [x] 2.6 錨點平滑滾動：`scroll-behavior: smooth` + section `scroll-margin-top`
- [x] 2.7 瀏覽器目視確認：完整滾動一遍，動態滑順、hover 到位、窄螢幕（375px）排版正常

## 3. E2E 測試

- [ ] 3.1 `e2e/landing.spec.ts`：happy path — `/` 渲染 hero 標題與 LIFTLOG logo；「免費開始」CTA 導向 `/register`
- [ ] 3.2 edge case — 錨點導覽「功能」後 4 張功能卡片皆可見；nav「登入」導向 `/login`
- [ ] 3.3 `npm run test:e2e` 全綠（含既有 spec 無回歸）
