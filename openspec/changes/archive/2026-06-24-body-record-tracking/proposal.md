## Why

減脂+重訓的核心指標是體重與體脂率的長期趨勢。使用者需要一個地方記錄每日量測數據，並透過視覺化圖表確認自己的進度方向。這是 dashboard 的第一塊核心內容，也是面試展示資料視覺化能力的關鍵頁面。

## What Changes

- 新增 `/dashboard/body` 頁面：用戶可新增體重/體脂率/肌肉量量測記錄
- 新增折線圖：呈現最近 30/90 天體重與體脂率趨勢
- 新增記錄列表：顯示歷史量測數據，可刪除單筆
- 新增 API routes：`POST /api/body-records`、`GET /api/body-records`、`DELETE /api/body-records/[id]`

## Capabilities

### New Capabilities

- `body-record-form`: 用戶填寫當日量測數值（體重、體脂率、肌肉量、備註）並儲存
- `body-record-chart`: 以折線圖呈現體重與體脂率的歷史趨勢，支援 30/90 天切換
- `body-record-list`: 顯示歷史記錄列表，支援刪除單筆記錄

### Modified Capabilities

（無）

## Impact

- **新增頁面**：`src/app/dashboard/body/page.tsx`
- **新增 API**：`src/app/api/body-records/route.ts`、`src/app/api/body-records/[id]/route.ts`
- **新增元件**：`src/components/body/body-record-form.tsx`、`src/components/body/body-trend-chart.tsx`、`src/components/body/body-record-list.tsx`
- **資料庫**：讀寫 `BodyRecord` table（已存在）
- **依賴**：shadcn/ui Chart（Recharts）、date-fns（日期格式化）
