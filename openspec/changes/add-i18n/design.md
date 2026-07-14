# Design: add-i18n

## Context

Next.js 16 App Router、全站中文硬編碼、`src/proxy.ts` 做路由保護與 role 導向。brainstorming 拍板：cookie 模式（URL 不變）、範圍 = UI + 內建動作名、預設 zh-TW。**實作前先讀 `node_modules/next/dist/docs/` 與 next-intl 對 Next 16 的整合方式**（訓練資料可能過時）。

## Goals / Non-Goals

**Goals:**
- 三語（zh-TW / en / ja）即時切換、cookie 持久化、重新整理與跨頁維持
- 全站 UI 字串、zod 錯誤、日期格式在地化
- 內建動作名稱依語系顯示，缺翻譯 fallback 原文

**Non-Goals:**
- URL 語系前綴與 per-locale SEO
- API 伺服器端錯誤訊息翻譯（出現頻率低，v1 不做）
- 用戶自訂內容翻譯、瀏覽器 Accept-Language 自動偵測（v1 固定預設 zh-TW，避免 demo 時行為不可預期）

## Decisions

### D1: next-intl without i18n routing（cookie 模式）
`NEXT_LOCALE` cookie + root layout 讀 cookie 載入對應 messages。不用 `[locale]` segment：路由零改動、proxy.ts 零改動、E2E URL 斷言零改動。替代方案 path prefix 在本專案（登入後 app 為主）只有成本沒有收益。

### D2: messages 檔按頁面/領域分 namespace
`messages/<locale>.json` 單檔、內部以 namespace 分段（`common`、`nav`、`auth`、`workout`、`booking`、`admin`…）。三個檔案 key 結構必須一致，tasks 內含 key 對齊檢查步驟（實作時寫一個 15 行的 key-diff script 跑三檔比對）。

### D3: 動作名稱 = DB 欄位而非 messages
`nameEn`/`nameJa` nullable 欄位（與 imageUrl 同 pattern）。動作是資料不是 UI 字串，且館自訂/個人自訂動作永遠只有原文——同一條 fallback 規則（`nameEn ?? name`）同時覆蓋內建與自訂。顯示端做一個 `localizedExerciseName(exercise, locale)` helper。API 回傳三個名稱欄位，client 依 locale 挑。

### D4: zod 錯誤訊息用 key 不用句子
schema 裡 `message: "validation.required"` 這類 key，表單顯示端 `t(message)` 翻譯。避免 schema 直接依賴 locale context（server/client 共用 schema 會炸）。

### D5: 日期 formatter 集中 `src/lib/dates.ts`
現散落各元件的「7月14日 (週二)」格式抽成 `formatDate(date, locale, style)`，內部 `Intl.DateTimeFormat`。en 顯示 "Jul 14 (Tue)"、ja 顯示「7月14日（火）」。

### D6: 切換器 = shadcn DropdownMenu + 地球 icon
dashboard：放 user-menu 旁（`components/` 共用 `LocaleSwitcher`）；landing 與 (auth) layout 右上角同元件。點選 → server action 寫 cookie → `router.refresh()`。注意 shadcn/Base UI 的 Select value≠label 要傳 items（本專案已知陷阱）——用 DropdownMenu 迴避。

## 互動視覺規格

- 切換器按鈕：ghost 樣式地球 icon + 目前語系縮寫（中/EN/日），`transition-colors`
- dropdown 項目：語言原文顯示（中文 / English / 日本語），當前語系打勾
- 切換瞬間：`router.refresh()` 整頁重取——可接受閃動，不做 loading 遮罩
- 空狀態/hover：沿用現有 dropdown 樣式

## Risks / Trade-offs

- [字串抽取遺漏（角落 toast、AlertDialog、空狀態）] → 抽取按頁面分 task 逐頁掃；QA 步驟含三語各走一遍主要頁面目視
- [E2E 中文斷言 vs 語系狀態] → E2E 一律強制 zh-TW cookie（global setup 注入），i18n 專屬 spec 自行切語系並在結束還原；E2E 開場自癒 pattern 照舊
- [ja 翻譯品質（機器翻）] → 健身術語逐條過一次（ベンチプレス、スクワット等有固定慣用語）；標註 demo 等級即可
- [next-intl 與 Next 16 相容性] → 實作第一個 task 就是讀 docs + 最小 POC（一頁一字串），不通再評估 fallback（自寫 20 行 context provider——cookie 模式下 next-intl 的核心價值只剩 t() 與 message 載入，可自建）

## Migration Plan

1. Schema SQL（nameEn/nameJa）→ Supabase SQL Editor → `prisma generate`
2. 內建動作翻譯 UPDATE SQL（dev 與 live 各跑一次）
3. 程式部署——預設 zh-TW，未切換的用戶零感知
4. 回滾：cookie 讀不到就是 zh-TW，messages 檔與欄位留著無害
