# Schema Migration 工作流程

## 背景

本機網路封鎖了 PostgreSQL 預設的 port 5432，因此無法直接使用 `prisma migrate dev`。
替代方案：由 Prisma 產生 SQL → 手動貼到 Neon SQL Editor 執行 → 標記 migration 完成。

Runtime 查詢走 `PrismaNeonHttp`（HTTPS port 443），不受此限制影響。

---

## 修改 Schema 的完整步驟

### 1. 修改 `prisma/schema.prisma`

直接編輯 schema，新增或修改 model / enum。

### 2. 產生 migration SQL

```bash
npx prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema prisma/schema.prisma \
  --script
```

> 第一次（從空資料庫）用 `--from-empty` 取代 `--from-migrations prisma/migrations`

### 3. 建立 migration 資料夾與檔案

```bash
# 命名格式：YYYYMMDDHHmmss_描述
mkdir prisma/migrations/20260624120000_your_change_name
# 把步驟 2 的輸出存進去
```

### 4. 到 Neon SQL Editor 執行 SQL

1. 開啟 [Neon Dashboard](https://console.neon.tech)
2. 選擇 `fitness-tracker` 專案 → SQL Editor
3. 貼上步驟 2 的 SQL 並執行

### 5. 產生 migration 追蹤記錄的 SQL

在本機執行以下指令，取得要插入 `_prisma_migrations` 的 SQL：

```powershell
$hash = (Get-FileHash "prisma\migrations\<folder>\migration.sql" -Algorithm SHA256).Hash.ToLower()
$id   = [guid]::NewGuid().ToString()
$name = "<folder_name>"   # 例如 20260624120000_your_change_name
$now  = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss.ffffff+00")

@"
INSERT INTO "_prisma_migrations" ("id","checksum","finished_at","migration_name","logs","rolled_back_at","started_at","applied_steps_count")
VALUES ('$id','$hash','$now','$name',NULL,NULL,'$now',1);
"@
```

### 6. 到 Neon SQL Editor 執行步驟 5 的 INSERT

確保 `_prisma_migrations` 表存在（若沒有，先執行下方建表 SQL）：

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

### 7. 重新產生 Prisma Client

```bash
npx prisma generate
```

---

## 驗證 Migration 狀態

在 Neon SQL Editor 查詢已套用的 migrations：

```sql
SELECT migration_name, finished_at, applied_steps_count
FROM "_prisma_migrations"
ORDER BY started_at;
```

---

## 環境變數說明

| 變數 | 用途 | URL 格式 |
|------|------|---------|
| `DATABASE_URL` | Runtime 查詢（PrismaNeonHttp） | `postgresql://...-pooler...` （含 `-pooler`） |
| `DIRECT_URL` | 備用，目前 migrate 無法直連 | `postgresql://...`（無 `-pooler`） |

---

## 未來改善方向

- 若公司/本機網路改開放 port 5432，可直接執行 `npx prisma migrate dev` 恢復正常流程
- 或使用 GitHub Actions 在 CI 環境自動執行 migration（CI 環境通常不封鎖 port 5432）
