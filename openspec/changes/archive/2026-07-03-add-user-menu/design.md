## Context

Dashboard 前台（`/dashboard/*`）由 `dashboard/layout.tsx`（server component）+ `DashboardNav`（client component，desktop 側欄 + mobile bottom tab）組成。目前 nav 只有 4 個固定連結，無用戶資訊、無登出；`logout-button.tsx` 是無人 import 的孤兒元件；`admin-sidebar.tsx` 有一份重複的登出邏輯。`/api/auth/me` 只回 `role/name/email`，查不出「是否為教練」（教練 = `OrganizationMember.role = COACH`，屬 org 層權限，與 `User.role` 是兩層模型）。

設計文件（已與用戶確認）：`docs/superpowers/specs/2026-07-03-add-user-menu-design.md`

## Goals / Non-Goals

**Goals:**
- 用戶在 dashboard 任何頁面都能看到自己的名字與身分（會員／教練），並能登出
- 「預約」「教練」功能有 nav 入口，教練連結依 orgRole 條件顯示
- `/api/auth/me` 提供 `orgRole` 給 client 端使用
- 品牌字全站統一為 LIFTLOG

**Non-Goals:**
- 手機版「我的」獨立頁面、avatar/頭像
- Admin 後台的用戶資訊區塊（admin-sidebar 只改品牌字與登出元件共用）
- 權限模型變更（沿用既有兩層模型）

## Decisions

### D1：用戶資料以 server-side props 傳入 nav（而非 client fetch）
`dashboard/layout.tsx` 本來就是 server component：`requireAuth()` 取 user，平行查 `User.name/role` 與 `OrganizationMember.role`（admin client），組 `{ name, orgRole }` 傳給 `DashboardNav`。
- 否決 client fetch `/api/auth/me`：用戶區塊會先空白再出現（閃爍），多一次 round-trip
- 否決 proxy.ts 注入 header：middleware 已夠複雜，過度設計
- `/api/auth/me` 仍補 `orgRole`：login-form 導向與未來 client 端需要，與 D1 不衝突

### D2：登出統一使用 `logout-button.tsx`
回收孤兒元件作為唯一登出實作，`admin-sidebar.tsx` 內聯的登出邏輯改為 import 同一元件。元件需支援樣式客製（icon + 文字、比照 admin-sidebar 現有 hover pattern）。

### D3：Mobile bottom tab 上限 5 個，第 5 格角色置換
會員：總覽/訓練/體重/飲食/預約；教練：第 5 格改「教練」（教練不需要幫自己預約）。否決 6 tab（過擠）與獨立「我的」頁（scope creep）。

### D4：Mobile 用戶資訊 + 登出放頂部 slim header
新增 `md:hidden` 頂部 header：左 LIFTLOG 品牌、右名字 + badge + 登出 icon。bottom tab 位置有限，不塞登出。

### D5：badge 身分判定
`orgRole === 'COACH'` → 教練；其餘 → 會員。ADMIN 不會進 `/dashboard`（middleware 導向 `/admin`），dashboard badge 不需處理管理員。查不到 `name` 時顯示 email `@` 前綴。

## 互動視覺規格

- Badge：`text-xs px-2 py-0.5 rounded-full border`；會員 `border-gray-700 text-gray-400`、教練 `border-orange-500/40 text-orange-400`
- 登出按鈕/icon：`transition-colors duration-150`，hover `text-gray-400` → `text-white`（比照 admin-sidebar）
- 新增 nav 連結沿用現有 active/hover pattern（active：`bg-gray-800 text-orange-400`；hover：`bg-gray-800/50 text-gray-200`）
- 品牌字：`LIFT<span className="text-orange-500">LOG</span>`，比照 landing `font-black tracking-tight`
- 用戶區塊為靜態顯示，無展開/收合動畫需求

## Risks / Trade-offs

- [layout 每次導航都查兩張表] → 平行查詢（`Promise.all`）；資料量小（單筆 by id），可接受；未來有需要再加 cache
- [教練登入後 mobile 看不到預約 tab] → 設計如此（教練不幫自己預約）；desktop 側欄不受 5 格限制，如未來教練需要預約可在 desktop 顯示
- [admin-sidebar 改用共用登出元件可能改變現有樣式] → LogoutButton 支援 className/樣式客製，E2E 與目視確認 admin 登出不變
- [E2E 與手動測試共用 dev DB] → 本 change 為唯讀 UI 斷言 + 登出流程，無 DB 寫入；locator 圈定在 nav/header 範圍
