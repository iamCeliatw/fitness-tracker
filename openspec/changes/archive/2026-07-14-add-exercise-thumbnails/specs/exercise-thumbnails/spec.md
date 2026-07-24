## ADDED Requirements

### Requirement: 內建動作附示範照片縮圖
系統 SHALL 為 23 筆全域內建動作提供示範照片：圖檔（public domain，來源 free-exercise-db）存於 `public/exercises/`，`Exercise.imageUrl` 存相對路徑。凡顯示動作列表的介面（動作選擇 Dialog、admin 動作庫列表）SHALL 以 52px 圓角縮圖呈現。

#### Scenario: 內建動作顯示縮圖
- **WHEN** 用戶開啟動作選擇 Dialog
- **THEN** 每筆內建動作左側顯示 52px 示範照片縮圖

#### Scenario: 照片與動作相符
- **WHEN** 檢視任一內建動作的縮圖
- **THEN** 照片呈現的動作與名稱一致（seed 對應逐筆人工確認）

### Requirement: 無圖動作顯示肌群 fallback
`imageUrl` 為 null 的動作（用戶自訂、館自訂）SHALL 顯示同尺寸灰色方塊，內含該動作肌群的字首字，不得出現破圖或空白。

#### Scenario: 自訂動作顯示 fallback
- **WHEN** 動作選擇 Dialog 列出一筆用戶自訂動作（imageUrl=null）
- **THEN** 縮圖位置顯示灰底方塊與肌群字首，版面與有圖列一致
