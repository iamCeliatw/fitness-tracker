@AGENTS.md

# Fitness Tracker — 專案說明

健身追蹤平台，作為全端面試 Demo 作品。功能涵蓋重訓記錄、飲食追蹤、體重趨勢，設有用戶前台與管理員後台，採 SDD（Spec-Driven Development）開發流程。

---

## 技術棧

| 層級 | 技術 |
|------|------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma 7（schema 管理 + 型別生成，runtime 查詢用 Supabase client） |
| Auth | Supabase Auth |
| Forms | react-hook-form + zod |
| Charts | Recharts（via shadcn/ui Chart） |
| Testing | Vitest + React Testing Library + Playwright |
| Deploy | Vercel |
| Dev Flow | openspec（SDD，`/opsx:propose → apply → archive`） |

---

## 架構決策

### 資料庫連線
本機網路封鎖 port 5432/6543，**無法直接使用 `prisma migrate dev`**。
- **Runtime 查詢**：Supabase JS client（`createClient` / `createAdminClient`，HTTPS）
- **Schema 管理**：Prisma 只負責 `schema.prisma` 定義與 `prisma generate` 型別生成
- Schema 變更流程：見 `docs/schema-migration.md`

### 認證
- Supabase Auth：email/password 登入，JWT session 存於 cookie
- `src/lib/supabase/server.ts`：`createClient()`（使用者 session）、`createAdminClient()`（service role，繞過 RLS）
- `src/middleware.ts`：路由保護 + role-based 導向
  - 未登入 → `/login`
  - `USER` 訪問 `/admin/*` → `/dashboard`
  - `ADMIN` 訪問 `/dashboard/*` → `/admin`
- `src/lib/auth-helpers.ts`：`requireAuth()` / `requireRole()` / `requireOrgRole()` / `setAuditActor()`

### API 設計
- 所有 API routes 在 `src/app/api/`
- 每個 route 都在 handler 內呼叫 `supabase.auth.getUser()` 驗證身份
- 資料操作確保 `userId` 隔離，跨用戶存取回傳 403
- Supabase JS client 不支援多步驟交易：改用序列 operation + 錯誤補償刪除

### 環境變數（`.env.local`）
```
DATABASE_URL              # Supabase pooler（port 6543，pgbouncer，供 Prisma schema diff）
DIRECT_URL                # Supabase direct（port 5432，備用）
SUPABASE_URL              # Supabase project URL
SUPABASE_ANON_KEY         # 前端匿名 key
SUPABASE_SERVICE_ROLE_KEY # 後端 service role key（繞過 RLS）
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
TEST_USER_EMAIL / TEST_USER_PASSWORD    # E2E 測試帳號（MEMBER）
TEST_COACH_EMAIL / TEST_COACH_PASSWORD  # E2E 測試帳號（COACH）
TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD  # E2E 測試帳號（ADMIN）
```

---

## 完成功能

### ✅ 認證系統（`auth-login-register`）
- `/register`：name/email/password 註冊，Supabase Auth signUp
- `/login`：登入後依 role 導向（USER→`/dashboard`，ADMIN→`/admin`）
- `(auth)` route group 共用深色健身風 layout

### ✅ 體重追蹤（`body-record-tracking`）
- `/dashboard/body`：體重/體脂率/肌肉量量測記錄
- 折線圖（Recharts）：體重 + 體脂率雙 Y 軸，支援 30/90 天切換（query param）
- 歷史列表 + AlertDialog 刪除確認
- API：`GET/POST /api/body-records`、`DELETE /api/body-records/[id]`

### ✅ 訓練日誌（`workout-log`）
- `/dashboard/workout`：歷史訓練日誌列表（卡片展開/收合）
- `/dashboard/workout/new`：新增訓練表單（動作選擇器 + 動態組數）
- 動作選擇 Dialog：肌群 Tab 篩選 + 名稱搜尋，防重複加入
- `useFieldArray` 巢狀結構管理 exercises → sets
- API：`GET/POST /api/workout-logs`、`DELETE /api/workout-logs/[id]`、`GET /api/exercises`
- `prisma/seed.ts`：23 筆動作庫初始資料（`npx tsx prisma/seed.ts`）

### ✅ Phase 2：教練預約系統（`add-coach-booking-system`）
- `/dashboard/booking`：學員瀏覽可預約時段、查看自己的預約
- `/dashboard/coach`：教練 Dashboard（學員本週進度 + 本週行程 + 新增時段）
- `/admin/settings`：Org 設定（預約截止時間 `bookingCutoffHours`）
- `/admin/audit-logs`：稽核紀錄（Supabase DB Trigger 自動寫入）
- API：`/api/slots`、`/api/appointments`、`/api/admin/settings`、`/api/admin/audit-logs`

---

## 資料庫 Schema 概覽

```
User                  # 用戶（role: USER | ADMIN）
Organization          # 租戶（bookingCutoffHours）
OrganizationMember    # 用戶↔組織關係（OrgRole: OWNER|ADMIN|COACH|MEMBER）
CoachStudent          # 教練↔學員配對
Exercise              # 動作庫（肌群、類別）
WorkoutPlan / WorkoutPlanDay / WorkoutPlanExercise  # 訓練計畫
WorkoutLog / WorkoutLogExercise / WorkoutSet        # 訓練日誌
FoodEntry             # 飲食記錄（熱量 + 三大營養素）
BodyRecord            # 身體量測（體重、體脂率、肌肉量）
AppointmentSlot       # 教練可預約時段（OPEN|BOOKED|CANCELLED）
Appointment           # 學員預約記錄（CONFIRMED|CANCELLED）
AuditLog              # 稽核 log（由 DB Trigger 自動寫入）
```

---

## 開發流程

### SDD 工作流程（openspec）
```bash
/opsx:propose "功能描述"   # 建立 proposal → design → specs → tasks
/opsx:apply                # 依 tasks 實作，完成後打勾
/opsx:archive              # 封存 change 到 openspec/changes/archive/
```

### Schema 變更流程
詳見 `docs/schema-migration.md`，簡要步驟：
1. 修改 `prisma/schema.prisma`
2. 手動撰寫 migration SQL（`prisma migrate diff` 需 shadow DB，本機無法用）
3. 在 **Supabase Dashboard → SQL Editor** 執行
4. `npx prisma generate`

### 啟動開發伺服器
```bash
npm run dev   # http://localhost:3000
```

---

## 目錄結構重點

```
src/
├── app/
│   ├── (auth)/           # 登入/註冊 route group
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/        # 用戶前台
│   │   ├── body/         # 體重追蹤頁
│   │   ├── workout/      # 訓練日誌頁（含 /new）
│   │   ├── booking/      # 學員預約頁
│   │   └── coach/        # 教練 Dashboard
│   ├── admin/            # 管理員後台
│   │   ├── settings/     # Org 設定
│   │   └── audit-logs/   # 稽核紀錄
│   └── api/              # API routes
│       ├── auth/register/
│       ├── body-records/
│       ├── exercises/
│       ├── workout-logs/
│       ├── slots/
│       ├── appointments/
│       └── admin/
├── components/
│   ├── auth/             # 登入/註冊表單元件
│   ├── body/             # 體重相關元件
│   ├── workout/          # 訓練日誌元件
│   ├── booking/          # 預約相關元件
│   ├── coach/            # 教練 Dashboard 元件
│   ├── admin/            # 管理後台元件
│   └── ui/               # shadcn/ui 元件
├── lib/
│   ├── supabase/
│   │   └── server.ts     # createClient / createAdminClient
│   └── auth-helpers.ts   # requireAuth / requireRole / requireOrgRole / setAuditActor
└── middleware.ts          # 路由保護
```

---

## 開發防護網 (Harness) — 必須遵守的規則

### UI 與樣式防呆

**開始寫任何新頁面或元件之前：**
- 開啟一個同類型的現有頁面確認 className pattern，不憑記憶
- 分層契約（違反視為 bug）：
  - **背景色 / min-h-screen** → 只放在 `layout.tsx`，頁面 component 不碰
  - **內容限寬** → 頁面 component 只寫 `p-6 max-w-3xl mx-auto`，兩者永遠分開
  - 凡同一個 div 同時有 `bg-*` 和 `max-w-*`/`mx-auto` → 立即拆開

**寫任何可互動的 UI 元件時，必須同步加上：**
- 卡片：`transition-colors duration-150 hover:border-gray-700`
- 按鈕 / 連結：至少有 `transition-colors`
- 展開/收合：用 `grid-rows-[0fr]/[1fr]` + `transition-all duration-200`，禁止直接條件渲染造成跳閃

### 測試覆蓋規則

| 情境 | 規則 |
|------|------|
| 新功能（新頁面 / 新 API route） | 必須在同一個 change 的 tasks.md 內含 E2E 測試任務 |
| Bug 修復 | 先寫能重現 bug 的測試，修完確認測試變綠 |
| 純樣式修改 | 不需要測試 |

- `tasks.md` 最後一個任務群永遠是「E2E 測試」，不是「手動驗證 checklist」
- `- [x]` 只有在 `npm run test:e2e` 綠燈後才能打勾
- 每個 E2E spec 至少包含：happy path + 1 個 edge case（空狀態或驗證失敗）

**測試環境基線（每個新環境確認一次）：**
- `npx playwright install chromium` 已執行
- `.env.local` 含 `TEST_USER_EMAIL`、`TEST_USER_PASSWORD`、`TEST_COACH_EMAIL`、`TEST_COACH_PASSWORD`、`TEST_ADMIN_EMAIL`、`TEST_ADMIN_PASSWORD`
- `npm run test:e2e` headless 跑通才算就緒

### 開發節奏

每個任務的執行步驟（不可跳過）：
```
實作一個任務 → 瀏覽器目視確認（或跑相關測試） → tasks.md 打勾 → 再開始下一個任務
```

**遇到以下情況必須暫停，不可自行假設繼續：**
- 即將建立新的目錄或路徑結構 → 先確認命名與現有結構一致
- 即將改動兩個以上頁面 → 先確認相依性，能否分批
- Spec 沒有明確說明互動視覺細節（hover、動畫、空狀態）→ 先問
- TypeScript 出現型別錯誤 → 立即修，不往下繼續

**design.md 必須包含「互動視覺規格」段落**，說明 hover、transition、空狀態呈現方式，實作時一次到位。

### 實作前置確認（每個 Change 開始前）

設計確認後、執行 `/opsx:apply` 前，必須完成以下四項檢查：

| 時機 | 要做的事 |
|------|---------|
| 每次新 change | 切功能分支：`git checkout -b feat/<change-name>`（設計確認後立刻切，不等到開始寫 code） |
| Schema 有改動 | **不使用** `prisma migrate diff`（需要 shadow DB，本機無法連）→ 手動撰寫 SQL → Supabase SQL Editor 執行 |
| 新功能引入新 OrgRole | 同步在 `.env` 範本 + `.env.local` 補上對應的 `TEST_<ROLE>_EMAIL` / `TEST_<ROLE>_PASSWORD` |
| 技術遷移（換 DB / Auth library） | 跑 `grep -r "import.*<舊套件名>" src/` 確認無殘留 import → `npm uninstall` 相關套件 |

缺少任何一項 → 補足後才開始實作，不可假設「之後再補」。
