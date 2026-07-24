-- Add UNIQUE constraint on userId to enforce one-org-per-user rule at DB level.
-- Run in Supabase Dashboard > SQL Editor.
-- Before running: verify no duplicate userId rows exist:
--   SELECT "userId", COUNT(*) FROM "OrganizationMember" GROUP BY "userId" HAVING COUNT(*) > 1;
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_key" UNIQUE ("userId");
