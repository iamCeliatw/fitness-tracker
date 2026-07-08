## ADDED Requirements

### Requirement: 健身房建立
系統 SHALL 允許用戶在註冊時建立新的 Organization：輸入館名後建立 org 並使註冊者成為該 org 的 `OWNER`。org 建立時 SHALL 自動產生 8 碼大寫英數的唯一 `inviteCode`。

#### Scenario: 註冊時建立健身房
- **WHEN** 用戶以 `mode=create` + 有效 `orgName` 完成註冊
- **THEN** 建立 Organization（含唯一 inviteCode）與 `OrganizationMember(role=OWNER)`，回傳 201

#### Scenario: org 建立後 membership 寫入失敗
- **WHEN** Organization 建立成功但 OWNER membership 寫入失敗
- **THEN** 補償刪除該 Organization，錯誤記於 server log，註冊仍回傳成功（帳號可用，可重新引導建館）

### Requirement: 邀請碼查看與複製
系統 SHALL 讓 org `OWNER` 在 `/admin/settings` 查看該 org 的邀請碼，並提供一鍵複製。

#### Scenario: OWNER 查看邀請碼
- **WHEN** OWNER 開啟 `/admin/settings`
- **THEN** 頁面顯示其 org 的 inviteCode（等寬字體）與複製按鈕

#### Scenario: 非 OWNER 存取 org 設定 API
- **WHEN** 無 OWNER membership 的用戶呼叫 `/api/admin/settings`
- **THEN** 回傳 403，不洩漏任何 org 資料

### Requirement: 邀請碼重置
系統 SHALL 允許 OWNER 重置邀請碼；重置後舊碼立即失效，新碼同樣為 8 碼大寫英數且全域唯一。

#### Scenario: 重置邀請碼
- **WHEN** OWNER 在確認對話框中確認重置
- **THEN** 該 org 的 inviteCode 更新為新碼，頁面顯示新碼

#### Scenario: 舊碼失效
- **WHEN** 重置後有人以舊碼註冊加入
- **THEN** 回傳 422「邀請碼無效」，不建立任何資料

### Requirement: org 設定的 org 歸屬
`/api/admin/settings` 的讀取與更新 SHALL 以呼叫者 membership 的 `orgId` 為準，MUST NOT 使用無過濾的單一 org 查詢。

#### Scenario: 兩家館的 OWNER 各自讀取設定
- **WHEN** 館 A 與館 B 的 OWNER 分別呼叫 `GET /api/admin/settings`
- **THEN** 各自取得自己 org 的設定與邀請碼，互不可見

### Requirement: /admin 守門調整
`/admin` layout SHALL 允許全域 `ADMIN` 或 org `OWNER` 進入；`/admin/settings` SHALL 以 org `OWNER` membership 守門；其餘 `/admin` 頁維持全域 `ADMIN`。sidebar SHALL 只渲染當前身分有權限的項目。

#### Scenario: OWNER 進入 org 設定
- **WHEN** org OWNER（全域 role 為 USER）訪問 `/admin/settings`
- **THEN** 正常顯示頁面，sidebar 僅含其有權限的項目

#### Scenario: 一般 MEMBER 訪問 /admin
- **WHEN** 無 OWNER membership 且非全域 ADMIN 的用戶訪問 `/admin/*`
- **THEN** redirect 至 `/dashboard`
