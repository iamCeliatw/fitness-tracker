-- Exercise 加 orgId：null = 平台全域（內建或個人自訂），有值 = 館自訂
ALTER TABLE "Exercise" ADD COLUMN IF NOT EXISTS "orgId" TEXT REFERENCES "Organization"("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "Exercise_orgId_idx" ON "Exercise"("orgId");
