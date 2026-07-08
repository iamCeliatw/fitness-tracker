-- add-org-onboarding: Organization.inviteCode
-- 冪等設計：可於 Supabase SQL Editor 重複執行

-- 1. 加欄位
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "inviteCode" TEXT;

-- 2. 回填隨機 8 碼（大寫 hex；摻 id 避免同批 random 重複）
UPDATE "Organization"
SET "inviteCode" = upper(substr(md5(random()::text || id), 1, 8))
WHERE "inviteCode" IS NULL;

-- 3. NOT NULL + UNIQUE（index 名稱依 Prisma @unique 慣例）
ALTER TABLE "Organization" ALTER COLUMN "inviteCode" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Organization_inviteCode_key" ON "Organization"("inviteCode");

-- 注意：不升級任何既有 membership 為 OWNER——admin-members E2E 會操作 TEST_ADMIN 的
-- membership 角色（會員↔教練），migration 若寫入 OWNER 會與測試互相覆蓋。
-- 需要讓 demo/production 的管理帳號管理 org 設定時，手動執行（將 email 換掉）：
--   UPDATE "OrganizationMember" m SET "role" = 'OWNER'
--   FROM "User" u WHERE u."id" = m."userId" AND u."email" = '<owner-email>';
