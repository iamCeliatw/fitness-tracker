-- ============================================================
-- Step 1: 執行 prisma/migrations/.../migration.sql 建立表格
-- (在 Supabase SQL Editor 貼入 migration.sql 的內容先跑)
-- ============================================================

-- ============================================================
-- Step 2: 新增 RBAC 相關表格
-- ============================================================

-- OrgRole enum
CREATE TYPE "OrgRole" AS ENUM ('OWNER', 'ADMIN', 'COACH', 'MEMBER');

-- Organization (租戶)
CREATE TABLE "Organization" (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  plan       TEXT NOT NULL DEFAULT 'FREE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- OrganizationMember (角色橋接)
CREATE TABLE "OrganizationMember" (
  id       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  role     "OrgRole" NOT NULL DEFAULT 'MEMBER',
  "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "orgId"  TEXT NOT NULL REFERENCES "Organization"(id) ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  UNIQUE ("orgId", "userId")
);

-- CoachStudent (教練 ↔ 學員)
CREATE TABLE "CoachStudent" (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  status      TEXT NOT NULL DEFAULT 'ACTIVE',
  "assignedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "coachId"   TEXT NOT NULL REFERENCES "User"(id),
  "studentId" TEXT NOT NULL REFERENCES "User"(id),
  "orgId"     TEXT NOT NULL REFERENCES "Organization"(id),
  UNIQUE ("coachId", "studentId", "orgId")
);

-- ============================================================
-- Step 3: auth.users → public.User 同步 Trigger
-- (新用戶透過 Supabase Auth 註冊時，自動建立 public.User)
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public."User" (id, email, name, role, "createdAt", "updatedAt")
  VALUES (
    NEW.id::text,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    'USER',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- ============================================================
-- Step 4: RLS Policies
-- ============================================================

-- 啟用 RLS
ALTER TABLE "BodyRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkoutLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FoodEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkoutPlan" ENABLE ROW LEVEL SECURITY;

-- BodyRecord：本人 + 指派教練 + Org Admin 可讀
CREATE POLICY "body_records_own" ON "BodyRecord"
  FOR ALL USING ("userId" = auth.uid()::text);

CREATE POLICY "body_records_coach" ON "BodyRecord"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "CoachStudent" cs
      WHERE cs."coachId" = auth.uid()::text
        AND cs."studentId" = "BodyRecord"."userId"
        AND cs.status = 'ACTIVE'
    )
  );

-- WorkoutLog：同邏輯
CREATE POLICY "workout_logs_own" ON "WorkoutLog"
  FOR ALL USING ("userId" = auth.uid()::text);

CREATE POLICY "workout_logs_coach" ON "WorkoutLog"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "CoachStudent" cs
      WHERE cs."coachId" = auth.uid()::text
        AND cs."studentId" = "WorkoutLog"."userId"
        AND cs.status = 'ACTIVE'
    )
  );

-- FoodEntry：同邏輯
CREATE POLICY "food_entries_own" ON "FoodEntry"
  FOR ALL USING ("userId" = auth.uid()::text);

CREATE POLICY "food_entries_coach" ON "FoodEntry"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "CoachStudent" cs
      WHERE cs."coachId" = auth.uid()::text
        AND cs."studentId" = "FoodEntry"."userId"
        AND cs.status = 'ACTIVE'
    )
  );

-- ============================================================
-- Step 5: Re-run seed (在本地跑)
-- npx tsx prisma/seed.ts
-- ============================================================
