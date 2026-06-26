## Context

新增訓練表單由三個元件組成：`WorkoutExercisePicker`（Dialog 選動作）、`WorkoutSetRow`（單組輸入列）、`WorkoutLogForm`（主表單）。`Exercise` model 已有 `isCustom: Boolean` 與 `createdById: String?` 欄位，`/api/exercises` 目前只有 GET。

## Goals / Non-Goals

**Goals:**
- 允許用戶在 Dialog 內即時建立自訂動作並加入訓練
- 組數輸入第二組起可一鍵複製上一組數值
- Dialog 高度固定，肌群 Tab 切換不造成跳動

**Non-Goals:**
- 不實作自訂動作的管理頁（編輯/刪除）
- 不對系統預設動作（`isCustom: false`）做任何修改
- 複製按鈕不做跨動作複製（僅複製同動作上一組）

## Decisions

### 自訂動作：POST /api/exercises
`/api/exercises` 新增 POST handler，接收 `{ name, muscleGroup }`，以 `isCustom: true`、`createdById: session.user.id` 寫入 DB。GET 查詢同步改為 OR 條件：`isCustom: false` OR `createdById: userId`，讓每位用戶只看到自己的自訂動作與公共動作庫。

### 自訂動作：Dialog 內聯表單，非新頁面
在 Dialog footer 區加「＋ 新增自訂動作」toggle 按鈕，點擊展開一個兩欄 mini-form（名稱 input + 肌群 select）。送出成功後關閉 mini-form、重新 fetch 動作列表，並直接呼叫 `onSelect` 帶入新動作。這比跳轉新頁面省步驟，符合用戶在填表中途臨時新增的場景。

### 複製按鈕：onCopy callback 由父層提供值
`WorkoutSetRow` 新增 `onCopy?: () => void` prop。`ExerciseSetsBlock` 透過 `getValues` 讀取前一組的 `reps`/`weight`，然後呼叫 `setValue` 填入當前組。只在 `setIndex > 0` 時渲染複製按鈕，setIndex === 0 的第一組不顯示。

### Dialog 固定高度：flex-col + h-[540px]
`DialogContent` 改為 `flex flex-col h-[540px]`，內部分三層：
1. Header + 搜尋欄（固定，不 shrink）
2. Tabs（固定）
3. 動作列表（`flex-1 overflow-y-auto`）
4. Footer：自訂動作 mini-form（`shrink-0`）

高度 540px 在行動裝置 (375px viewport) 仍可 scroll，不超出視窗。

## Risks / Trade-offs

- [自訂動作名稱重複] → 不做 DB unique constraint（允許重複名稱），由用戶自行管理；未來可加 warning
- [GET 查詢增加 OR 條件] → 輕微效能影響，動作庫資料量小（<100 筆），可接受
- [固定 540px 在極小螢幕] → 加 `max-h-[90vh]` 做保底，避免超出視窗
