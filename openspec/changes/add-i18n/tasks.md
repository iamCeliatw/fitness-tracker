## 1. 基礎建設與 POC

- [ ] 1.1 讀 `node_modules/next/dist/docs/` 相關章節 + next-intl 對 Next 16 App Router（無 i18n routing、cookie 模式）的整合文件；`npm install next-intl`
- [ ] 1.2 最小 POC：root layout 讀 NEXT_LOCALE cookie 載入 messages，landing 一個字串三語切換成功（不成功 → 回 design D6 fallback 評估，暫停回報）
- [ ] 1.3 建 `messages/zh-TW.json / en.json / ja.json` 骨架（namespace：common/nav/auth/workout/body/food/booking/coach/admin/validation）+ 15 行 key-diff 檢查 script（`npm run i18n:check`）
- [ ] 1.4 `LocaleSwitcher` 元件（DropdownMenu + 地球 icon + server action 寫 cookie + router.refresh）；掛上 dashboard user-menu 旁、admin、landing、(auth) layout 右上角；瀏覽器確認四處皆可切換

## 2. Schema 與動作名翻譯

- [ ] 2.1 `schema.prisma`：Exercise 加 `nameEn String?`、`nameJa String?`；ALTER TABLE SQL 於 Supabase 執行；`prisma generate`
- [ ] 2.2 23 筆內建動作補 en/ja 翻譯（健身慣用語逐條確認）：seed 更新 + dev DB UPDATE SQL
- [ ] 2.3 `localizedExerciseName` helper + 動作 API 回傳 name/nameEn/nameJa；選擇器、訓練日誌、admin 列表改用 helper；瀏覽器三語確認 + 自訂動作 fallback 確認

## 3. 字串抽取（逐頁，每頁完成即瀏覽器目視三語）

- [ ] 3.1 共用元件：導航 sidebar、user-menu、共用 UI 字串（common/nav namespace）
- [ ] 3.2 landing + (auth) login/register + onboarding
- [ ] 3.3 dashboard 總覽 + body + food
- [ ] 3.4 workout（列表 + new 表單 + 選擇器）
- [ ] 3.5 booking + coach dashboard（含週行程、審核）
- [ ] 3.6 admin 全部頁面（members/exercises/settings/audit-logs）
- [ ] 3.7 zod schema 錯誤訊息改 message key + 顯示端翻譯（validation namespace）；表單逐一觸發驗證確認
- [ ] 3.8 日期 formatter 抽 `src/lib/dates.ts`，全站替換；三語確認日期格式
- [ ] 3.9 `npm run i18n:check` 通過 + 三語各走一遍主要頁面目視掃遺漏

## 4. E2E 測試

- [ ] 4.1 global setup 注入 zh-TW cookie；先跑全部既有 spec 確認綠燈（字串抽取不得改中文文案，diff 時比對）
- [ ] 4.2 新增 `e2e/i18n.spec.ts`：happy path：切 English → nav/標題變英文 → 重新整理維持 → 切回中文還原；edge：動作選擇器英文介面下自訂動作顯示原文 fallback
- [ ] 4.3 `npm run test:e2e` 全綠（先查 port 3000 殘留）
