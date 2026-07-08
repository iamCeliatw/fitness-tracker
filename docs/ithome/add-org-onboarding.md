# 文章素材：add-org-onboarding — 多租戶 onboarding：建館與邀請碼

> Change 週期：2026-07-06 roadmap 確認 → 2026-07-08 explore/propose/apply/ship 一日完成。分支 `feat/add-org-onboarding`。商業化路線（多租戶 → Stripe）的第一塊拼圖。

## 要解決什麼問題

Schema 從 Phase 2 起就是多租戶形狀（Organization / OrganizationMember / OrgRole），但產品層一直是單租戶假象：

- 註冊寫死「加入最早建立的 org」——第二家健身房根本進不去
- `/api/admin/settings` 用無過濾的 `.single()` 抓「唯一的 org」——有兩個 org 就直接炸
- `requireOrgRole` 用 `(userId, role)` 查詢——回答的是「你在*某個* org 是教練嗎」，不是「你在*這個* org 是什麼角色」

Stripe 訂閱的計費主體是 org，所以 org 必須先能被用戶自助建立。

## 心智模型：一人一館（explore 最有價值的一段）

探索時的關鍵問答——用戶問：

> 「一人一個org是甚麼概念 我以為Org是一間健身房的意思?」

Org 確實就是一間健身房；「一人一館」指的是**一個帳號同時只隸屬一間**。這個混淆本身就是好素材：多租戶的成員模型有兩軸（org 是什麼 × 一人可屬幾個），很容易攪在一起。

支援「一人多館」（自由教練同時在兩間授課）意味著：org 切換器 UI、current-org 存 cookie/URL、個人資料跨館歸屬歧義。**產品層限制一人一館把這三個複雜度全砍掉**，而 DB 的 `@@unique([orgId, userId])` 關聯表不動——未來要多館是加功能，不是改架構。

## 關鍵設計決策與取捨

- **D2 邀請碼而非 email 邀請**：`Organization.inviteCode`（8 碼、unique），OWNER 可查看/重置。零新表、零寄信依賴，demo 展示 30 秒走完。Email 邀請要 Invitation 表 + token 生命週期 + 寄信整合——已知天花板（碼外流靠重置、不能預指派角色）對 demo 是 YAGNI。
- **D3 邀請碼驗證在 `auth.signUp` 之前**：signUp 不可逆（會產生 auth 帳號），先驗便宜的、再做不可逆的。無效碼 422 時零殘留。順序敏感的序列操作，把「可失敗的驗證」全部前置。
- **D3b 補償刪除**：Supabase client 無交易，create 模式 org 成功但 OWNER membership 失敗時補償刪 org——序列操作 + 錯誤補償的既有 pattern 再用一次。
- **D4 /admin 守門「ADMIN 或 OWNER」**：org 設定歸 org OWNER（`requireOrgRole("OWNER")`），全域 ADMIN 退位為平台 superadmin、不再有 settings 存取權。sidebar 依身分渲染。
- **勘查修正了 explore 的兩個假設**：middleware（proxy.ts）其實不做 role 導向（只擋未登入），完全不用動；守門全在 layout/page 層。教訓：explore 的架構假設要在 design 階段用 code 勘查驗證。

## 設計在實作中途被推翻的一段（最有教學價值）

原設計：migration 把 TEST_ADMIN 的 membership 升 OWNER，讓既有 admin E2E 能過新守門。

實作到 E2E 才發現：`admin-members.spec.ts` 拿 TEST_ADMIN 自己的 membership 做「會員↔教練」升降測試——migration 寫入 OWNER 會被測試降回去，測試又因初始不是會員而失敗，**兩邊互相覆蓋，永不收斂**。

修正：migration 完全不動 membership；settings 的 OWNER 覆蓋改由「E2E 走註冊流程自建健身房」提供——順便把建館功能本身也測到了。一條 journey spec 串完：建館 → 登入看邀請碼 → 用碼加入 → 重置 → 舊碼被拒。

教訓：**測試資料的角色狀態也是共用資源**。設計時要盤點「誰會寫這個狀態」，不只是「誰會讀」。

## SDD 流程怎麼走

explore（一人一館定案 + 邀請碼 vs email 比較）→ propose（proposal / design 含互動視覺規格 / 2 份 specs / 21 tasks）→ apply（migration 手動 SQL → code → E2E）→ QA（52 綠 + build + lint）→ ship（spec sync + archive + PR）。

middleware 假設、settings `.single()` 炸點、TEST_ADMIN 衝突——三個都是在 design/apply 階段勘查 code 時抓到的，spec 階段看不到。SDD 的 artifacts 不是一次寫死：design.md 記錄了被推翻的決策與原因（劃掉保留，不是刪掉）。

## 踩到的坑

1. **QA 一輪 5 紅的雙層污染**：第一層（環境）——用背景工具跑 `npx next dev` 再停止時，殺的是外層 shell，`start-server.js` 孫子程序存活、繼續佔 port 3000 且回應變 flaky；Playwright `reuseExistingServer` 重用它 → 5 個不相干 spec 散彈式失敗。第二層（狀態）——失敗的測試中斷在寫 DB 中途，把 TEST_ADMIN membership 留在 COACH，毒害後續重跑。**先清環境、再重跑、最後才懷疑 code**；並區分一次污染（環境）與二次污染（前次失敗殘留）。
2. **殘留的處置是改測試不是改資料**：直接 PATCH 共用 DB 修狀態是治標；正解是給 spec 補自癒 reset（開場把自己依賴的狀態歸位），跟 `resetCoachPairings` 同 pattern——這條防護網規則第三次回本。
3. **測舊需求的測試要刪不要修**：admin-members 裡「新註冊自動獲得 MEMBER membership」測的是本 change 移除的行為。需求被移除時，對應測試的正確處置是刪除 + 留註解指向新測試，不是想辦法讓它過。

## 可引用的數字

- 16 檔 +603/−138（實作 commit），21 tasks，一天內 explore → ship
- E2E 52 tests / 5.3 分鐘全綠；新增 org-onboarding journey spec（1 條 journey + 1 條 edge case）
- 邀請碼 8 碼（UUID 去 dash 取前 8 大寫），撞 unique constraint 重生一次
- 批次驗證順序：格式(zod) → 邀請碼(DB) → signUp(不可逆) → org/membership(可補償)
