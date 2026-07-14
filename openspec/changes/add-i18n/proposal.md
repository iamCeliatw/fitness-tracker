# Proposal: add-i18n

## Why

平台目前全中文，作為 Upwork 接案 demo 對英語客戶不可讀，日文則瞄準潛在市場展示。導入三語（繁中/英/日）讓 demo 對國際客戶可用，並展示 i18n 架構能力。

## What Changes

- 導入 `next-intl`（cookie 模式，URL 不加語系前綴，不動現有路由與 `src/proxy.ts` 導向邏輯）
- 右上角語系切換器（地球 icon dropdown：中文/English/日本語）——dashboard 的 user-menu 旁、landing/(auth) 頁右上角；選擇寫 cookie 即時全站生效
- 所有頁面 UI 字串抽入 `messages/zh-TW.json / en.json / ja.json`，預設 zh-TW
- zod 表單錯誤訊息在地化
- 日期顯示改用語系對應的 `Intl.DateTimeFormat`（現有「7月14日 (週二)」等格式抽成共用 formatter）
- `Exercise` 加 `nameEn String?`、`nameJa String?`：內建 23 筆 seed 補翻譯，動作列表依語系顯示，null fallback 原文 `name`
- **不翻**：API 伺服器端錯誤訊息（v1 維持中文）、用戶自訂內容

## Capabilities

### New Capabilities
- `i18n`: 語系切換、持久化、三語 UI 翻譯範圍、內建動作名稱在地化與 fallback 規則

### Modified Capabilities
（無——既有功能行為不變，僅呈現語言在地化；動作 API 回傳欄位擴充在 `i18n` capability 內定義）

## Impact

- **範圍**：幾乎所有 `src/app/` 頁面與 `src/components/` 元件的字串抽取（一次性大改）
- **Schema**: `Exercise` +2 欄位（nullable，SQL 手動執行）
- **依賴**: 新增 `next-intl`
- **E2E**: 既有 19 支 spec 全部以中文字串斷言——global setup 或各 spec 開場 SHALL 強制 zh-TW cookie，否則全軍覆沒；另新增 i18n 專屬 spec
- **風險**: 字串抽取是機械性大 diff，與其他分支衝突面大 → 排在 add-exercise-thumbnails 之後、獨佔進行
