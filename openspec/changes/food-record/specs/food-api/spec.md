## ADDED Requirements

### Requirement: GET /api/food-entries 回傳當日記錄
API SHALL 接受 `?date=YYYY-MM-DD` query parameter，回傳該用戶指定日期的所有 FoodEntry，依 mealType 和 createdAt 排序。未傳 date 時預設今日。

#### Scenario: 取得今日記錄
- **WHEN** 已登入用戶 GET `/api/food-entries`（無 date 參數）
- **THEN** 回傳今日所有 FoodEntry 陣列（可為空陣列）

#### Scenario: 未登入回傳 401
- **WHEN** 未登入請求 GET /api/food-entries
- **THEN** 回傳 `{ error: "Unauthorized" }` with status 401

### Requirement: POST /api/food-entries 新增飲食記錄
API SHALL 接受 `{ date, mealType, name, calories, protein?, carbs?, fat?, amount?, unit? }`，驗證後以當前用戶 userId 建立記錄，回傳 201。

#### Scenario: 合法 POST 建立記錄
- **WHEN** 已登入用戶 POST `{ date: "2026-06-26", mealType: "LUNCH", name: "雞胸肉", calories: 165 }`
- **THEN** 回傳 201 與新建的 FoodEntry 物件（含 id）

#### Scenario: 缺少必填欄位回傳 400
- **WHEN** POST 的 body 缺少 `name` 或 `calories`
- **THEN** 回傳 `{ error: "..." }` with status 400

### Requirement: DELETE /api/food-entries/[id] 刪除指定記錄
API SHALL 驗證記錄屬於當前用戶，刪除後回傳 200。不屬於當前用戶的記錄回傳 403。

#### Scenario: 刪除自己的記錄
- **WHEN** 用戶 DELETE `/api/food-entries/<自己的記錄 id>`
- **THEN** 記錄從 DB 刪除，回傳 200

#### Scenario: 刪除他人記錄回傳 403
- **WHEN** 用戶 DELETE `/api/food-entries/<他人的記錄 id>`
- **THEN** 回傳 `{ error: "Forbidden" }` with status 403
