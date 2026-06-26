## Context

`BodyRecord` table 已存在（欄位：weight、bodyFat、muscleMass、notes、date、userId）。使用者已完成登入，session 可透過 `requireAuth()` 取得 userId。shadcn/ui Chart 元件（底層 Recharts）已安裝。頁面位於 `/dashboard/body`，屬於需登入的前台路由。

## Goals / Non-Goals

**Goals:**
- 提供新增量測記錄的表單（當日日期預填）
- 折線圖顯示體重 & 體脂率趨勢，可切換 30/90 天區間
- 記錄列表依日期降冪排列，支援刪除
- 資料依 userId 隔離，用戶只看自己的資料

**Non-Goals:**
- 圖片/照片對比功能
- 匯出 CSV
- 多指標同時疊加（第一版只顯示體重 + 體脂率）

## Decisions

### 1. Server Component 取資料 + Client Component 互動
`/dashboard/body/page.tsx` 為 Server Component，直接用 Prisma 取最近 90 天資料傳給 Client Component。新增/刪除操作透過 Next.js API routes 處理，Client 完成後 `router.refresh()` 更新畫面。

**Alternative**：全用 Server Actions。  
**選擇理由**：面試時更容易說明 API route 設計；API 設計也為之後 mobile/Flutter 呼叫做準備。

### 2. 圖表資料格式
將 `BodyRecord[]` 在 Server 端轉換為 `{ date: string, weight: number | null, bodyFat: number | null }[]`，Client 直接接收 serializable 資料。

### 3. 日期區間篩選：Query Param
透過 `?range=30` 或 `?range=90` 切換，Server Component 讀取 searchParams 決定查詢天數，Client 以 `<Link>` 切換避免額外 state。

### 4. 刪除確認
使用 shadcn/ui AlertDialog 二次確認後送出 `DELETE /api/body-records/[id]`，防止誤刪。

## Risks / Trade-offs

- **[Risk]** `router.refresh()` 在 Turbopack dev 模式偶爾有 delay → 接受，production 不受影響。
- **[Trade-off]** Server Component 取資料無法做樂觀更新 → 刪除後有短暫 loading，可接受。
- **[Risk]** date-fns 增加 bundle size → 僅用 `format`、`subDays`，tree-shake 後影響極小。
