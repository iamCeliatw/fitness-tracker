# LIFTLOG Landing Page — 設計文件

日期：2026-07-02
狀態：使用者已確認設計方向

## 目標

為 fitness-tracker（LIFTLOG）建立正式 landing page，取代 `/` 的 create-next-app 預設模板。作為全端面試 DEMO 作品的門面：

- 視覺與 app 內部（login / dashboard）一致，整體作品感完整
- 不過於科技感、不 AI 感：不用霓虹漸層、粒子背景、玻璃擬態
- 有克制優雅的動態效果，操作滑順（60fps，只動 transform / opacity）
- 介紹當前功能，版面結構保留擴充彈性

## 已確認的設計決策

| 決策點 | 結論 |
|--------|------|
| 視覺調性 | 深色一致風：gray-950 底 + orange-500 強調色，延續 LIFTLOG 品牌 |
| 文案語言 | 繁體中文 + 英文品牌點綴（LIFTLOG、"Track. Train. Transform."） |
| 動態方案 | CSS-first + IntersectionObserver（`<Reveal>` 元件），零新依賴 |
| 動態否決項 | framer-motion（+35kB、易做過頭）、GSAP scroll-jacking（overkill） |

「不科技感」的替代手法：大膽粗體字排版（呼應 logo 的 font-black）、溫暖橘色光暈、大量留白、真實產品截圖。

## 頁面結構（由上而下）

1. **Sticky Nav**
   - LIFTLOG logo（LIFT 白 + LOG 橘，同 auth layout）
   - 錨點連結：功能／角色／開始使用
   - 右側按鈕:「登入」（ghost → `/login`）、「免費註冊」（橘色實心 → `/register`）
   - 滾動後浮現 `backdrop-blur` + 底部細邊框（`border-gray-800`）
2. **Hero**
   - 超大粗體中文標題（例:「把每一組訓練，都變成看得見的進步」）
   - tagline "Track. Train. Transform."
   - 雙 CTA：免費開始 → `/register`、登入 → `/login`
   - 帶橘色暖光暈（`blur` + `orange-500/20`）的產品截圖區
   - 截圖素材：實作時用 Playwright 對本機 dashboard 截圖存入 `public/landing/`；若品質不佳則 fallback 為純 CSS/JSX 假 UI 卡片（stat card + 折線圖示意），不阻塞開發
3. **功能介紹區**（擴充彈性核心）
   - 卡片由 `src/components/landing/features-data.ts` 陣列驅動
   - 目前 4 張：訓練日誌、體重趨勢、教練預約、管理後台（稽核＋組織設定）
   - 每張：lucide icon、標題、描述
   - 之後加新功能 = 加一個陣列元素，grid 自動排版
4. **三種角色區**：學員／教練／管理員各自的使用情境（展現平台深度）
5. **CTA Banner + Footer**
   - Footer 放一行低調技術棧標示：Next.js 16・Supabase・Prisma

## 架構

- 新增 route group `src/app/(marketing)/`
  - `layout.tsx`：放 `bg-gray-950 min-h-screen`（遵守 harness 分層契約）
  - `page.tsx`：原 `src/app/page.tsx` 移入並重寫，只管內容排版（`max-w-*` 容器）
- 元件放 `src/components/landing/`
  - 頁面為 server component
  - client component 僅兩個：`<Reveal>`（IntersectionObserver scroll-reveal）、`<LandingNav>`（滾動狀態）
- `src/proxy.ts` 已將 `/` 設為 public path，不需改動
- 已登入使用者訪問 `/`：維持靜態 CTA（登入／註冊），不做 session 偵測（YAGNI）

## 互動視覺規格

- 卡片：`transition-colors duration-150 hover:border-orange-500/40`
- 按鈕／連結：至少 `transition-colors`；主 CTA hover 亮度提升（`hover:bg-orange-400`）
- Scroll reveal：`opacity-0 translate-y-4` → `opacity-100 translate-y-0`，`duration-500 ease-out`，同區塊卡片 stagger 75ms
- 錨點滾動：`scroll-behavior: smooth` + section `scroll-margin-top` 補償 sticky nav 高度
- 全部動態尊重 `prefers-reduced-motion: reduce`（媒體查詢下停用 transition/transform）
- 空狀態：不適用（靜態行銷頁）

## SEO / Metadata

- `metadata`：title「LIFTLOG — 健身追蹤平台」、description、OG 基本欄位

## 測試（E2E）

`e2e/landing.spec.ts`（Playwright，不需登入）：

- Happy path：`/` 渲染 hero 標題與 LIFTLOG logo；主 CTA 點擊後導向 `/register`
- Edge case 1：錨點導覽至功能區後，4 張功能卡片皆可見
- Edge case 2：nav「登入」按鈕導向 `/login`

## 不做的事（YAGNI）

- 不做多語系切換
- 不做已登入狀態偵測與個人化 nav
- 不做深淺色主題切換（全站深色）
- 不引入動畫函式庫
