## 1. API Routes

- [x] 1.1 建立 `src/app/api/food-entries/route.ts`：GET（today's entries，支援 `?date=`）+ POST（zod 驗證，建立 FoodEntry）
- [x] 1.2 建立 `src/app/api/food-entries/[id]/route.ts`：DELETE（驗證 userId 歸屬，403 保護）

## 2. 飲食記錄表單元件

- [x] 2.1 建立 `src/components/food/food-entry-form.tsx`（Client Component）
  - 欄位：名稱（必填）、熱量（必填）、餐別 Select（預設 LUNCH）、蛋白質/碳水/脂肪（選填）、日期（預設今日）
  - react-hook-form + zod，POST 後 `router.refresh()`

## 3. 飲食列表元件

- [x] 3.1 建立 `src/components/food/food-entry-list.tsx`（Client Component）
  - Props：`entries: FoodEntry[]`
  - 依 BREAKFAST → LUNCH → DINNER → SNACK 分組，無記錄的餐別不顯示
  - 每筆顯示：名稱、熱量、三大營養素（有值才顯示）
  - 刪除按鈕 + AlertDialog 確認，DELETE API 後 `router.refresh()`
  - 空狀態：「今日尚無飲食記錄，開始記錄第一餐吧」

## 4. 當日摘要元件

- [x] 4.1 建立 `src/components/food/food-daily-summary.tsx`（Server Component）
  - Props：`entries: FoodEntry[]`
  - 顯示熱量/蛋白質/碳水/脂肪加總
  - 圓餅圖（Recharts PieChart）：三大營養素有值才顯示，否則顯示「尚無營養素資料」

## 5. 飲食記錄頁面

- [x] 5.1 建立 `src/app/dashboard/food/page.tsx`（Server Component）
  - `requireAuth()` + 序列 Prisma 查詢今日記錄（不用 Promise.all）
  - 返回連結（← 總覽）
  - 組裝：FoodDailySummary + FoodEntryForm + FoodEntryList

## 6. Dashboard 總覽更新

- [x] 6.1 修改 `src/app/dashboard/page.tsx`：加入今日熱量查詢（序列 await），新增第三個 StatCard「今日熱量」（`Flame` icon）
  - 原本 2 欄 grid 改為 3 欄或維持 2 欄（今日熱量接在體重卡片後，視空間決定）

## 7. E2E 測試

- [x] 7.1 建立 `e2e/food.spec.ts`（E2E 綠燈）
  - Happy path：新增一筆飲食記錄後出現在列表，熱量加總正確
  - Edge case：名稱或熱量為空時表單顯示錯誤，不送出
  - 刪除：AlertDialog 確認後記錄消失
