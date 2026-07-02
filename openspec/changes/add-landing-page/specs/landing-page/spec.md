## ADDED Requirements

### Requirement: 公開存取 landing page
系統 SHALL 在 `/` 提供公開的 landing page，未登入訪客不被重導至 `/login`。

#### Scenario: 未登入訪客瀏覽首頁
- **WHEN** 未登入訪客造訪 `/`
- **THEN** 顯示 landing page，包含 LIFTLOG 品牌 logo 與 hero 主標題，不發生重導

### Requirement: Hero 區與註冊導流
Landing page SHALL 呈現 hero 區：中文主標題、tagline "Track. Train. Transform."、主 CTA（免費開始）與次 CTA（登入）。

#### Scenario: 主 CTA 導向註冊頁
- **WHEN** 訪客點擊 hero 的「免費開始」CTA
- **THEN** 導向 `/register`

#### Scenario: 次 CTA 導向登入頁
- **WHEN** 訪客點擊「登入」按鈕（hero 或 nav）
- **THEN** 導向 `/login`

### Requirement: 功能介紹區（陣列驅動）
Landing page SHALL 顯示功能介紹區，卡片內容由 `features-data.ts` 資料陣列驅動，目前 MUST 包含 4 項：訓練日誌、體重趨勢、教練預約、管理後台。

#### Scenario: 功能卡片完整顯示
- **WHEN** 訪客滾動（或經錨點導覽）至功能介紹區
- **THEN** 4 張功能卡片皆可見，各含 icon、標題與描述

#### Scenario: 新增功能卡片
- **WHEN** 開發者在 `features-data.ts` 陣列新增一筆功能資料
- **THEN** 功能介紹區自動渲染新卡片，無需修改版面元件

### Requirement: 錨點導覽
Sticky nav SHALL 提供區塊錨點連結（功能／角色／開始使用），點擊後平滑滾動至對應區塊，且區塊標題不被 sticky nav 遮擋。

#### Scenario: 錨點平滑滾動
- **WHEN** 訪客點擊 nav 的「功能」連結
- **THEN** 頁面平滑滾動至功能介紹區，區塊標題完整可見

### Requirement: 滾動動態與無障礙
區塊內容 SHALL 以 scroll-reveal 動態進場（opacity + translate，僅 transform/opacity），並 MUST 尊重 `prefers-reduced-motion: reduce`（停用位移動態）。JS 未載入時內容 MUST 仍完整可讀。

#### Scenario: reduced-motion 使用者
- **WHEN** 使用者系統設定 `prefers-reduced-motion: reduce` 並瀏覽 landing page
- **THEN** 內容直接顯示，無位移進場動態

#### Scenario: JS 未載入
- **WHEN** 瀏覽器停用 JavaScript 造訪 `/`
- **THEN** 所有區塊內容仍完整可見

### Requirement: SEO metadata
Landing page SHALL 定義 metadata：title 含「LIFTLOG」、description 描述平台功能，並含 Open Graph 基本欄位。

#### Scenario: 頁面標題
- **WHEN** 訪客造訪 `/`
- **THEN** 文件標題包含「LIFTLOG」
