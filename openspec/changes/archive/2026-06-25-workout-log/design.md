## Context

`WorkoutLog`、`WorkoutLogExercise`、`WorkoutSet`、`Exercise` table 均已存在於 schema。`Exercise` table 尚無資料，需 seed。使用者已完成登入，session 可透過 `requireAuth()` 取得 userId。

訓練日誌是三層巢狀結構：
```
WorkoutLog（一次訓練）
  └─ WorkoutLogExercise（動作，含 order）
       └─ WorkoutSet（組，含 setNumber / reps / weight）
```

## Goals / Non-Goals

**Goals:**
- 一個畫面完成完整訓練記錄（動作選擇 + 組數輸入），一次 POST 送出
- 動作選擇器支援肌群分類篩選
- 歷史列表以卡片顯示摘要（日期、動作數、總組數），可展開查看每組細節
- 資料依 userId 隔離
- 動作庫預載入常見重訓動作（15–20 筆）

**Non-Goals:**
- 訓練計畫（WorkoutPlan）套用：第一版直接手動選動作，計畫系統留後續
- 即時計時器 / 休息計時
- 動作 1RM 計算或圖表
- 編輯已存在的歷史日誌

## Decisions

### 1. 單頁表單一次 POST（非逐步儲存）

`/dashboard/workout/new` 為 Client Component，整個訓練以本地 state 組裝，最後一次 `POST /api/workout-logs` 送出，server 以 `prisma.$transaction` 依序建立 `WorkoutLog` → `WorkoutLogExercise[]` → `WorkoutSet[]`。

**Alternative**：步驟式建立（先建 Log，再逐一 PATCH 加動作）。  
**選擇理由**：單一 transaction 確保原子性；client state 管理比多次往返更簡單；面試時可清楚展示 Prisma nested create。

### 2. 動作選擇器用 Dialog + 前端篩選

`GET /api/exercises` 一次拉取全部動作（數量有限，< 100 筆），Client 以 `useState` 做肌群篩選 + 名稱搜尋，無需多次 API call。

**Alternative**：Server-side 搜尋 + debounce。  
**選擇理由**：動作庫小，client filter 夠用且 UX 更即時；避免不必要的複雜度。

### 3. 歷史列表：Server Component 取資料

`/dashboard/workout/page.tsx` 為 Server Component，直接用 Prisma 取最近 20 筆日誌（含 include exercises + sets count），序列化後傳給 `WorkoutLogList`（Client Component）。刪除後 `router.refresh()`。

**選擇理由**：與 body-record 頁面模式一致，便於面試說明。

### 4. 組數輸入用 react-hook-form `useFieldArray`

訓練表單中每個動作的組數用 `useFieldArray` 管理，支援動態新增/刪除組。Weight 以 `Float`（kg）儲存，允許 0.5 精度（如 82.5 kg）。

### 5. seed 腳本：`prisma/seed.ts`

預載 20 筆常見動作（涵蓋各 MuscleGroup），以 `upsert` 實現冪等。在 `package.json` 設定 `prisma.seed`，但不加入自動化流程（port 5432 問題）。

## Risks / Trade-offs

- **[Risk]** `Exercise` table 若為空，選擇器顯示空狀態 → 任務中包含 seed 步驟確保有資料。
- **[Trade-off]** 不支援編輯已儲存的日誌 → 接受，面試 Demo 不需要完整 CRUD。
- **[Risk]** `useFieldArray` 巢狀結構（exercises[i].sets[j]）型別較複雜 → 明確定義 zod schema 配合 RHF，避免 `any`。
- **[Trade-off]** 歷史列表只取最近 20 筆，不做分頁 → 接受，Demo 資料量小。
