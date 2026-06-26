## ADDED Requirements

### Requirement: 動作選擇 Dialog 固定高度
Dialog SHALL 維持固定高度（不隨內容多寡縮放），肌群 Tab 切換或動作列表長短改變時 Dialog 外框高度 SHALL NOT 改變。

#### Scenario: 切換肌群 Tab 時 Dialog 不跳動
- **WHEN** 用戶在動作選擇 Dialog 中點擊不同肌群 Tab
- **THEN** Dialog 的整體高度 SHALL 保持不變，內容區域以 scroll 顯示超出的動作

#### Scenario: 搜尋結果為空時 Dialog 不縮小
- **WHEN** 用戶輸入無匹配的搜尋關鍵字，列表顯示空狀態訊息
- **THEN** Dialog 高度 SHALL 與有內容時相同，不縮小

#### Scenario: 動作超過可視範圍時可滾動
- **WHEN** 篩選結果筆數超過固定高度可顯示的列數
- **THEN** 動作列表區域 SHALL 可 scroll，Dialog 外框不撐高
