## Why

現有 UI 採 mobile-first 設計，內容限寬在 `max-w-3xl` 的窄欄，放到桌面螢幕時兩側大量留白，整體觀感偏個人 app，與商業 SaaS 系統的視覺語言不符。作品集定位為「企業級 SaaS MVP」，需要調整為桌面優先排版並保持 RWD 手機相容。

## What Changes

- **Admin 後台**：新增固定左側 Sidebar 導覽列（icon + label），主內容區全寬展開，頂部加 Header bar
- **User Dashboard**：內容寬度從 `max-w-3xl` 調整為 `max-w-5xl`，統計卡片在桌面改為 3 欄 grid，整體呼吸感更好
- **User 子頁面**（body / workout / food）：同步調整 max-w 與 padding，手機維持單欄
- **Dashboard Layout**：新增 `/dashboard/layout.tsx`，包含桌面版左側迷你 nav 與手機版底部 tab bar
- **RWD 策略**：breakpoint `md` (768px) 以下呈現手機版，以上呈現桌面版

## Capabilities

### New Capabilities
- `admin-sidebar`: Admin 後台固定左側 Sidebar，含路由高亮、icon 導覽
- `dashboard-shell`: User 區域的 layout shell，桌面左側迷你 nav、手機底部 tab bar

### Modified Capabilities
- `dashboard-stats`: 統計卡片由固定 3 欄改為 RWD grid（手機 1 欄、桌面 3 欄）

## Impact

- `src/app/admin/layout.tsx`：新建（包含 sidebar）
- `src/app/dashboard/layout.tsx`：新建或重構（含 nav shell）
- `src/app/dashboard/page.tsx`：調寬、調整 grid
- `src/app/dashboard/body/page.tsx`、`workout/page.tsx`、`food/page.tsx`：調寬
- `src/components/admin/admin-sidebar.tsx`：新建
- `src/components/dashboard/dashboard-nav.tsx`：新建
- 無 API 變更、無 DB 變更、無破壞性變更
