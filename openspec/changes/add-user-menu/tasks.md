## 1. API 與資料流

- [ ] 1.1 `GET /api/auth/me` 回傳補上 `orgRole`（查 `OrganizationMember`，無記錄回 `null`，既有欄位不動）
- [ ] 1.2 `dashboard/layout.tsx`：`requireAuth()` + 平行查詢 `User.name/role` 與 `OrganizationMember.role`，組 `{ name, orgRole }` props 傳給 `DashboardNav`

## 2. 登出元件共用

- [ ] 2.1 調整 `logout-button.tsx`：支援 icon + 文字版型與 className 客製（比照 admin-sidebar 現有 hover pattern）
- [ ] 2.2 `admin-sidebar.tsx` 移除內聯登出邏輯，改 import `LogoutButton`，目視確認樣式與行為不變

## 3. DashboardNav 改版

- [ ] 3.1 Desktop 側欄：品牌字改 `LIFT<span>LOG</span>`，新增「預約」連結（所有會員）與「教練」連結（僅 `orgRole=COACH`）
- [ ] 3.2 Desktop 側欄底部用戶區塊：名字 + 身分 badge（會員/教練樣式依 design.md 互動視覺規格）+ 登出按鈕，name 空時 fallback email 前綴
- [ ] 3.3 Mobile bottom tab：第 5 格角色置換（會員=預約、教練=教練），維持 5 格上限
- [ ] 3.4 Mobile 頂部 slim header（`md:hidden`）：左 LIFTLOG 品牌、右名字 + badge + 登出 icon；確認主內容 padding 不被 header 遮擋
- [ ] 3.5 `admin-sidebar.tsx` 品牌字改 LIFTLOG

## 4. E2E 測試

- [ ] 4.1 會員 happy path：登入 → nav 顯示名字 + 會員 badge + 預約連結 → 點登出 → 回到 /login
- [ ] 4.2 教練路徑：教練登入 → 教練 badge + 教練連結可見
- [ ] 4.3 Edge case：會員 nav 不顯示教練連結（locator 圈定在 nav 範圍、auto-waiting 斷言）
- [ ] 4.4 `npm run test:e2e` headless 全綠後才打勾本群組
