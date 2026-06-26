## Why

重訓記錄是健身追蹤的核心功能，也是面試 Demo 展示「複雜表單 + 巢狀資料結構」能力的最佳頁面。使用者需要記錄每次訓練做了哪些動作、幾組、幾下、幾公斤，並能回顧歷史訓練進度。

## What Changes

- 新增 `/dashboard/workout` 頁面：顯示歷史訓練日誌列表
- 新增 `/dashboard/workout/new` 頁面：填寫當次訓練（日期、動作、組數記錄）
- 新增動作選擇器：從動作庫（Exercise table）篩選並加入訓練
- 新增 API routes：
  - `GET /api/exercises`（動作庫列表，支援 muscleGroup 篩選）
  - `POST /api/workout-logs`（建立完整訓練日誌，含動作與組數）
  - `GET /api/workout-logs`（取當前用戶的歷史日誌，含摘要）
  - `DELETE /api/workout-logs/[id]`（刪除一筆日誌）
- 新增 Prisma seed 腳本：初始化動作庫資料

## Capabilities

### New Capabilities

- `workout-log-form`：用戶填寫日期、備註、動作清單（每個動作含多組重量/次數），一次送出建立完整訓練日誌
- `workout-exercise-picker`：Dialog 選擇器，從動作庫搜尋並按肌群篩選，選取後加入當次訓練
- `workout-log-history`：歷史日誌卡片列表，顯示日期/動作數/總組數摘要，支援展開詳情與刪除

### Modified Capabilities

（無）

## Impact

- **新增頁面**：
  - `src/app/dashboard/workout/page.tsx`
  - `src/app/dashboard/workout/new/page.tsx`
- **新增 API**：
  - `src/app/api/exercises/route.ts`
  - `src/app/api/workout-logs/route.ts`
  - `src/app/api/workout-logs/[id]/route.ts`
- **新增元件**：
  - `src/components/workout/workout-log-form.tsx`
  - `src/components/workout/workout-exercise-picker.tsx`
  - `src/components/workout/workout-set-row.tsx`
  - `src/components/workout/workout-log-card.tsx`
  - `src/components/workout/workout-log-list.tsx`
- **新增 Seed**：`prisma/seed.ts`（初始化常見動作庫）
- **資料庫**：讀寫 `WorkoutLog`、`WorkoutLogExercise`、`WorkoutSet`、`Exercise` table（均已存在）
- **依賴**：無新增（date-fns 已安裝）
