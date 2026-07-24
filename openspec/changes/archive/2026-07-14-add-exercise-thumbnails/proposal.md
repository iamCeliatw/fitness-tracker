# Proposal: add-exercise-thumbnails

## Why

選動作時只有名稱與肌群 badge，用戶（尤其新手）無法確認「臥推」是不是自己想的那個動作。參考 Strava 等健身 App 的做法，在動作列表加上示範照片縮圖，降低選錯動作的機率。

## What Changes

- `Exercise` 加 `imageUrl String?` 欄位（手寫 SQL migration）
- 從 free-exercise-db（public domain）挑選 23 張對應內建動作的示範照片，存入 `public/exercises/`，seed 更新 `imageUrl`
- 動作選擇 Dialog 每列顯示 52px 圓角縮圖（原色照片，brainstorming 已拍板）
- `/admin/exercises` 列表同步顯示縮圖
- 無圖動作（用戶/館自訂）顯示肌群字首的灰色方塊 fallback
- `GET /api/exercises` 回傳欄位加 `imageUrl`

## Capabilities

### New Capabilities
- `exercise-thumbnails`: 動作縮圖的資料來源、儲存方式與無圖 fallback 規則

### Modified Capabilities
- `workout-exercise-picker`: Dialog 清單每列增加縮圖；API 回傳欄位增加 `imageUrl`
- `admin-exercise-management`: 動作庫列表每列增加縮圖；同時修正刪除保護的描述（`WorkoutPlanExercise` 已於 chore/portfolio-polish 移除）

## Impact

- **Schema**: `Exercise` +1 欄位（nullable，SQL 手動執行）
- **Assets**: `public/exercises/*.jpg` 約 23 張（每張 <100KB）
- **API**: `GET /api/exercises`、`GET /api/admin/exercises` select 加欄位
- **UI**: `components/workout/` 動作選擇 Dialog、`components/admin/` 動作庫列表
- **不做**: 自訂動作上傳圖片、圖片 CDN/Storage（public/ 足夠）
