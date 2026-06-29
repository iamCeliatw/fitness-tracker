## 1. Admin Sidebar 元件

- [x] 1.1 建立 `src/components/admin/admin-sidebar.tsx`（Client Component）
  - 寬度 240px，背景 `bg-gray-900 border-r border-gray-800`
  - 頂部：系統名稱 "FitTracker"（logo 佔位）
  - 導覽項目：儀表板（LayoutDashboard icon）、動作庫（Dumbbell icon，/admin/exercises）
  - `usePathname()` 判斷 active 路由 → `text-orange-400 bg-gray-800`
  - Hover：`hover:bg-gray-800 hover:text-white transition-colors duration-150`
  - 底部：`<LogoutButton />` 元件（已存在）

- [x] 1.2 建立 `src/app/admin/layout.tsx`
  - `flex h-screen bg-gray-950 text-white`
  - `<AdminSidebar />` 佔 240px，`hidden md:flex flex-col`
  - `<main class="flex-1 overflow-y-auto">{children}</main>`

## 2. Dashboard Nav 元件

- [x] 2.1 建立 `src/components/dashboard/dashboard-nav.tsx`（Client Component）
  - 4 個導覽項目：總覽（LayoutDashboard, /dashboard）、訓練（Dumbbell, /dashboard/workout）、體重（Weight, /dashboard/body）、飲食（Utensils, /dashboard/food）
  - 桌面左側 nav：`hidden md:flex flex-col w-56 bg-gray-900 border-r border-gray-800`
  - 手機底部 tab：`fixed bottom-0 left-0 right-0 md:hidden flex bg-gray-900 border-t border-gray-800`
  - Active：`text-orange-400 bg-gray-800`（左側 nav），`text-orange-400`（底部 tab）
  - Hover：`hover:bg-gray-800/50 hover:text-gray-200 transition-colors duration-150`
  - 底部 tab item：icon `h-5 w-5` + label `text-xs mt-0.5`，`flex flex-col items-center`

- [x] 2.2 重構 `src/app/dashboard/layout.tsx`
  - `flex min-h-screen bg-gray-950 text-white`
  - 引入 `<DashboardNav />`
  - `<main class="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>`

## 3. 內容寬度調整

- [x] 3.1 更新 `src/app/dashboard/page.tsx`
  - 外層 div：`p-6 max-w-3xl` → `p-6 max-w-5xl mx-auto`
  - 統計卡片 grid：`grid-cols-3` → `grid-cols-1 sm:grid-cols-3`

- [x] 3.2 更新 `src/app/dashboard/body/page.tsx`
  - `p-6 max-w-3xl mx-auto` → `p-6 max-w-5xl mx-auto`

- [x] 3.3 更新 `src/app/dashboard/workout/page.tsx`
  - `p-6 max-w-3xl mx-auto` → `p-6 max-w-5xl mx-auto`

- [x] 3.4 更新 `src/app/dashboard/food/page.tsx`
  - `p-6 max-w-3xl mx-auto` → `p-6 max-w-5xl mx-auto`

- [x] 3.5 更新 `src/app/dashboard/workout/new/page.tsx`（若存在）
  - `max-w-3xl` → `max-w-5xl`

## 4. Admin 頁面調整

- [x] 4.1 更新 `src/app/admin/page.tsx`
  - 移除外層 `min-h-screen bg-gray-950`（已由 layout 提供）
  - 內容 padding：`p-6 lg:p-8`，移除 max-w 限制

## 5. E2E 測試

- [x] 5.1 建立 `e2e/layout-desktop.spec.ts`
  - Happy path：桌面尺寸（1280×720）下，Admin Sidebar 可見、Dashboard 左側 Nav 可見
  - Edge case：手機尺寸（375×812）下，Admin Sidebar 隱藏、Dashboard 底部 Tab 可見
  - Active 狀態：進入 /dashboard/workout，訓練 tab/nav 呈現 orange 樣式
