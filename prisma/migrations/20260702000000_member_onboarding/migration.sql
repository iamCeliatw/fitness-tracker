-- Member Onboarding Migration
-- 手動於 Supabase Dashboard → SQL Editor 執行（idempotent，可重複執行）
-- 執行前：於 Database → Functions 抄下現行 handle_new_user 定義備查（本檔為 canonical 版本）

-- ─── 1. auth.users → public."User" 同步 trigger（canonical，入版控）───────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."User" (id, email, name, role, "createdAt", "updatedAt")
  VALUES (
    NEW.id::text,
    NEW.email,
    NEW.raw_user_meta_data ->> 'name',
    'USER'::"Role",
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 2. 預設 Organization（不存在才建立）──────────────────────────────────────

INSERT INTO "Organization" (id, name, slug, plan, "bookingCutoffHours", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'LIFTLOG', 'liftlog', 'FREE', 2, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "Organization");

-- ─── 3. 回填：無 membership 的既有 User → 預設 org 的 MEMBER ─────────────────

INSERT INTO "OrganizationMember" (id, role, "joinedAt", "orgId", "userId")
SELECT
  gen_random_uuid()::text,
  'MEMBER'::"OrgRole",
  now(),
  (SELECT id FROM "Organization" ORDER BY "createdAt" ASC LIMIT 1),
  u.id
FROM "User" u
WHERE NOT EXISTS (
  SELECT 1 FROM "OrganizationMember" m WHERE m."userId" = u.id
)
ON CONFLICT ("orgId", "userId") DO NOTHING;

-- ─── 4. Audit trigger 補掛（角色升降與配對操作留痕）───────────────────────────

DROP TRIGGER IF EXISTS audit_org_members ON "OrganizationMember";
CREATE TRIGGER audit_org_members
  AFTER INSERT OR UPDATE OR DELETE ON "OrganizationMember"
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

DROP TRIGGER IF EXISTS audit_coach_students ON "CoachStudent";
CREATE TRIGGER audit_coach_students
  AFTER INSERT OR UPDATE OR DELETE ON "CoachStudent"
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
