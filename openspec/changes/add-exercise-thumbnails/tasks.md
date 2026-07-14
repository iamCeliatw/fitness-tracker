## 1. Schema 與資產

- [ ] 1.1 `schema.prisma`：Exercise 加 `imageUrl String?`；手寫 `ALTER TABLE "Exercise" ADD COLUMN "imageUrl" TEXT;` 於 Supabase SQL Editor 執行；`npx prisma generate`
- [ ] 1.2 建 23 筆內建動作 ↔ free-exercise-db 的對應表（動作名 → 圖檔），下載圖片到 `public/exercises/`（每張 <100KB，檔名用 slug）
- [ ] 1.3 `prisma/seed.ts` 各筆補 `imageUrl`；寫一份 UPDATE SQL 同步 dev DB 現有 23 筆（不重建資料列）
- [ ] 1.4 瀏覽器逐筆目視確認 23 張圖的姿勢與動作名稱相符（錯圖比沒圖糟）

## 2. UI

- [ ] 2.1 建共用 `ExerciseThumb` 元件：52×52 rounded next/image；imageUrl null → 灰底肌群字首方塊
- [ ] 2.2 動作選擇 Dialog 每列加縮圖（縮圖 | 名稱 | 肌群 badge），已加入/disabled 樣式不變；瀏覽器目視確認
- [ ] 2.3 `/admin/exercises` 列表每列加縮圖；瀏覽器目視確認內建有圖、自訂 fallback
- [ ] 2.4 `GET /api/exercises` 與 admin exercises API select 加 `imageUrl`

## 3. E2E 測試

- [ ] 3.1 更新/新增 spec：picker 開啟後內建動作列有 img（src 含 /exercises/）；edge：自訂動作列顯示 fallback 方塊（無 img、有肌群字）
- [ ] 3.2 先跑既有 workout 相關 spec 確認縮圖加入未破壞選擇器互動
- [ ] 3.3 `npm run test:e2e` 全綠（先查 port 3000 殘留）
