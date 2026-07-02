## MODIFIED Requirements

### Requirement: Sidebar 導覽項目
Sidebar SHALL 包含以下導覽項目（icon + label）：
- 儀表板（/admin）
- 成員（/admin/members）
- 動作庫（/admin/exercises，預留）

#### Scenario: 當前頁面 active 狀態
- **WHEN** 用戶位於某個 admin 頁面
- **THEN** 對應導覽項目顯示 active 樣式（text-orange-400 + bg-gray-800）

#### Scenario: Hover 效果
- **WHEN** 用戶 hover 非 active 導覽項目
- **THEN** 顯示 hover 樣式（bg-gray-800 text-white），有 transition-colors duration-150
