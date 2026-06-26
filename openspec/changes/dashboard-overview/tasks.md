## 1. DashboardStatCard 元件

- [x] 1.1 建立 `src/components/dashboard/dashboard-stat-card.tsx`（Server Component）
  - Props：`label: string`、`value: string`、`icon?: ReactNode`
  - 樣式與 body/workout 頁一致（`bg-gray-900 border-gray-800`）

## 2. DashboardRecentWorkouts 元件

- [x] 2.1 建立 `src/components/dashboard/dashboard-recent-workouts.tsx`（Server Component）
  - Props：`logs: { id, date, exerciseCount, totalSets, duration }[]`
  - 每筆顯示日期、動作數、總組數、時長（若有）
  - 空狀態：顯示「尚無訓練記錄」
  - 超過 3 筆時顯示「查看全部」連結（`/dashboard/workout`）

## 3. DashboardQuickActions 元件

- [x] 3.1 建立 `src/components/dashboard/dashboard-quick-actions.tsx`（Server Component）
  - 兩個按鈕：「＋ 新增訓練」→ `/dashboard/workout/new`、「記錄體重」→ `/dashboard/body`
  - 「新增訓練」用 `bg-orange-500` 主色，「記錄體重」用 `bg-gray-800` 次要色

## 4. Dashboard 頁面組裝

- [x] 4.1 改寫 `src/app/dashboard/page.tsx`（Server Component）
  - `requireAuth()` 取得 session
  - 查詢本週訓練次數：`WorkoutLog.count` where `userId` & `date >= startOfWeek`
  - 查詢最近體重：`BodyRecord.findFirst` orderBy `date desc`
  - 查詢最近 3 筆訓練：`WorkoutLog.findMany` take 3，include exercises + sets（計算 exerciseCount / totalSets）
  - 組裝頁面：標題、StatCard × 2、QuickActions、RecentWorkouts

## 5. Verification（待手動確認）

- [ ] 5.1 有訓練資料時，本週次數正確顯示（手動確認）
- [ ] 5.2 有體重記錄時，最近體重正確顯示（無記錄時顯示 —）（手動確認）
- [ ] 5.3 最近訓練最多顯示 3 筆，超過 3 筆時出現「查看全部」連結（手動確認）
- [ ] 5.4 無訓練資料時，顯示空狀態文字（手動確認）
- [ ] 5.5 快速入口連結導向正確頁面（手動確認）
