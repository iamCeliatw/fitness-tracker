## Why

新增訓練表單的動作選擇器只能從預設動作庫挑選，無法新增個人客製動作；組數輸入欄位每組都需手動填入相同數值，重複作業多；Drawer 內容多時高度跳動影響操作體驗。三項都是高頻操作的直接摩擦點。

## What Changes

- 動作選擇 Dialog 新增「建立自訂動作」入口，填入名稱與肌群後儲存至 DB，立即可選用
- `WorkoutSetRow` 新增複製按鈕（出現在第二組起），一鍵帶入上一組的次數與重量
- 動作選擇 Dialog 內容區改為固定高度容器 + overflow-y-auto，Tabs 肌群切換不影響整體高度

## Capabilities

### New Capabilities

- `workout-custom-exercise`: 用戶在動作選擇 Dialog 內建立自訂動作（name + muscleGroup），POST 至 `/api/exercises`，建立後直接加入當次訓練
- `workout-set-copy`: 組數列複製按鈕，從第二組起顯示，點擊帶入上一組的 reps / weight 值
- `workout-picker-fixed-height`: 動作選擇 Dialog 固定高度佈局，分類 Tabs 切換時不改變 Dialog 大小

### Modified Capabilities

- `workout-exercise-picker`: Dialog 新增「+ 自訂動作」入口，列表區固定高度

## Impact

- `src/components/workout/workout-exercise-picker.tsx`：新增自訂動作表單 + 固定高度佈局
- `src/components/workout/workout-set-row.tsx`：新增 `onCopy` prop + 複製按鈕
- `src/components/workout/workout-log-form.tsx`：傳入 `onCopy` 給 `WorkoutSetRow`
- `src/app/api/exercises/route.ts`：確認 POST handler 支援用戶自訂動作（`isCustom: true`，`userId` 關聯）
- `prisma/schema.prisma`：`Exercise` model 可能需要 `userId` 欄位標記自訂動作（需確認現有 schema）
