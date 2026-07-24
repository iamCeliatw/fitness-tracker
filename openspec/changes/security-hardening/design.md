## Context

本專案的 API 層採用「middleware 只保護頁面路由，所有 `/api/*` 路徑的 auth 由各 route handler 自行負責」的架構（`src/proxy.ts:39`）。Supabase JS client 不支援 transaction，race condition 的防護必須仰賴 DB constraint 或 conditional UPDATE（optimistic concurrency）。Runtime 查詢全用 Supabase client（HTTPS），schema 變更需手動撰寫 SQL 到 Supabase SQL Editor 執行。

現狀問題集中在三層：
1. **授權邏輯缺口**：rank check、org membership check 未完整實作
2. **資料競爭**：check-then-act 非原子操作
3. **輸入驗證**：欄位無上限、query param 未驗格式

## Goals / Non-Goals

**Goals:**
- 修補 14 個獨立程式碼問題（對應 22 個漏洞去重後）
- 每項修補最小化 diff，不改動功能行為
- schema migration 只加 constraint，不刪現有欄位

**Non-Goals:**
- 新增 rate limiting（需要 Redis 或 edge middleware，超出本次範圍）
- F22 overlapping slot race（需 `(coachId, startTime)` unique constraint，影響面較大，列 backlog）
- 前端錯誤訊息調整
- E2E 測試（純安全修補，沒有 UI 行為變更）

## Decisions

### D1：BOOTSTRAP_ADMIN_EMAIL — 加 secret 而非直接移除

**選擇**：保留機制但要求 `BOOTSTRAP_ADMIN_SECRET` env var，register body 需帶 `adminSecret` 欄位與之比對；未設定 `BOOTSTRAP_ADMIN_SECRET` 時 bootstrap 路徑完全靜默跳過（不報錯，不升權）。

**理由**：直接移除會破壞第一次部署的 onboarding 流程。加 secret 保留了工具性，且 secret 不在 git history 裡（env var）。

**替代方案**：Supabase Dashboard 手動設定 — 對 Demo 作品太繁瑣，且需額外文件說明。

### D2：邀請碼格式 — base64url 22 chars（128-bit）

**選擇**：`crypto.getRandomValues(new Uint8Array(16))` → base64url → 取前 22 chars。

**理由**：Web Crypto API 在 Node.js 和 Edge runtime 均可用，不需額外 dependency。base64url 字符集無 `+/=`，URL safe。

**替代方案**：base32（更長但只含大寫字母 + 數字，人眼易讀）— 對機器可讀的邀請碼無明顯優勢。

### D3：Appointment booking atomic — conditional UPDATE on AppointmentSlot

**選擇**：把 `UPDATE AppointmentSlot SET status='BOOKED' WHERE id=? AND status='OPEN'` 設計成「寫入成功才算搶到」。若 `count === 0` 代表已被他人搶走，回 409。

**理由**：Supabase JS client 支援 `.update().eq().eq()` 鏈，可在不用 RPC 的情況下做 optimistic concurrency。

**替代方案**：Supabase RPC/stored procedure — 功能更完整但需額外 migration，本次只修安全問題，保持最小 diff。

### D4：OrganizationMember userId unique constraint

**選擇**：`ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_key" UNIQUE ("userId");`

**理由**：一人一館是設計意圖（`requireOrgRole` 用 `.single()`）。DB-level constraint 讓 check-then-insert 的 TOCTOU window 變成無害——第二個 insert 會收到 `23505` unique violation。

**風險**：若 dev DB 已存在一人多 org 的資料（手動測試殘留），migration 會失敗 → 先 `DELETE FROM "OrganizationMember" WHERE ...` 清理再跑。

## Risks / Trade-offs

- **舊邀請碼失效**：`invite_code` 欄位長度從 8 升到 22，DB 內的現有邀請碼全部作廢，需要 UPDATE 或 reseed。→ seed.ts 重新跑時會帶新格式；現有 dev 測試帳號需手動取新碼。
- **`BOOTSTRAP_ADMIN_SECRET` 需同步到 Vercel env**：若未設定，production 首次部署後需從 Supabase Dashboard 手動設 ADMIN — 在 README / CLAUDE.md 補注。
- **Conditional UPDATE 的 Supabase JS 行為**：`count` 的可靠性取決於 Supabase PostgREST 回傳的 `Prefer: count=exact` header。若版本不支援，需改用 RPC。→ 先以現有 client 實作，若測試時 count 不正確再改 RPC。

## Migration Plan

1. 撰寫 migration SQL（Task 1）並在 Supabase SQL Editor 執行
2. `npx prisma generate`（schema.prisma 加 `@@unique([userId])`）
3. 逐任務修改 API routes（Tasks 2–12）
4. 更新 `invite_code` 欄位長度（`VARCHAR(22)` 或 `TEXT` 已是 TEXT，不需另改）；reseed dev DB 取得新格式邀請碼
5. 在 `.env` / `.env.local.example` 加 `BOOTSTRAP_ADMIN_SECRET`（值留空範例）
6. Vercel Dashboard 補 env var

**Rollback**：所有 API 修改為 backward-compatible（只加 guard 不改 schema 結構），唯一不可逆的是 `OrganizationMember` unique constraint — rollback 需 `ALTER TABLE DROP CONSTRAINT`。
