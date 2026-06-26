@AGENTS.md

# Fitness Tracker — 專案說明

健身追蹤平台，作為全端面試 Demo 作品。功能涵蓋重訓記錄、飲食追蹤、體重趨勢，設有用戶前台與管理員後台，採 SDD（Spec-Driven Development）開發流程。

---

## 技術棧

| 層級 | 技術 |
|------|------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Neon (Serverless PostgreSQL) |
| ORM | Prisma 7 + `PrismaNeonHttp` adapter |
| Auth | NextAuth.js v5 (Credentials, JWT) |
| Forms | react-hook-form + zod |
| Charts | Recharts（via shadcn/ui Chart） |
| Testing | Vitest + React Testing Library + Playwright |
| Deploy | Vercel |
| Dev Flow | openspec（SDD，`/opsx:propose → apply → archive`） |

---

## 架構決策

### 資料庫連線
本機網路封鎖 port 5432，**無法直接使用 `prisma migrate dev`**。
- Runtime 查詢：`PrismaNeonHttp`（HTTPS port 443，在 `src/lib/prisma.ts`）
- Schema 變更流程：見 `docs/schema-migration.md`

### 認證
- `src/auth.ts`：NextAuth 核心設定，動態 import prisma/bcrypt（避免 Edge runtime 問題）
- `src/auth.config.ts`：Edge-safe 設定（middleware 用）
- `src/middleware.ts`：路由保護 + role-based 導向
  - 未登入 → `/login`
  - `USER` 訪問 `/admin/*` → `/dashboard`
  - `ADMIN` 訪問 `/dashboard/*` → `/admin`

### API 設計
- 所有 API routes 在 `src/app/api/`
- 每個 route 都在 handler 內驗證 session（`await auth()`）
- 資料操作確保 `userId` 隔離，跨用戶存取回傳 403

### 環境變數（`.env`）
```
DATABASE_URL   # Neon pooled（含 -pooler，供 PrismaNeonHttp 使用）
DIRECT_URL     # Neon direct（無 -pooler，備用）
AUTH_SECRET    # NextAuth JWT 簽名金鑰
```

---

## 完成功能

### ✅ 認證系統（`auth-login-register`）
- `/register`：name/email/password 註冊，bcrypt hash（cost 12）
- `/login`：登入後依 role 導向（USER→`/dashboard`，ADMIN→`/admin`）
- `(auth)` route group 共用深色健身風 layout
- `src/lib/auth-helpers.ts`：`requireAuth()` / `requireRole()` Server Component helpers

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
- 注意：NeonHttp 不支援 `$transaction`，改用序列 create + 錯誤補償刪除

---

## 資料庫 Schema 概覽

```
User              # 用戶（role: USER | ADMIN）
Exercise          # 動作庫（肌群、類別）
WorkoutPlan       # 訓練計畫模板
  WorkoutPlanDay        # 計畫中的每天
  WorkoutPlanExercise   # 每天的動作
WorkoutLog        # 實際訓練日誌
  WorkoutLogExercise    # 日誌中的動作
  WorkoutSet            # 每個動作的組/次/重量
FoodEntry         # 飲食記錄（熱量 + 三大營養素）
BodyRecord        # 身體量測（體重、體脂率、肌肉量）
```

---

## MVP 開發路線

### 已完成
- [x] 認證系統（登入/註冊/role guard）
- [x] 體重追蹤（折線圖 + CRUD + 403 保護）

### 下一步（優先順序）
- [x] **訓練日誌** `/dashboard/workout`（已完成）
- [ ] **Dashboard 總覽** `/dashboard`
  - 最近訓練摘要卡片
  - 本週訓練次數、體重變化
  - 快速入口連結
- [ ] **飲食記錄** `/dashboard/food`
  - 每餐熱量 + 三大營養素輸入
  - 每日總計 + 圓餅圖
- [ ] **動作庫瀏覽** `/dashboard/exercises`
  - 依肌群篩選
- [ ] **後台管理**
  - `/admin`：用戶列表、系統統計
  - `/admin/exercises`：動作庫 CRUD

---

## 開發流程

### SDD 工作流程（openspec）
```bash
/opsx:propose "功能描述"   # 建立 proposal → design → specs → tasks
/opsx:apply                # 依 tasks 實作，完成後打勾
/opsx:archive              # 封存 change 到 openspec/changes/archive/
```

### Schema 變更流程（port 5432 封鎖）
詳見 `docs/schema-migration.md`，簡要步驟：
1. 修改 `prisma/schema.prisma`
2. `npx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --script` 產生 SQL
3. 貼到 Neon SQL Editor 執行
4. 產生 `_prisma_migrations` INSERT SQL 並在 Neon 執行
5. `npx prisma generate`

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
│   │   └── workout/      # 訓練日誌頁（含 /new）
│   ├── admin/            # 管理員後台
│   └── api/              # API routes
│       ├── auth/
│       │   ├── [...nextauth]/
│       │   └── register/
│       ├── body-records/
│       ├── exercises/
│       └── workout-logs/
├── components/
│   ├── auth/             # 登入/註冊表單元件
│   ├── body/             # 體重相關元件
│   ├── workout/          # 訓練日誌元件
│   └── ui/               # shadcn/ui 元件
├── lib/
│   ├── prisma.ts         # Prisma singleton（PrismaNeonHttp）
│   └── auth-helpers.ts   # requireAuth / requireRole
├── auth.ts               # NextAuth 設定
├── auth.config.ts        # Edge-safe NextAuth 設定
├── middleware.ts          # 路由保護
└── types/
    └── next-auth.d.ts    # Session type 擴充
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
- `.env` 含 `TEST_USER_EMAIL` 和 `TEST_USER_PASSWORD`
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
