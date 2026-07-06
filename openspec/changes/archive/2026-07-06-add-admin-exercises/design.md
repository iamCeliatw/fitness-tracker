## Context

`/admin/exercises` 是 admin sidebar 既有入口但頁面不存在（404）。`Exercise` model（name/description/muscleGroup/category/isCustom/createdById）與 user-facing `GET/POST /api/exercises` 已存在；admin 後台已有成熟的同構 pattern（`/admin/members`：server page + client manager + `/api/admin/*` routes）。

設計文件（已與用戶確認）：`docs/superpowers/specs/2026-07-03-add-admin-exercises-design.md`

## Goals / Non-Goals

**Goals:**
- 管理員可瀏覽（含篩選/搜尋）、新增、編輯、刪除動作庫內容
- 官方動作與會員自訂動作在同一列表可辨識（自訂 badge）
- 資料完整性：被訓練記錄/計畫引用的動作不可刪除

**Non-Goals:**
- CSV 批次匯入（未來 Phase 3 可能加入）
- 動作圖片/影片附件
- 修改 user-facing `/api/exercises` 或動作選擇器行為
- Schema 變更

## Decisions

### D1：比照 members pattern（server page + client manager + 專用 admin API）
`page.tsx` 用 `requireRole("ADMIN")` + admin client 查全部動作，props 傳 client manager。CRUD 走新開的 `/api/admin/exercises`。
- 否決：在 `/api/exercises` 加 admin 分支——混合 user/admin 權限邏輯，違反現有 `/api/admin/*` 慣例

### D2：admin 新增的是官方動作
`POST /api/admin/exercises` 建立 `isCustom=false`、`createdById=null` 的動作，全組織可見（user-facing GET 的 `isCustom.eq.false` 條件自然涵蓋）。

### D3：會員自訂動作僅可刪除、不可編輯
列表顯示自訂 badge；PATCH 對 `isCustom=true` 的動作回 403。刪除開放（治理用途），同樣受引用檢查保護。

### D4：刪除採硬刪除 + 引用擋下
DELETE 前平行查 `WorkoutLogExercise`、`WorkoutPlanExercise` 是否有該 `exerciseId`；任一存在 → 409「此動作已被訓練記錄或計畫使用，無法刪除」。不做軟刪除（YAGNI，且 user-facing 查詢無 deleted 過濾）。

### D5：API 權限檢查
route 內查 `User.role === "ADMIN"`（比照既有 `/api/admin/*` routes 的做法，實作時以現有 route 為準對齊）。

## 已知陷阱對策

- **shadcn/ui Base UI Select**：肌群（9 enum 值）/類別（4 enum 值）下拉 value≠中文 label → `Select.Root` 必傳 `items`；`onValueChange` 型別 `string | null`
- 中文 label mapping 沿用 workout 元件既有對照，不重寫
- Insert 需自給 `id: crypto.randomUUID()` 與 `createdAt/updatedAt`（比照 `/api/exercises` POST）

## 互動視覺規格

- 列表卡片：`transition-colors duration-150 hover:border-gray-700`
- 按鈕：至少 `transition-colors`
- 肌群 Tab：active 橘色系、非 active 灰色 hover 變亮（沿用動作選擇器 pattern）
- 空狀態：篩選/搜尋無結果顯示 `text-gray-500` 提示文字
- Dialog / AlertDialog：shadcn 現成元件，無自訂動畫

## Risks / Trade-offs

- [引用檢查與刪除非原子操作（Supabase client 無交易）] → 檢查後立即刪除，間隙極小；就算漏擋，FK constraint 會使刪除失敗回 500，資料不會壞
- [列表一次載入全部動作] → 動作庫量級小（數十筆），無分頁需求；未來量大再加
- [E2E 與手動測試共用 dev DB] → 測試動作用固定可辨識名稱（如「E2E 測試動作」），開場先清除殘留（自癒）
