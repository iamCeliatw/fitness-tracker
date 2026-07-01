# Schema Migration 工作流程

## 背景

本機網路封鎖了 PostgreSQL 的 port 5432/6543，因此無法直接使用 `prisma migrate dev`。
替代方案：手動撰寫 migration SQL → 在 **Supabase Dashboard SQL Editor** 執行。

Runtime 查詢走 Supabase JS client（HTTPS），不受此限制影響。

---

## 修改 Schema 的完整步驟

### 1. 修改 `prisma/schema.prisma`

直接編輯 schema，新增或修改 model / enum。

### 2. 手動撰寫 migration SQL

由於 `prisma migrate diff` 需要 shadow database（需直連 PostgreSQL），本機無法使用。
改為手動根據 schema 變更撰寫 SQL，並存到 migration 檔案：

```bash
# 命名格式：YYYYMMDDHHmmss_描述
mkdir prisma/migrations/20260630000000_your_change_name
# 手動撰寫 SQL 存入 migration.sql
```

**撰寫原則：**
- `CREATE TABLE IF NOT EXISTS`（安全）
- `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`（安全）
- `DROP TRIGGER IF EXISTS` 後再 `CREATE TRIGGER`（idempotent）

### 3. 在 Supabase SQL Editor 執行

1. 開啟 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇專案 → **SQL Editor**
3. 貼上 migration SQL 並執行

### 4. 更新 migration 追蹤記錄

在 Supabase SQL Editor 執行以下 INSERT，讓 Prisma 知道此 migration 已套用：

```powershell
$hash = (Get-FileHash "prisma\migrations\<folder>\migration.sql" -Algorithm SHA256).Hash.ToLower()
$id   = [guid]::NewGuid().ToString()
$name = "<folder_name>"   # 例如 20260630000000_your_change_name
$now  = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss.ffffff+00")

@"
INSERT INTO "_prisma_migrations" ("id","checksum","finished_at","migration_name","logs","rolled_back_at","started_at","applied_steps_count")
VALUES ('$id','$hash','$now','$name',NULL,NULL,'$now',1);
"@
```

確保 `_prisma_migrations` 表存在（若沒有先執行）：

```sql
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                  VARCHAR(36)  NOT NULL,
    "checksum"            VARCHAR(64)  NOT NULL,
    "finished_at"         TIMESTAMPTZ,
    "migration_name"      VARCHAR(255) NOT NULL,
    "logs"                TEXT,
    "rolled_back_at"      TIMESTAMPTZ,
    "started_at"          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER      NOT NULL DEFAULT 0,
    PRIMARY KEY ("id")
);
```

### 5. 重新產生 Prisma Client

```bash
npx prisma generate
```

---

## 驗證 Migration 狀態

在 Supabase SQL Editor 查詢已套用的 migrations：

```sql
SELECT migration_name, finished_at, applied_steps_count
FROM "_prisma_migrations"
ORDER BY started_at;
```

---

## 環境變數說明

| 變數 | 用途 |
|------|------|
| `DATABASE_URL` | Supabase pooler（port 6543，pgbouncer），`prisma.config.ts` 使用 |
| `DIRECT_URL` | Supabase direct（port 5432），備用 |
| `SUPABASE_URL` | API endpoint，Supabase JS client 使用 |
| `SUPABASE_SERVICE_ROLE_KEY` | 後端 admin client，繞過 RLS |
| `SUPABASE_ANON_KEY` | 前端匿名 key |
