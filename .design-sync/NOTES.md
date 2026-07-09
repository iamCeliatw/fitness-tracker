# design-sync notes — fitness-tracker

- 這是 app repo 不是元件套件：沒有 dist/，`node_modules/fitness-tracker` 不存在 → 必須用 `cfg.entry`（`.design-sync/ds-entry.ts`，re-export 全部 `src/components/ui/*`）。新增 ui 元件時要同步加進 ds-entry.ts 和 `componentSrcMap`（此 repo 是刻意全列舉，因為沒有 .d.ts export 可掃）。
- 樣式來源是 Tailwind v4：`buildCmd` 先用 `@tailwindcss/cli` 把 `src/app/globals.css` 編譯成靜態 CSS（`.design-sync/.cache/tailwind-compiled.css`，gitignored——fresh clone 要先跑 buildCmd 再跑 converter）。編譯結果只含 repo 原始碼＋`.design-sync/previews/` 實際用到的 class（v4 自動內容掃描）。
- 預覽的排版 glue 一律用 inline style，不要用沒出現在 app 原始碼裡的 Tailwind class（不會被編譯進 CSS，靜默失效）。
- shadcn/ui 是 Base UI 底（非 Radix）：`Select.Value` 渲染原始 value，value≠label 要給 `items`；overlay 用 Root 的 `open` prop 靜態渲染（已驗證 Dialog 可行）。
- Playwright：repo 自帶 1.61.0 + chromium-1228 快取（E2E 環境），render check 直接可用。
- 字型：`--font-sans` 由 next/font 在 runtime 注入（tokens 缺 2 個、低於門檻，validate 不擋）。預覽會用系統字型 fallback。
- `guidelinesGlob: []`：預設 glob 會把 `docs/schema-migration.md`（DB 文件）誤抓成設計指南，已排除。
- 元件命名：chart.tsx 的卡片名是 `ChartContainer`、sonner.tsx 是 `Toaster`、page-loading.tsx 是 default export（ds-entry 具名 re-export 成 `PageLoading`）。

## Wave 1 學到的（2026-07-09）

- **Base UI `DropdownMenuLabel` 必須包在 `DropdownMenuGroup` 裡**，否則整個 root 直接 throw（`MenuGroupContext is missing`）、卡片全空白。Radix 沒這限制，是本 repo 最容易踩的差異。
- **跨副本 context 問題（bundle vs preview 各 inline 一份 npm 套件）**：recharts 3.x `ResponsiveContainer` 的尺寸 context 跨不過副本 → chart 預覽必須給 `LineChart` 明確 `width`/`height`，且不可混用 bundle 的 `ChartTooltip` 和 preview 副本的 chart tree。sonner 的 `toast()` store 同理跨不過 → **Toaster 刻意保留 floor card**（無法誠實靜態渲染，勿補預覽）。根本解法（若之後需要）：把 recharts primitives 從 ds-entry re-export。
- `PageLoading` 是 `fixed inset-0` 全屏 overlay：預覽要包 `position:relative; transform:translateZ(0); overflow:hidden` 容器（transform 讓 wrapper 成為 fixed 的 containing block）。
- Sidebar 的 fixed 容器是 `h-svh`，會比卡片 cell 的 padding 多出 ~48px → 預覽內嵌 `<style>` 覆蓋 `[data-slot=sidebar-container]` 高度（presentation-only）。
- Select 的 open popup 會 portal 出 cell，預覽只做 closed trigger states（含 items prop 的 value→label 對映）。
- Calendar（react-day-picker 10）用 `defaultMonth={new Date(2026, 6)}` + `selected` 確保 deterministic 渲染。

## Known render warns
- `Toaster`：floor card（刻意，見上）。
- `[RENDER_THIN] AlertDialog / Dialog / Sheet`：「rendered height 0px」是 fixed/portal 定位的量測假象——截圖皆正常（open 狀態置中/側欄完整），benign。
- 單一 cell 的 overlay 元件（AlertDialog/Sheet/Tooltip/DropdownMenu/Sidebar/Dialog）若 validate 報 `variants render identically` 屬預期（cardMode single 只有一個 export）。

## Re-sync 風險
- `tailwind-compiled.css` 是 gitignored 產物：fresh clone 必須先跑 `buildCmd` 再跑 converter，且編譯結果依賴 Tailwind v4 對 repo 的自動內容掃描（previews 用到的 class 要在編譯時已存在於磁碟）。
- 預覽的排版 glue 用 inline style（編譯後 CSS 不含 app 沒用到的 utility）；若未來預覽想用任意 utility，需在 buildCmd 加 previews 的 content source。
- `ds-entry.ts` + `componentSrcMap` 是手動列舉：新增 `src/components/ui/*` 元件時兩處都要加，否則 bundle 缺 export。
- 字型走 next/font runtime 注入，預覽/設計都是系統字型 fallback——未同步真字型檔（repo 內沒有可搬的 @font-face 資產）。
