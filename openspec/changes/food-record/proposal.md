## Why

目前 `/dashboard/food` 不存在，用戶無法記錄飲食熱量與三大營養素。飲食追蹤是健身平台的核心功能之一，需要在訓練日誌之後補上。

## What Changes

- 新增 `/dashboard/food` 頁面：顯示當日各餐飲食列表、每日總計（熱量 + 蛋白質/碳水/脂肪），以及新增飲食記錄表單
- 新增 API routes：`GET/POST /api/food-entries`、`DELETE /api/food-entries/[id]`
- 新增圓餅圖（Recharts）：當日三大營養素佔比視覺化
- Dashboard 總覽頁新增「今日熱量」StatCard（修改現有 `/dashboard/page.tsx`）

## Capabilities

### New Capabilities

- `food-entry-crud`: 飲食記錄的新增（表單）、列表顯示（依餐別分組）、刪除（AlertDialog 確認）
- `food-daily-summary`: 當日熱量與三大營養素加總，含圓餅圖視覺化
- `food-api`: `GET/POST /api/food-entries`、`DELETE /api/food-entries/[id]`

### Modified Capabilities

（無）

## Impact

- 新增 `src/app/dashboard/food/page.tsx`（Server Component）
- 新增 `src/app/api/food-entries/route.ts` 與 `src/app/api/food-entries/[id]/route.ts`
- 新增 `src/components/food/` 目錄（表單、列表、摘要元件）
- 修改 `src/app/dashboard/page.tsx`：加入「今日熱量」StatCard
- 不新增 DB schema（`FoodEntry` model 已存在）
