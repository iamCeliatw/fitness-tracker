## ADDED Requirements

### Requirement: Admin Sidebar 導覽列
Admin 後台 SHALL 在桌面螢幕（md 以上）顯示固定 240px 左側 Sidebar，包含系統名稱、導覽項目與登出按鈕。手機螢幕隱藏 Sidebar，直接全寬顯示內容。

#### Scenario: 桌面顯示 Sidebar
- **WHEN** 用戶在 md 以上螢幕開啟任意 /admin/* 頁面
- **THEN** 左側顯示 240px Sidebar，包含導覽項目

#### Scenario: 手機隱藏 Sidebar
- **WHEN** 用戶在手機（< md）開啟任意 /admin/* 頁面
- **THEN** Sidebar 隱藏，主內容全寬顯示

### Requirement: Sidebar 導覽項目
Sidebar SHALL 包含以下導覽項目（icon + label）：
- 儀表板（/admin）
- 成員（/admin/members）
- 動作庫（/admin/exercises）

#### Scenario: 當前頁面 active 狀態
- **WHEN** 用戶位於某個 admin 頁面
- **THEN** 對應導覽項目顯示 active 樣式（text-orange-400 + bg-gray-800）

#### Scenario: Hover 效果
- **WHEN** 用戶 hover 非 active 導覽項目
- **THEN** 顯示 hover 樣式（bg-gray-800 text-white），有 transition-colors duration-150

#### Scenario: 動作庫入口可用
- **WHEN** admin 點擊「動作庫」導覽項目
- **THEN** 進入 /admin/exercises 動作庫管理頁（不再 404）

### Requirement: Sidebar 登出功能
Sidebar 底部 SHALL 提供登出按鈕，點擊後執行 Supabase signOut 並導向 /login。

#### Scenario: 點擊登出
- **WHEN** 用戶點擊 Sidebar 底部的登出按鈕
- **THEN** 呼叫 supabase.auth.signOut()，並 redirect 到 /login
