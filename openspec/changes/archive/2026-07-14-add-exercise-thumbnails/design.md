# Design: add-exercise-thumbnails

## Context

動作庫三層（全域內建 / 館自訂 / 個人自訂），內建 23 筆由 `prisma/seed.ts` 建立。選擇器 Dialog 在 `components/workout/`，admin 列表在 `/admin/exercises`。brainstorming 已用視覺 companion 對照三種處理，拍板**原色照片直出**。

## Goals / Non-Goals

**Goals:**
- 內建 23 筆動作在選擇器與 admin 列表顯示示範照片縮圖
- 無圖動作有一致的 fallback 視覺
- 圖片來源無授權疑慮（public domain）

**Non-Goals:**
- 自訂/館自訂動作的圖片上傳
- 圖片放大檢視、多張輪播（free-exercise-db 每動作有 2 張，只用第 1 張）
- Supabase Storage / CDN（`public/` + Vercel 靜態資產已足夠）

## Decisions

### D1: 圖片下載進 repo 的 `public/exercises/`，不 hotlink GitHub raw
23 張 × <100KB，repo 增量可忽略；hotlink 依賴外部 repo 存活且無 Next/Image 最佳化。檔名用動作 id 或 slug（實作時取 seed 的穩定識別）。

### D2: `imageUrl` 存相對路徑（`/exercises/squat.jpg`）
nullable TEXT 欄位。存相對路徑而非完整 URL，未來搬 CDN 只要換 prefix。

### D3: 縮圖用 `next/image`（52×52, object-cover, rounded）
静態資產自動最佳化。Dialog 清單一次渲染 23 筆小圖，`loading="lazy"` 預設行為即可。

### D4: fallback = 肌群字首灰色方塊
`imageUrl` null 時渲染 52px 灰底方塊（`bg-gray-800 text-gray-400`）置中顯示肌群第一字（胸/背/腿…或 C/B/L）。不用 icon 庫——與現有深色卡片風格一致且零依賴。

### D5: 對應表維護在 seed
`prisma/seed.ts` 的 23 筆資料各加 `imageUrl`。對應（深蹲 → Barbell_Full_Squat 等）實作時逐筆人工確認姿勢正確，寬鬆對應優於缺圖（如「啞鈴肩推」對 Dumbbell_Shoulder_Press）。

## 互動視覺規格

- 縮圖：`52×52 rounded-md object-cover flex-shrink-0`，列 hover 沿用現有 `transition-colors`
- 選擇器列 layout：縮圖 | 名稱（+「已加入」disabled 樣式不變）| 肌群 badge 靠右
- admin 列表：縮圖插在名稱左側，其餘欄位不動
- fallback 方塊：同尺寸同圓角，無 hover 效果差異
- 空狀態：不變（本 change 不碰）

## Risks / Trade-offs

- [free-exercise-db 圖是白底真人照，深色 UI 裡對比強] → brainstorming 已看過實圖拍板接受；styling 集中在一個 `ExerciseThumb` 元件，日後要改灰階是一行 filter
- [對應錯圖（姿勢不符名稱）比沒圖更糟] → seed 對應逐筆瀏覽器目視確認，tasks 內列為獨立步驟
- [既有 E2E 斷言選擇器列結構] → 縮圖是加法不是改法，先跑 workout 相關 spec 確認

## Migration Plan

1. `ALTER TABLE "Exercise" ADD COLUMN "imageUrl" TEXT;` → Supabase SQL Editor
2. `prisma generate`
3. 圖片入 repo + seed 更新 → 對 dev DB 重跑 seed 的 imageUrl UPDATE（不重建資料列）
4. 部署後 live DB 跑同一份 UPDATE SQL
5. 回滾：欄位與圖片留著無害，UI revert 即可
