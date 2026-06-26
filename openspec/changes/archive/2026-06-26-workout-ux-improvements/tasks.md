## 1. Dialog 固定高度（最小侵入，先做）

- [x] 1.1 改寫 `WorkoutExercisePicker` DialogContent：加 `flex flex-col h-[540px] max-h-[90vh]`，動作列表區改為 `flex-1 overflow-y-auto`，移除現有 `max-h-72`

## 2. 組數複製按鈕

- [x] 2.1 `WorkoutSetRow` 新增 `onCopy?: () => void` prop，在 `setIndex > 0`（由父層控制是否傳入）時於刪除按鈕左側渲染 `Copy` icon button（`h-8 w-8 text-gray-600 hover:text-blue-400`）
- [x] 2.2 `ExerciseSetsBlock`（`workout-log-form.tsx`）：取得 `getValues` 與 `setValue`，在 `setIndex > 0` 時傳入 `onCopy`，讀取 `exercises.${exerciseIndex}.sets.${setIndex - 1}` 的值並寫入當前組

## 3. 自訂動作 API

- [x] 3.1 `src/app/api/exercises/route.ts` 新增 POST handler：驗證 session，接收 `{ name, muscleGroup }`，以 `isCustom: true`、`createdById: userId` 建立 Exercise，回傳 201
- [x] 3.2 GET handler 加入 OR 條件：`{ OR: [{ isCustom: false }, { createdById: userId }] }`，讓每位用戶看到公共 + 自己的自訂動作

## 4. Dialog 自訂動作 mini-form

- [x] 4.1 `WorkoutExercisePicker` 新增 `showCustomForm` state（boolean），Dialog 底部加「＋ 新增自訂動作」toggle 按鈕
- [x] 4.2 展開時顯示 mini-form：名稱 Input + 肌群 Select（使用既有的 MUSCLE_LABELS，排除 ALL）+ 送出 Button
- [x] 4.3 送出時 POST `/api/exercises`，成功後：關閉 mini-form、重新 fetch 動作列表、直接呼叫 `onSelect` + `onOpenChange(false)`
- [x] 4.4 名稱為空時 Button disabled，不送出

## 5. E2E 測試

- [x] 5.1 `e2e/workout-ux.spec.ts`：Dialog 固定高度 — 切換肌群 Tab 後 Dialog 高度不變（snapshot 或 boundingBox 比對）
- [x] 5.2 複製按鈕 — 第一組不顯示，第二組點擊後欄位值與第一組相同
- [x] 5.3 自訂動作 — 新增自訂動作後立即加入訓練，再次開啟 Dialog 列表中可見
