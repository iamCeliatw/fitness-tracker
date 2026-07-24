## 1. Schema Migration（先跑，後面任務依賴）

- [ ] 1.1 撰寫 migration SQL：`OrganizationMember` 加 `UNIQUE("userId")` constraint（`prisma/migrations/20260724000000_org_member_user_unique/migration.sql`）；在 Supabase SQL Editor 執行；確認無 unique violation 錯誤（dev DB 如有多筆同 userId 先清理）
- [ ] 1.2 更新 `prisma/schema.prisma`：`OrganizationMember` 加 `@@unique([userId])`；執行 `npx prisma generate`
- [ ] 1.3 更新 `.env`、`.env.local.example`：加 `BOOTSTRAP_ADMIN_SECRET=`（空值範例）；在 `.env.local` 設定實際測試用 secret；備忘錄：Vercel Dashboard 也需同步（部署前）

## 2. HIGH — 授權漏洞修補

- [ ] 2.1 `src/app/api/admin/members/[id]/route.ts`：PATCH handler fetch 到 target membership 後，加 rank 比較（`ORG_ROLE_RANK[membership.role] >= ORG_ROLE_RANK[ctx.role]` → 403）；瀏覽器用 ADMIN 帳號測試降級 OWNER 被擋，降級 COACH 正常通過
- [ ] 2.2 `src/app/api/appointments/route.ts`：POST handler fetch slot 後，查詢 `OrganizationMember` 確認 user 在 `slot.orgId` 有 membership（任意 role）；無 membership → 403；瀏覽器用跨 org 帳號驗證被擋
- [ ] 2.3 `src/app/api/appointments/route.ts`：POST handler slot claim 改為 conditional UPDATE（`WHERE id=slotId AND status='OPEN'`）；取 count 判斷，0 rows → 409「此時段已被預約」；移除原本的 INSERT slot-status 寫入（改在 conditional UPDATE 完成）
- [ ] 2.4 `src/app/api/auth/register/route.ts`：bootstrap 邏輯改為雙驗——email 吻合 **且** `adminSecret` 吻合 `BOOTSTRAP_ADMIN_SECRET`；`BOOTSTRAP_ADMIN_SECRET` 未設時整段跳過；`registerSchema` 加選填欄位 `adminSecret: z.string().optional()`

## 3. MEDIUM — 邀請碼 Entropy 升級

- [ ] 3.1 `src/lib/invite-code.ts`：`generateInviteCode` 改用 `crypto.getRandomValues(new Uint8Array(16))` 轉 base64url 取前 22 字元（128-bit）
- [ ] 3.2 DB migration：`Organization.inviteCode` 欄位若有長度限制需確認可放 22 字元（TEXT 型態無需改）；dev DB 執行 `UPDATE "Organization" SET invite_code = gen_random_uuid()::text` 替換舊短碼（或重跑 seed）；確認新格式邀請碼可正常加入

## 4. MEDIUM — Onboarding TOCTOU 修補

- [ ] 4.1 `src/app/api/onboarding/route.ts`：`joinOrgAsMember` / `createOrgWithOwner` 的 error handling 加對 Supabase error code `23505`（unique violation）的捕捉，回傳 409「已有 membership」，不拋出 500；確認 `OrganizationMember` 有 Task 1.1 的 unique constraint 才有效

## 5. LOW — 輸入驗證補強

- [ ] 5.1 `src/app/api/auth/register/route.ts`：`registerSchema` 各欄位加上限：`name.max(128)`、`orgName.max(128)`、`password.min(8).max(128)`、`inviteCode` 格式驗（`z.string().max(22)`）
- [ ] 5.2 `src/app/api/onboarding/route.ts`：`onboardingSchema` 加 `orgName.max(128)`、`inviteCode.max(22)`
- [ ] 5.3 `src/app/api/appointments/route.ts`：`bookSchema` 加 `notes: z.string().max(2000).optional()`（INSERT 與 UPDATE 兩個分支均受 schema 控）
- [ ] 5.4 `src/app/api/appointments/[id]/route.ts`：`respondSchema` 加 `reason: z.string().max(1000).optional()`
- [ ] 5.5 `src/app/api/food-entries/route.ts`：GET handler 取 `dateParam` 後驗格式（`/^\d{4}-\d{2}-\d{2}$/`），不符 → 400；確認 `?date=INVALID` 不再拋 500
- [ ] 5.6 `src/app/api/body-records/route.ts`：GET handler `Number(range)` 後加 `if (!Number.isFinite(range)) return 400`；確認 `?range=abc` 不再拋 500

## 6. LOW — 其他安全修補

- [ ] 6.1 `src/app/api/health/route.ts`：移除 `createAdminClient()` 與 User count 查詢，改回傳純 `{ status: "ok" }`；確認 `GET /api/health` 不再洩漏 user 數量
- [ ] 6.2 `src/app/api/slots/[id]/route.ts`：DELETE handler 在 `slot.coachId === user.id` 通過後，加 `getOrgContext('COACH')` 驗現在職級；不符 → 403；測試：降級前後各送一次 DELETE 確認行為差異
