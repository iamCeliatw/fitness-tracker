## ADDED Requirements

### Requirement: 語系切換與持久化
系統 SHALL 支援 zh-TW（預設）、en、ja 三種語系。所有主要 layout（dashboard、admin、landing、auth）右上角 SHALL 提供語系切換器（地球 icon dropdown，顯示 中文/English/日本語，當前語系標示打勾）。切換後 SHALL 寫入 `NEXT_LOCALE` cookie 並即時全站生效，重新整理與跨頁導航維持所選語系；URL SHALL NOT 帶語系前綴。

#### Scenario: 切換至英文
- **WHEN** 用戶在 dashboard 右上角切換器選擇 English
- **THEN** 當前頁面即時以英文顯示，導航至其他頁面維持英文

#### Scenario: 語系跨 session 持久
- **WHEN** 用戶選擇日本語後關閉瀏覽器分頁再重新開啟網站
- **THEN** 介面以日本語顯示（cookie 未過期）

#### Scenario: 無 cookie 的預設語系
- **WHEN** 首次訪問（無 NEXT_LOCALE cookie）
- **THEN** 介面以繁體中文顯示

### Requirement: UI 全面在地化
所有頁面的介面字串（導航、標題、按鈕、表單 label、toast、空狀態、AlertDialog）SHALL 依語系顯示，來源為 `messages/<locale>.json`；三個語系檔的 key 結構 SHALL 一致（CI/task 內含比對檢查）。zod 表單驗證錯誤 SHALL 以 message key 定義並於顯示端翻譯。日期顯示 SHALL 依語系格式化（zh「7月14日 (週二)」/ en「Jul 14 (Tue)」/ ja「7月14日（火）」）。

#### Scenario: 表單驗證錯誤在地化
- **WHEN** 英文介面下用戶送出空白的必填欄位
- **THEN** 錯誤訊息以英文顯示

#### Scenario: 日期格式跟隨語系
- **WHEN** 英文介面下檢視預約時段列表
- **THEN** 日期以英文格式（如 Jul 14 (Tue)）顯示

#### Scenario: 語系檔 key 一致性
- **WHEN** 任一語系檔缺少其他語系檔存在的 key
- **THEN** key 比對檢查失敗並列出缺漏 key

### Requirement: 內建動作名稱在地化
`Exercise` SHALL 提供 `nameEn`、`nameJa` nullable 欄位，內建 23 筆動作 SHALL 補齊兩種翻譯（健身慣用語，如 Squat/スクワット）。動作顯示處（選擇器、訓練記錄、admin 列表）SHALL 依語系顯示對應名稱，該欄位為 null 時 fallback 顯示原文 `name`。動作 API SHALL 回傳三個名稱欄位。

#### Scenario: 英文介面顯示英文動作名
- **WHEN** 英文介面下開啟動作選擇 Dialog
- **THEN** 內建動作顯示英文名（如 Squat），搜尋中英文皆可命中

#### Scenario: 自訂動作 fallback 原文
- **WHEN** 英文介面下列表包含一筆用戶自訂動作「我的特殊訓練」（nameEn=null）
- **THEN** 該動作顯示原文「我的特殊訓練」，無破版或空白

### Requirement: E2E 語系基線
既有 E2E 測試 SHALL 於 global setup 強制 zh-TW（注入 NEXT_LOCALE cookie），確保中文斷言不受語系狀態影響；i18n 專屬 spec 自行切換語系並於結束還原。

#### Scenario: 既有測試不受語系影響
- **WHEN** dev DB 殘留 en cookie 狀態下執行既有 E2E
- **THEN** 所有既有 spec 以中文介面執行並通過
