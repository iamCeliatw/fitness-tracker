## Context

現有 dashboard layout 只有背景色包裝，無導覽元素。Admin 無 layout。所有頁面內容限寬 `max-w-3xl`，在 1440px 螢幕上兩側各留 ~336px 空白，視覺上偏窄。作品集需在電腦螢幕上展示企業感。

## Goals / Non-Goals

**Goals:**
- Admin 後台加入固定左側 Sidebar（240px），手機隱藏
- Dashboard 加入桌面左側迷你 nav + 手機底部 tab bar
- 所有 user 頁面內容寬度調整為 `max-w-5xl`
- 統計卡片支援 RWD grid（手機 1 欄 → 桌面 3 欄）
- 所有互動元素有 hover/active transition

**Non-Goals:**
- Admin Sidebar 折疊/展開（Phase 2）
- 用戶頭像、通知鈴鐺等頂部 bar 功能
- Dark/light mode 切換

## Decisions

### D1：Admin Sidebar — 固定 240px，不折疊
- 選項 A：固定 240px，永遠展開 ← **選此**
- 選項 B：icon-only 64px + hover 展開

理由：Demo 展示時固定寬度視覺最清晰，折疊邏輯增加複雜度但 demo 效益低。

**Sidebar 結構：**
```
src/app/admin/layout.tsx       ← Server Component，flex h-screen
src/components/admin/admin-sidebar.tsx  ← Client Component（usePathname 做 active 狀態）
```

**Layout 骨架：**
```
<div class="flex h-screen bg-gray-950">
  <AdminSidebar />                          <!-- 240px, sticky, hidden md:flex -->
  <main class="flex-1 overflow-y-auto">
    {children}
  </main>
</div>
```

手機（< md）：Sidebar `hidden`，children 全寬顯示（無 nav，admin 不需手機 nav）。

---

### D2：Dashboard Shell — 左側迷你 nav（桌面）+ 底部 tab（手機）
- 選項 A：同 Admin 做完整 sidebar ← 過重，dashboard 頁面少
- 選項 B：迷你 nav（icon + 小字）桌面，底部 tab 手機 ← **選此**

**Nav 項目：** 總覽、訓練、體重、飲食（4 項）

```
src/app/dashboard/layout.tsx   ← 重構，加入 DashboardNav
src/components/dashboard/dashboard-nav.tsx  ← Client Component（usePathname）
```

**Layout 骨架：**
```
<div class="flex min-h-screen bg-gray-950">
  <!-- 桌面左側 nav，手機隱藏 -->
  <nav class="hidden md:flex flex-col w-56 ...">...</nav>

  <!-- 主內容 -->
  <main class="flex-1 pb-16 md:pb-0 overflow-y-auto">
    {children}
  </main>

  <!-- 手機底部 tab bar -->
  <nav class="fixed bottom-0 left-0 right-0 md:hidden ...">...</nav>
</div>
```

---

### D3：內容寬度
- Dashboard 所有頁面：`max-w-3xl` → `max-w-5xl`，padding 維持 `p-6`
- Admin 主內容：移除 max-w 限制，改用 `p-6 lg:p-8`（sidebar 已提供視覺邊界）

---

### D4：統計卡片 RWD
```
<!-- 手機：1欄，平板+：3欄 -->
<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
```

## 互動視覺規格

| 元素 | 正常 | Hover | Active（當前路由） |
|------|------|-------|-------------------|
| Sidebar nav item | `text-gray-400` | `bg-gray-800 text-white` | `bg-gray-800 text-orange-400` |
| Bottom tab item | `text-gray-500` | `text-gray-300` | `text-orange-400` |
| 所有 transition | — | `transition-colors duration-150` | — |

Sidebar icon 大小：`h-5 w-5`（lucide）
Bottom tab icon 大小：`h-5 w-5` + label `text-xs mt-0.5`

## Risks / Trade-offs

- [Risk] Dashboard layout 加入 nav 後，手機底部 tab bar 會佔用 64px，需確保各頁面 `pb-16 md:pb-0` 避免內容被遮蓋 → layout 統一加 `pb-16 md:pb-0` 在 main 上
- [Risk] Admin 無手機 nav → 展示時提示用桌面開啟即可（demo 情境合理）
