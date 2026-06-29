## Context

`FoodEntry` model 已在 Prisma schema 中定義（date, mealType, name, calories, protein?, carbs?, fat?, amount?, unit?）。目前沒有任何飲食相關的 API 或頁面。UI 風格遵循 body/workout 子頁慣例（`bg-gray-950`、橘色 accent、Server Component 資料取得）。

## Goals / Non-Goals

**Goals:**
- 用戶可記錄每餐（早/午/晚/點心）的食物名稱與熱量/三大營養素
- 顯示當日各餐列表（依 mealType 分組）與每日加總
- 圓餅圖呈現當日三大營養素佔比
- Dashboard 總覽加入「今日熱量」卡片

**Non-Goals:**
- 不做食物資料庫搜尋（用戶手動輸入名稱）
- 不做週/月歷史趨勢圖（body 頁面已有範例，日後可擴充）
- 不做飲食計畫目標設定

## Decisions

### 頁面為 Server Component，表單為 Client Component
與 `/dashboard/body` 一致：`page.tsx` 用 `requireAuth()` + Prisma 直查，`FoodEntryForm` 為 Client Component 透過 API 送出。避免不必要的 API round-trip。

### 查詢範圍：當日（台灣時間 UTC+8）
`FoodEntry.date` 儲存為 UTC，查詢當日資料用 `startOfDay` / `endOfDay`，以 `new Date()` 為準（Neon 儲存 UTC，前端顯示時依 `date` 欄位字串即可）。

### 刪除：AlertDialog 確認，Client Component
與 `BodyRecordList` 模式一致：`FoodEntryList` 為 Client Component，內含 AlertDialog 刪除確認，呼叫 `DELETE /api/food-entries/[id]`，成功後 `router.refresh()`。

### 圓餅圖：Recharts PieChart，僅蛋白質/碳水/脂肪有值時顯示
若當日無任何三大營養素資料（全部為 null/0），顯示空狀態文字而非空圓餅。使用 shadcn/ui Chart wrapper（與 body 頁面的 LineChart 相同套件）。

### API 序列查詢（避免 NeonHttp 並行連線問題）
`page.tsx` 用序列 `await` 取得今日記錄，不用 `Promise.all`（與 dashboard/page.tsx 修復一致）。

### mealType 順序
固定顯示順序：BREAKFAST → LUNCH → DINNER → SNACK，每個 mealType 為一個 section。

## Risks / Trade-offs

- [用戶輸入食物名稱，沒有自動完成] → 接受，MVP 階段手動輸入即可
- [圓餅圖在三大營養素皆為空時無資料] → 顯示空狀態「尚無營養素資料」
- [當日定義以伺服器時間 UTC 為準] → 台灣用戶凌晨 12-8 點顯示的「今日」與台灣時間略差；MVP 接受此限制
