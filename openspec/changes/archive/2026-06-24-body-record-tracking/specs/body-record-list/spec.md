## ADDED Requirements

### Requirement: User can view historical body records list
系統 SHALL 以列表顯示用戶所有 BodyRecord，依日期降冪排列。

#### Scenario: List displays records with key fields
- **WHEN** 用戶有 BodyRecord 資料
- **THEN** 列表每行顯示：日期、體重（kg）、體脂率（%，若有）、肌肉量（kg，若有）

#### Scenario: Empty state
- **WHEN** 用戶尚無任何 BodyRecord
- **THEN** 列表區域顯示「還沒有記錄，新增第一筆吧！」

### Requirement: User can delete a body record
系統 SHALL 允許用戶刪除自己的單筆 BodyRecord，刪除前需二次確認。

#### Scenario: Successful deletion with confirmation
- **WHEN** 用戶點擊刪除按鈕，AlertDialog 彈出後確認
- **THEN** 系統呼叫 `DELETE /api/body-records/[id]`，記錄從列表消失，圖表同步更新

#### Scenario: Cancel deletion
- **WHEN** 用戶點擊刪除按鈕後在 AlertDialog 點取消
- **THEN** 記錄保留，無任何變化

#### Scenario: Delete another user's record rejected
- **WHEN** 用戶呼叫 `DELETE /api/body-records/[id]`，但該 id 屬於其他用戶
- **THEN** 系統回傳 403
