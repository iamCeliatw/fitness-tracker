## 1. 安裝依賴

- [x] 1.1 安裝 `date-fns`（日期格式化）

## 2. API Routes

- [x] 2.1 建立 `src/app/api/body-records/route.ts`：`GET`（取當前用戶記錄）+ `POST`（新增記錄）
- [x] 2.2 GET：驗證登入、讀取 query param `range`（預設 90）、回傳該用戶最近 N 天 BodyRecord 降冪
- [x] 2.3 POST：驗證登入、zod 驗證（weight 必填正數、bodyFat 0–100、date 必填）、`prisma.bodyRecord.create`
- [x] 2.4 建立 `src/app/api/body-records/[id]/route.ts`：`DELETE`（驗證記錄屬於當前用戶後刪除，否則 403）

## 3. Body Record Form 元件

- [x] 3.1 建立 `src/components/body/body-record-form.tsx`（Client Component，react-hook-form + zod）
- [x] 3.2 欄位：date（預填今日）、weight（必填）、bodyFat（選填）、muscleMass（選填）、notes（選填）
- [x] 3.3 送出後呼叫 `POST /api/body-records`，成功後 `router.refresh()`
- [x] 3.4 按鈕 loading state + 錯誤訊息顯示

## 4. Body Trend Chart 元件

- [x] 4.1 建立 `src/components/body/body-trend-chart.tsx`（Client Component，shadcn/ui Chart）
- [x] 4.2 接收 `records` prop（`{ date: string; weight: number | null; bodyFat: number | null }[]`）
- [x] 4.3 渲染 LineChart：X 軸日期、左 Y 軸體重（kg）、右 Y 軸體脂率（%）、Tooltip
- [x] 4.4 資料不足 2 筆時顯示空狀態提示

## 5. Body Record List 元件

- [x] 5.1 建立 `src/components/body/body-record-list.tsx`（Client Component）
- [x] 5.2 以 shadcn/ui Table 顯示：日期、體重、體脂率、肌肉量、操作欄
- [x] 5.3 刪除按鈕搭配 shadcn/ui AlertDialog 二次確認
- [x] 5.4 確認刪除後呼叫 `DELETE /api/body-records/[id]`，成功後 `router.refresh()`
- [x] 5.5 空狀態：顯示「還沒有記錄，新增第一筆吧！」

## 6. 頁面組裝

- [x] 6.1 建立 `src/app/dashboard/body/page.tsx`（Server Component）
- [x] 6.2 呼叫 `requireAuth()` 取得 userId
- [x] 6.3 讀取 `searchParams.range`（預設 90），用 Prisma 取該用戶最近 N 天記錄
- [x] 6.4 轉換為圖表用的序列化格式後傳入元件
- [x] 6.5 頁面佈局：標題 + 30/90 天切換 Tab + 圖表 + 新增表單 + 歷史列表

## 7. Verification

- [x] 7.1 新增 3 筆記錄，確認折線圖出現並正確顯示 ✓
- [x] 7.2 切換 30/90 天，確認圖表資料更新 ✓
- [x] 7.3 刪除一筆記錄，確認列表與圖表同步更新 ✓
- [x] 7.4 確認刪除取消後記錄保留 ✓
- [x] 7.5 確認另一用戶的記錄無法被刪除（403）✓
