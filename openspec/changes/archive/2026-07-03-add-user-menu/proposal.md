## Why

Dashboard 前台目前沒有任何用戶身分脈絡與登出入口：用戶看不到自己是誰、是什麼身分（會員／教練），也無法登出（`logout-button.tsx` 是孤兒元件）。同時 `/dashboard/booking` 與 `/dashboard/coach` 功能已完成卻沒有 nav 入口，只能手打網址；品牌字在 dashboard 與 admin 還停留在舊的 FitTracker（landing/auth 已改 LIFTLOG）。

## What Changes

- Dashboard nav 新增用戶資訊區塊：名字 + 身分 badge（會員／教練），desktop 放側欄底部，mobile 新增專用頂部 slim header
- 掛上登出按鈕：回收 `src/components/auth/logout-button.tsx`，desktop 側欄底部與 mobile header 皆有登出入口；`admin-sidebar.tsx` 重複的登出邏輯改為 import 同一元件
- `GET /api/auth/me` 回傳補上 `orgRole`（查 `OrganizationMember`，無記錄則 `null`）
- Nav 新增「預約」連結（所有會員可見）與「教練」連結（僅 `orgRole=COACH` 可見）；mobile bottom tab 上限 5 個，教練的第 5 個 tab 以「教練」取代「預約」
- 品牌統一：`dashboard-nav.tsx` 與 `admin-sidebar.tsx` 的 FitTracker → `LIFT<span>LOG</span>`（比照 landing 寫法）

## Capabilities

### New Capabilities
- `dashboard-user-menu`: Dashboard 用戶資訊區塊（名字 + 身分 badge）、登出入口（desktop 側欄底部 + mobile 頂部 header）、`/api/auth/me` 回傳 `orgRole`

### Modified Capabilities
- `dashboard-shell`: 導覽項目由固定 4 個改為角色條件式（會員 5 個含預約；教練第 5 個為教練連結）；mobile 新增頂部 slim header；品牌字改為 LIFTLOG

## Impact

- **頁面/元件**：`src/app/dashboard/layout.tsx`（server 端查詢 name/orgRole 傳 props）、`src/components/dashboard/dashboard-nav.tsx`（用戶區塊 + 條件連結 + mobile header + 品牌）、`src/components/auth/logout-button.tsx`（回收共用）、`src/components/admin/admin-sidebar.tsx`（品牌字 + 登出改共用元件，spec 需求不變）
- **API**：`src/app/api/auth/me/route.ts` 回傳新增 `orgRole` 欄位（既有欄位不動，非 breaking）
- **DB**：無 schema 變更
- **測試**：新增 E2E spec（會員/教練登入斷言 badge 與連結可見性、登出流程）

設計文件：`docs/superpowers/specs/2026-07-03-add-user-menu-design.md`（已與用戶確認）
