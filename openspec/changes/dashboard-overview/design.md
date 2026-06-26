## Context

`/dashboard` 目前是空白佔位頁（只有登出按鈕）。本次將其升級為有意義的總覽頁。專案已有完整的 Prisma schema、`WorkoutLog` 與 `BodyRecord` 資料，可直接在 Server Component 查詢，不需要新增 API routes。

## Goals / Non-Goals

**Goals:**
- 以最少的元件數量呈現關鍵摘要（本週訓練次數、最近體重、最近 3 筆訓練）
- 與 `/dashboard/body` 和 `/dashboard/workout` 在視覺風格上保持一致（`bg-gray-950`、橘色 accent）
- 快速入口讓用戶一鍵跳轉到常用功能

**Non-Goals:**
- 不做圖表（圖表各在 body/workout 子頁）
- 不新增 API routes（所有資料在 Server Component 取得）
- 不實作即時更新或 polling

## Decisions

### Server Component 直接查詢 Prisma
- 無需 API round-trip，減少 latency
- `requireAuth()` 確保 `userId` 隔離
- 與 `/dashboard/body/page.tsx`、`/dashboard/workout/page.tsx` 一致

### 本週定義：當週週一 00:00 UTC 起
- 用 `date-fns` 的 `startOfWeek({ weekStartsOn: 1 })`
- 與 Neon 時間欄位（UTC 儲存）一致

### 元件拆分策略
- `DashboardStatCard`：純展示，接收 label + value，無 client 邏輯
- `DashboardRecentWorkouts`：訓練摘要列表，無互動（刪除/展開在 workout 子頁）
- `DashboardQuickActions`：Link 按鈕組，純 Server Component
- 三者都是 Server Components（無 useState），由 `page.tsx` 統一組裝資料

### 最近訓練最多 3 筆
- 超過 3 筆不在 Dashboard 顯示，引導用戶至 `/dashboard/workout` 查看完整歷史

## Risks / Trade-offs

- [Neon HTTP cold start] → Dashboard 是首頁，cold start 延遲明顯；接受此限制（Vercel Streaming 可日後優化）
- [本週訓練次數以 `date` 欄位計算] → `WorkoutLog.date` 是用戶填寫的訓練日期（非建立時間），符合用戶預期
