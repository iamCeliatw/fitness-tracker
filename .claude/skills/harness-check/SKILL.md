---
name: harness-check
description: 實作前的防護網確認。在開始寫任何新功能或修改 UI 之前執行，確保符合專案的 layout 契約、互動規格與測試規範。
---

實作前防護網確認（Harness Check）。在動任何一行 code 之前先跑這個。

---

**步驟**

1. **讀取 CLAUDE.md 的「開發防護網」段落**

   確認以下三個區塊的規則已載入：UI 與樣式防呆、測試覆蓋規則、開發節奏。

2. **UI 分層檢查**

   確認或詢問以下問題，任何一個答案是「否」就必須先修正再繼續：

   - 這個改動是否涉及新頁面或修改現有頁面的外層 div？
     - 如果是：背景色 (`bg-gray-950`, `min-h-screen`) 是否在 `layout.tsx` 而非 page component？
     - page component 外層 div 是否只有 `p-6 max-w-3xl mx-auto`，沒有 bg 或 min-h？
   - 是否有新的互動元件（卡片、按鈕、可展開區塊）？
     - 如果是：是否已規劃加上 `transition-colors`、hover 樣式、展開動畫？

3. **測試規劃檢查**

   - 這次改動是否包含新功能（新頁面、新 API route、新表單）？
     - 如果是：tasks.md 裡是否已有 E2E 測試任務群？（不是手動 checklist）
     - E2E 測試是否涵蓋 happy path + 至少一個 edge case？
   - 如果是 Bug 修復：是否先寫能重現 bug 的測試？

4. **開發節奏確認**

   - 這次打算實作幾個任務？如果超過一個，確認每個任務都能獨立確認（跑測試或目視）後再進行下一個
   - Spec 或 tasks.md 裡是否有模糊的互動視覺描述（例如「顯示列表」但沒說 hover 行為）？如果有，先問清楚再動手

5. **輸出檢查結果**

   以清單格式回報：

   ```
   ## Harness Check 結果

   ### UI 分層
   ✓ / ✗ layout.tsx 負責背景色
   ✓ / ✗ page component 只有 p-6 max-w-3xl mx-auto
   ✓ / ✗ 互動元件已規劃 transition 樣式

   ### 測試規劃
   ✓ / ✗ tasks.md 含 E2E 測試任務
   ✓ / ✗ 覆蓋 happy path + edge case

   ### 開發節奏
   ✓ / ✗ 任務可獨立確認
   ✓ / ✗ 視覺規格已明確

   → 全部通過，可以開始實作 / → 發現 N 個問題，先解決後再繼續
   ```

   有任何 ✗ 就停下來，等問題解決後才繼續實作。
