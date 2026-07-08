## 1. Schema 與 Migration

- [x] 1.1 `prisma/schema.prisma`：`Organization` 加 `inviteCode String @unique`
- [x] 1.2 手寫冪等 migration SQL（加欄位 → 回填隨機 8 碼 → NOT NULL + UNIQUE，不動 membership），存入 `prisma/migrations/`
- [x] 1.3 於 Supabase SQL Editor 執行 migration，確認現有 org 取得 inviteCode
- [x] 1.4 `npx prisma generate` 更新型別

## 2. Auth helpers

- [x] 2.1 `requireOrgRole` 重構：改為「查 user 唯一 membership → 驗角色是否在允許清單」，簽名 `requireOrgRole(...roles: OrgRole[])`，回傳含 `role`
- [x] 2.2 檢查所有既有呼叫端（coach、slots、appointments）行為不變，型別無誤

## 3. 註冊 API 分岔

- [x] 3.1 `POST /api/auth/register`：zod discriminated union（`mode=create`+`orgName` / `mode=join`+`inviteCode`）
- [x] 3.2 join 模式：signUp 前驗邀請碼（trim + 大寫比對），無效回 422；有效則註冊後建 MEMBER membership
- [x] 3.3 create 模式：註冊後建 Organization（含唯一 inviteCode，撞碼重生一次）+ OWNER membership，member 失敗時補償刪除 org
- [x] 3.4 移除「加入最早 org」邏輯

## 4. 註冊 UI

- [x] 4.1 `/register` 表單改 Tabs 二選一（建立健身房 / 我有邀請碼），共用欄位切換不清空，依 mode 切換 orgName / inviteCode 欄位與驗證
- [x] 4.2 瀏覽器目視確認：兩種模式註冊成功導向、無效邀請碼錯誤顯示於欄位下方

## 5. Admin 設定與守門

- [x] 5.1 `/api/admin/settings`：守門改 OWNER membership，GET/PATCH 以 membership `orgId` 查詢（移除無過濾 `.single()`），GET 回傳含 inviteCode
- [x] 5.2 新增邀請碼重置 endpoint（`POST /api/admin/settings/invite-code` 或 PATCH action），僅 OWNER 可呼叫
- [x] 5.3 `/admin` layout 守門改「全域 ADMIN 或 org OWNER」；sidebar 依身分渲染有權限項目
- [x] 5.4 `/admin/settings` 頁加邀請碼卡片：等寬字體顯示 + 複製按鈕（已複製回饋 1.5s）+ 重置按鈕（AlertDialog 確認），卡片 hover/transition 依 harness 規範
- [x] 5.5 瀏覽器目視確認：OWNER 可進 settings、MEMBER 被導回 dashboard、重置後舊碼失效

## 6. E2E 測試

- [x] 6.1 org-onboarding journey spec：建館註冊 → 登入成 OWNER → /admin/settings 看到邀請碼 → 用碼註冊加入成 MEMBER → 重置邀請碼 → 舊碼註冊回 422；開場自癒清除殘留測試帳號/org（不碰既有 test accounts）
- [x] 6.2 無效邀請碼 edge case：422 錯誤顯示於表單、不建立帳號
- [x] 6.3 （併入 6.1 journey，實作時發現獨立 spec 需重複建館成本）
- [x] 6.4 回歸：既有 booking / coach-dashboard / admin settings E2E 全綠（`npm run test:e2e`）
