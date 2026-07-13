# 文章素材：add-org-data-scoping（多租戶資料隔離與角色階層）

Ship 日期：2026-07-13 ｜ Branch：`feat/add-org-data-scoping`

## 一句話

多租戶 onboarding 只隔離了「人」，這個 change 補上「資料與 API」的 org 隔離，並把 OrgRole 從精確匹配升級成階層比較。

## 可寫的故事點

### 1. 「隔離了人，忘了隔離資料」的多租戶陷阱
- org-onboarding 上線後 /admin 頁面有守門，但 `/api/admin/members` 等三組 API 還在用全域 ADMIN 驗證、查詢無 org 過濾——OWNER 打不進自己館的 API，反而平台 ADMIN 能看所有館
- 教訓:多租戶要分三層檢查:頁面守門、API 守門、query scope,缺一層就是漏洞

### 2. 單一 role 欄位 + rank 表 = 最便宜的角色階層
- 「館主兼主教練」需求不用多角色欄位:`ORG_ROLE_RANK = { OWNER: 4, ADMIN: 3, COACH: 2, MEMBER: 1 }`,守門從 `role !== "COACH"` 改成 `rank >= rank(minRole)`
- schema 零改動,收緊時只動一張表

### 3. nullable orgId 的三層動作庫
- `orgId=null + isCustom=false` 全域內建 / `orgId=<org>` 館自訂 / `isCustom=true` 個人自訂
- 選擇「全域 seed + org 自訂」而非「每館複製 seed」:零資料遷移、平台更新可同步
- Supabase `.or()` 巢狀條件:`or(and(orgId.is.null,isCustom.eq.false),orgId.eq.X,createdById.eq.me)`

### 4. BREAKING 也是設計:平台 ADMIN 被踢出館內事務
- 全域 ADMIN 失去 members/coach-students API 權限——原行為是缺口不是 feature
- persona 分家後測試帳號也要分家:TEST_ADMIN(平台)與新增的 TEST_OWNER(org 管理者)不能是同一人,否則雙路徑守門測不到平台路徑

### 5. E2E 抓到 spec 自己沒發現的過時斷言
- org-onboarding.spec 斷言「OWNER sidebar 不含成員」——新規格下 OWNER 本來就該管成員,整套 suite 跑下去才紅
- 隔離測試不需要他館登入:service key 直接造 org-B + 動作,斷言本館 member 看不到,測完 FK CASCADE 一鍵清掉

## 數字

- Schema 改動:1 個欄位(Exercise.orgId,nullable,零遷移)
- 6 份 spec(2 新 capability + 4 delta)、15 tasks
- E2E:59/59 綠(新增 5 tests + 改寫 admin-members + 修 org-onboarding 斷言)
- 順手修:npm run lint 從 119 errors(全是 ds-bundle 產物)降到 0 errors
