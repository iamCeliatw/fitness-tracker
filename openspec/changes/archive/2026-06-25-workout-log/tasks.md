## 1. Seed 動作庫

- [x] 1.1 建立 `prisma/seed.ts`：用逐筆 `create` 插入 23 筆常見動作（涵蓋 CHEST / BACK / SHOULDERS / ARMS / LEGS / CORE / CARDIO）
  - 注：NeonHttp 不支援 transaction，改用個別 create；upsert by name 無法用（name 非 unique）改用 count 檢查
- [x] 1.2 在 `package.json` 新增 `"prisma": { "seed": "npx tsx prisma/seed.ts" }` 及 `"seed"` script
- [x] 1.3 執行 `npx tsx prisma/seed.ts`，確認 23 筆動作成功 seed ✓

## 2. API Routes

- [x] 2.1 建立 `src/app/api/exercises/route.ts`：`GET`（驗證登入、支援 `muscleGroup` query param、回傳 id/name/muscleGroup/category）
- [x] 2.2 建立 `src/app/api/workout-logs/route.ts`：
  - `GET`：驗證登入，取最近 20 筆 WorkoutLog（include exercises + sets），降冪排列
  - `POST`：驗證登入，zod 驗證 payload，序列建立 Log → LogExercise[] → WorkoutSet[]（NeonHttp 不支援 $transaction，改用序列 create + 錯誤時手動 delete 補償）
- [x] 2.3 建立 `src/app/api/workout-logs/[id]/route.ts`：`DELETE`（驗證登入、403 保護）

## 3. WorkoutExercisePicker 元件

- [x] 3.1 建立 `src/components/workout/workout-exercise-picker.tsx`（Client Component）
- [x] 3.2 Props：`open`、`onOpenChange`、`onSelect`、`selectedIds`
- [x] 3.3 掛載時呼叫 `GET /api/exercises`
- [x] 3.4 肌群 Tab 篩選（shadcn/ui Tabs）+ 名稱搜尋（Input）
- [x] 3.5 已選動作顯示為 disabled
- [x] 3.6 空狀態：顯示「動作庫尚無資料，請聯絡管理員」

## 4. WorkoutSetRow 元件

- [x] 4.1 建立 `src/components/workout/workout-set-row.tsx`
- [x] 4.2 欄位：setNumber（唯讀）、reps、weight（step=0.5）、刪除按鈕
- [x] 4.3 接收已 register 的 input props 作為 spread（避免 generic Path 型別複雜度）

## 5. WorkoutLogForm 元件

- [x] 5.1 建立 `src/components/workout/workout-log-form.tsx`（Client Component）
- [x] 5.2 zod schema：date / notes / duration / exercises[].sets[]
- [x] 5.3 `useFieldArray` for exercises；`ExerciseSetsBlock` 內部元件處理 nested sets `useFieldArray`
- [x] 5.4 「新增動作」開啟 WorkoutExercisePicker Dialog
- [x] 5.5 每個動作：名稱 + 肌群 badge、組數列表、新增組/移除動作
- [x] 5.6 送出 → `POST /api/workout-logs` → `router.push('/dashboard/workout')`
- [x] 5.7 loading state + 錯誤訊息

## 6. WorkoutLogCard + WorkoutLogList 元件

- [x] 6.1 建立 `src/components/workout/workout-log-card.tsx`
- [x] 6.2 摘要列：日期、動作數、總組數、時長
- [x] 6.3 展開/收合（本地 useState）
- [x] 6.4 AlertDialog 刪除確認
- [x] 6.5 建立 `src/components/workout/workout-log-list.tsx`，空狀態含「新增訓練」連結

## 7. 頁面組裝

- [x] 7.1 建立 `src/app/dashboard/workout/page.tsx`（Server Component）
- [x] 7.2 建立 `src/app/dashboard/workout/new/page.tsx`

## 8. Verification（待手動確認）

- [ ] 8.1 seed 動作庫後，進入 new 頁面開啟選擇器，確認動作清單正確顯示
- [ ] 8.2 選取 2 個動作，各新增 2–3 組，送出訓練，確認導向歷史頁且新卡片出現
- [ ] 8.3 展開卡片確認動作名稱與組數細節正確
- [ ] 8.4 刪除一筆日誌（確認後），確認卡片消失
- [ ] 8.5 確認取消刪除後日誌保留
- [ ] 8.6 確認另一用戶的日誌無法被刪除（403）
- [ ] 8.7 確認 exercises 為空時無法送出（inline 錯誤出現）
