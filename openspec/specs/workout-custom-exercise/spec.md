# Spec: workout-custom-exercise

## Purpose

Allow users to create custom exercises directly from the exercise picker Dialog during workout logging. Custom exercises are user-scoped (visible only to their creator) and are stored alongside the public exercise library.

---

## Requirements

### Requirement: 用戶可在動作選擇 Dialog 內建立自訂動作
Dialog 底部 SHALL 提供「＋ 新增自訂動作」按鈕。點擊後展開 mini-form，填入動作名稱與肌群後可送出。送出成功後，新動作 SHALL 立即出現在列表並被選入當次訓練。

#### Scenario: 建立自訂動作並直接加入訓練
- **WHEN** 用戶點擊「＋ 新增自訂動作」展開 mini-form，填入名稱與肌群後送出
- **THEN** 系統 POST 至 `/api/exercises`，新動作以 `isCustom: true` 儲存，並呼叫 `onSelect` 帶入當次訓練，Dialog 關閉

#### Scenario: 自訂動作出現在下次開啟的列表中
- **WHEN** 用戶再次開啟動作選擇 Dialog
- **THEN** 該用戶建立的自訂動作 SHALL 出現在動作列表中（與公共動作庫混合顯示）

#### Scenario: 名稱為空時無法送出
- **WHEN** 用戶未填入動作名稱直接送出 mini-form
- **THEN** 系統 SHALL 顯示驗證錯誤，不呼叫 API

### Requirement: POST /api/exercises 接受自訂動作
API SHALL 接受 `{ name: string, muscleGroup: MuscleGroup }` 並以 `isCustom: true`、`createdById: session.user.id` 寫入 DB。未登入回傳 401。

#### Scenario: 合法 POST 建立自訂動作
- **WHEN** 已登入用戶 POST `{ name: "反手引體向上", muscleGroup: "BACK" }`
- **THEN** 回傳 201 與新建的 Exercise 物件（含 id）

#### Scenario: 未登入 POST 回傳 401
- **WHEN** 未登入請求 POST /api/exercises
- **THEN** 回傳 `{ error: "Unauthorized" }` with status 401

### Requirement: GET /api/exercises 回傳用戶可見的動作
GET SHALL 回傳「公共動作（isCustom: false）」加上「該用戶自己建立的自訂動作（createdById = userId）」。

#### Scenario: 用戶只看到自己的自訂動作
- **WHEN** 用戶 A 建立自訂動作後，用戶 B 呼叫 GET /api/exercises
- **THEN** 用戶 B 的回應中 SHALL NOT 包含用戶 A 的自訂動作
