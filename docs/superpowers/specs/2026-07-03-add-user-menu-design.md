# add-user-menu 設計文件

日期：2026-07-03
狀態：設計已與用戶確認（含三項假設）

## 目標

Dashboard 前台補齊用戶身分脈絡與導覽入口：

1. Nav 加用戶資訊區塊（名字 + 身分 badge：會員／教練）
2. 掛上登出按鈕（回收孤兒元件 `src/components/auth/logout-button.tsx`）
3. `GET /api/auth/me` 回傳補上 `orgRole`
4. Nav 補「預約」「教練」連結（`/dashboard/booking`、`/dashboard/coach` 功能已完成但無入口）
5. 品牌統一：`dashboard-nav.tsx` 與 `admin-sidebar.tsx` 的 FitTracker → LIFTLOG

## 資料流（方案 A：Server-side props）

`src/app/dashboard/layout.tsx`（server component）：

- `requireAuth()` 取得 user
- 平行查詢 `User.name/role` 與 `OrganizationMember.role`（admin client）
- 組出 `{ name, orgRole }` props 傳給 `DashboardNav`

不採 client fetch（會員資訊區塊會閃爍）、不採 middleware header 注入（過度設計）。

`GET /api/auth/me` 同步擴充：回傳加上 `orgRole`（查 `OrganizationMember`，無記錄則 `null`），既有欄位 `role/name/email` 不動。

## Desktop 側欄

- 底部新增用戶區塊：`border-t border-gray-800`，位置比照 `admin-sidebar.tsx` 的登出區
- 內容：名字 + 身分 badge + 登出按鈕
- 登出重用 `logout-button.tsx`；`admin-sidebar.tsx` 內重複的登出邏輯改為 import 同一元件

## Nav 連結（角色條件）

| 連結 | 路徑 | Icon | 顯示條件 |
|------|------|------|----------|
| 預約 | `/dashboard/booking` | CalendarDays | 所有會員 |
| 教練 | `/dashboard/coach` | Users | 僅 `orgRole=COACH`（假設 1，已確認） |

## Mobile

- Bottom tab 上限 5 個（假設 2，已確認）：
  - 會員：總覽／訓練／體重／飲食／預約
  - 教練：第 5 個 tab 改為「教練」（教練不需要幫自己預約）
- 用戶資訊 + 登出不進 bottom tab（假設 3，已確認）：新增 mobile 專用頂部 slim header（`md:hidden`）
  - 左：LIFTLOG 品牌
  - 右：名字 + badge + 登出 icon

## 品牌統一

`dashboard-nav.tsx:28` 與 `admin-sidebar.tsx:31` 的 `Fit<span>Tracker</span>` 改為 landing 現有寫法：

```tsx
LIFT<span className="text-orange-500">LOG</span>
```

字級樣式沿用各自現有 container（`text-lg font-bold tracking-tight` → 對齊 landing 的 `font-black tracking-tight`）。

## 互動視覺規格

- Badge：`text-xs px-2 py-0.5 rounded-full border`
  - 會員：`border-gray-700 text-gray-400`
  - 教練：`border-orange-500/40 text-orange-400`
- 登出按鈕／icon：`transition-colors duration-150`，hover 由 `text-gray-400` → `text-white`（比照 admin-sidebar 現有登出）
- 空狀態：查不到 `name` 時顯示 email 前綴（`@` 之前），不顯示空字串
- 新增的 nav 連結沿用現有 active／hover pattern（`bg-gray-800 text-orange-400` / `hover:bg-gray-800/50 hover:text-gray-200`）

## E2E 測試

- Happy path：會員登入 → 看到名字 + 會員 badge + 預約連結 → 登出 → 回到 `/login`
- 教練路徑：教練登入 → 教練 badge + 教練連結可見
- Edge case：會員 nav 看不到教練連結
- 遵守專案 E2E 三規則：auto-waiting 斷言、開場自癒重置（本 change 為唯讀 UI，無 DB 寫入需求）、locator 圈定在 nav 範圍

## 範圍外（YAGNI）

- 手機版「我的」獨立頁面
- Avatar／頭像上傳
- Admin 後台的用戶資訊區塊（admin-sidebar 只改品牌字 + 登出元件共用）
