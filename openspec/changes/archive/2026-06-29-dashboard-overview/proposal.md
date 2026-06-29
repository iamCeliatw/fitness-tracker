## Why

目前 `/dashboard` 只有登出按鈕，用戶登入後沒有任何資料摘要，需要一個總覽頁讓使用者快速掌握本週狀況並進入各功能。

## What Changes

- 將 `/dashboard` 從空白佔位頁改為有意義的總覽頁
- 新增「本週訓練次數」統計卡片
- 新增「最近體重」顯示（最新一筆 BodyRecord 的體重值）
- 新增「最近訓練」摘要列表（最多 3 筆 WorkoutLog，顯示日期、動作數、組數、時長）
- 新增快速入口：「新增訓練」連結至 `/dashboard/workout/new`、「記錄體重」連結至 `/dashboard/body`

## Capabilities

### New Capabilities

- `dashboard-stats`: 本週訓練次數 + 最近體重的統計數字卡片
- `dashboard-recent-workouts`: 最近 3 筆訓練的摘要卡片列表
- `dashboard-quick-actions`: 快速入口連結區塊

### Modified Capabilities

（無）

## Impact

- 修改 `src/app/dashboard/page.tsx`（Server Component，直接查詢 Prisma）
- 新增 `src/components/dashboard/` 目錄及相關元件
- 不新增 API routes（資料由 Server Component 直接取得）
- 不影響現有 `/dashboard/body`、`/dashboard/workout` 路由
