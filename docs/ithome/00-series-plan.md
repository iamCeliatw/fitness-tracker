# iThome 鐵人賽 30 天系列企劃 — AI & SDD 從 0 到 1

> 主軸：**AI 協作 + SDD（Spec-Driven Development）方法論**，fitness-tracker 是貫穿全系列的真實案例。
> 素材基礎：15 個封存 change（`openspec/changes/archive/`）、2 篇素材檔（`docs/ithome/`）、5 份 design specs、2 次 session 覆盤。

---

## 一、系列名稱候選

1. **《與 AI 結對的 30 天：用 SDD 從 0 打造一個健身 SaaS》** — 直接點出兩個關鍵字，SaaS 暗示不只是 todo list 等級的玩具
2. **《Spec 先行，AI 動手：30 天蓋出 LIFTLOG 健身平台的完整實錄》** — 「實錄」強調真實專案非教學範例，帶產品名
3. **《不寫 code 的日子：我用 AI + SDD 獨立完成全端產品》** — 標題黨一點，點閱導向，但要在 D1 立刻誠實說明「其實你比以前更需要懂 code」

建議選 1 或 2；3 適合當某一篇的單篇標題而非系列名。

---

## 二、30 天大綱

格式：**D# 標題** — 一句話賣點｜素材來源

### 第一週（D1–D7）：觀念與地基 — 為什麼、是什麼、怎麼開始

- **D1 序章：為什麼我用 AI + SDD 做 side project** — 前端工程師想補全端、目標接案作品集；vibe coding 的失敗經驗 vs 有流程的 AI 協作；系列導覽圖｜個人經歷 + README（portfolio landing 版）
- **D2 SDD 是什麼：spec 不是文件，是給 AI 的合約** — openspec 三步驟 `propose → apply → archive`；proposal / design / specs / tasks 四種 artifact 各自回答什麼問題｜`openspec/` 目錄結構 + 任一 archive change
- **D3 CLAUDE.md：把專案知識寫成 AI 讀得懂的形狀** — AI 每次對話都失憶，CLAUDE.md 是外接記憶；從空白到「開發防護網」的演化預告｜`CLAUDE.md` + `AGENTS.md` 現檔
- **D4 技術選型：當本機封鎖了 5432，我學到 ORM 的真正邊界** — port 封鎖 → Prisma 只管 schema/型別、runtime 全走 Supabase client（HTTPS）的混合架構；限制反而逼出更清晰的分層｜CLAUDE.md「資料庫連線」段 + `src/lib/supabase/server.ts`
- **D5 第一個完整 SDD 週期：登入註冊功能全程實錄** — 從 propose 到 archive 走一遍 auth-login-register，讓讀者看到流程全貌｜`archive/2026-06-24-auth-login-register/`
- **D6 AI 的知識過期了怎麼辦：Next.js 16 把 middleware 改名的那天** — proxy.ts、shadcn 改 Base UI 底：訓練資料陷阱清單 + 「寫 code 前查 `node_modules/next/dist/docs/`」的防呆機制｜AGENTS.md + CLAUDE.md「套件版本陷阱」段
- **D7 沒有 `migrate dev` 的日子：手寫 SQL 的 schema 變更流程** — shadow DB 不可用時的替代流程設計（改 schema.prisma → 手寫 SQL → Supabase SQL Editor → generate）；流程也是可以被設計的｜`docs/schema-migration.md`

### 第二週（D8–D14）：功能推進實戰 — SDD 的日常節奏

- **D8 一天一功能的節奏：體重追蹤（表單 + Recharts 雙軸圖）** — 小 change 的標準拍子：spec 寫清楚 → AI 一次到位；query param 切換 30/90 天的簡單設計｜`archive/2026-06-24-body-record-tracking/`
- **D9 巢狀表單的硬仗：訓練日誌與 useFieldArray** — exercises → sets 兩層動態結構、動作選擇 Dialog；複雜 UI 該在 spec 寫到多細｜`archive/2026-06-25-workout-log/`
- **D10 spec 要寫多細？「互動視覺規格」段落的誕生** — AI 做出的 UI 沒 hover 沒轉場 → 覆盤後 design.md 強制包含互動視覺規格；spec 粒度的判斷準則｜`archive/2026-06-26-workout-ux-improvements/` + CLAUDE.md「UI 與樣式防呆」
- **D11 UI 分層契約：背景屬於 layout，限寬屬於 page** — AI 最常犯的樣式錯誤（同一 div 又 bg 又 max-w）如何變成一條可執行的規則；規則比 code review 便宜｜CLAUDE.md 分層契約 + `src/app/dashboard/layout.tsx`
- **D12 中型 change 的取捨：dashboard 總覽與飲食記錄** — 兩個 change 同日完成的節奏控制；「一任務 → 目視驗證 → 打勾 → 下一個」的開發節奏規則｜`archive/2026-06-29-dashboard-overview/` + `archive/2026-06-29-food-record/`
- **D13 技術遷移也走 SDD：Neon→Supabase、NextAuth→Supabase Auth** — 遷移類 change 的檢查清單（grep 舊 import、uninstall 驗證）；desktop-first RWD 重構同場加映｜commits `99c8309`、`ed782a7` + `archive/2026-06-29-desktop-rwd-layout/`
- **D14 Vercel 部署翻車記：env var 三處同步與 prisma generate** — 缺 `NEXT_PUBLIC_` 前綴全站 500（middleware 在所有路由前執行）、build script 補 prisma generate；「新增 env var = 三處同步」規則的由來｜commits `8d12be7`、`f058645`、`89f4c00` + CLAUDE.md「環境變數同步規則」

### 第三週（D15–D21）：測試與防護網 — 本系列差異化最強的一週

- **D15 E2E 不是驗收，是 AI 的防護網** — 為什麼 AI 協作下測試策略要倒過來想：tasks.md 最後一個任務群永遠是 E2E，不是手動 checklist；happy path + edge case 的最低標準｜CLAUDE.md「測試覆蓋規則」+ `e2e/` 目錄
- **D16 E2E 穩定性五規則：與共用 dev DB 共存** — auto-waiting、自癒重置、locator 圈定、port 殘留、共用角色狀態——五條規則各配一個真實翻車現場｜CLAUDE.md 五規則 + commits `f917af4`、`b621bc8`
- **D17 大面積紅燈先懷疑環境：兩次 QA 假死的診斷學** — 51 測試 40+ 個 timeout 不是 code 壞是 port 被占；孤兒 `start-server.js` 的雙層污染（環境污染 vs 失敗殘留）；失敗的「形狀」就是診斷線索｜`docs/ithome/add-recurring-slots.md` 坑 1 + `add-org-onboarding.md` 坑 1 + commit `8e17581`
- **D18 Bug 修復的紀律：先寫紅測試，再修** — BodyRecord 不存在的 updatedAt 欄位讓 insert 整筆失敗；「payload 不得含 model 沒有的欄位」反向防呆的由來｜commit `f3bc2ed`（PR #8）+ CLAUDE.md「DB insert 防呆」
- **D19 覆盤驅動開發：session retro 如何長成 CLAUDE.md 規則** — 每次翻車 → 覆盤 → 提煉成規則寫回 CLAUDE.md 的閉環；規則要寫「觸發時機 + 動作」而非心得｜commits `5c5d9fc`、`c2d08e3` + CLAUDE.md 全文演化
- **D20 AI 的護欄工程：何時該讓 AI 暫停問人** — 四種強制暫停情境（新目錄結構、跨多頁改動、spec 沒寫的視覺細節、型別錯誤）；「實作前置確認」四項檢查｜CLAUDE.md「開發節奏」+「實作前置確認」
- **D21 中場總結：Phase 1 成果與方法論半程回顧** — 截圖展示 Phase 1 全功能；前 20 天方法論濃縮成一張流程圖；下半場預告（從工具到產品）｜README + 全部 Phase 1 archive

### 第四週（D22–D28）：Phase 2 進階 — 從個人工具到多角色產品

- **D22 最大的 change：教練預約系統（slots、appointments、audit log）** — 大 change 怎麼拆 tasks、DB Trigger 自動寫稽核 log、Supabase client 無交易 → 序列操作 + 補償刪除 pattern｜`archive/2026-07-01-add-coach-booking-system/` + `docs/superpowers/specs/2026-06-30-phase2-coach-booking-design.md`
- **D23 兩層權限模型：User role × OrgRole** — 全域 ADMIN vs org 內 OWNER/ADMIN/COACH/MEMBER；requireRole / requireOrgRole 的分工；CoachStudent unique 不分 status 的陷阱（重配對要 UPDATE 不是 INSERT）｜`src/lib/auth-helpers.ts` + `archive/2026-07-02-add-member-onboarding/`
- **D24 產品迭代小步快跑：landing page、user menu、動作庫管理、預約審核** — 四個小 change 各挑一個亮點（bento grid、setState in effect 改 remount、terminal row 重用）；小 change 讓 SDD 攤提成本變低｜`archive/2026-07-02-add-landing-page/`、`2026-07-03-add-user-menu/`、`2026-07-06-add-admin-exercises/`、`2026-07-07-add-appointment-approval/`
- **D25 時區 bug 病理解剖：三個「都沒錯」的環節串成 -8 小時**（本系列最強單篇） — TIMESTAMP vs TIMESTAMPTZ、PostgREST 不帶 Z 後綴、修 root cause 的 diff 反而最小、E2E workaround 是負債｜`docs/ithome/add-recurring-slots.md`（素材檔已備齊，直接展開）
- **D26 YAGNI 的實戰決策集：每週重複時段** — 批次展開放 client 的理由、一次 insert 的原子性、固定一小時砍掉一半欄位、不做 batchId/月曆/recurrence rule｜`docs/ithome/add-recurring-slots.md` D2–D5
- **D27 多租戶的心智模型：「一人一館」與邀請碼** — org 是什麼 × 一人可屬幾個是兩軸；產品層限制砍掉三個複雜度而 DB 不動；邀請碼 vs email 邀請的取捨；驗證順序（便宜的先、不可逆的後）｜`docs/ithome/add-org-onboarding.md`（素材檔已備齊）
- **D28 設計被實作推翻的時刻：spec 不是一次寫死** — TEST_ADMIN membership 被 migration 與測試互相覆蓋永不收斂 → 改走註冊流程自建；「測試資料的角色狀態也是共用資源」；design.md 劃掉保留被推翻的決策｜`docs/ithome/add-org-onboarding.md`「設計在實作中途被推翻」段

### 收尾（D29–D30）

- **D29 30 天方法論總提煉：AI & SDD 協作十條心法** — 從全系列反向整理：spec 是合約、防護網用規則不用記憶、覆盤閉環、大面積紅燈先懷疑環境、root cause diff 最小、YAGNI……每條附回連結｜全系列 + CLAUDE.md
- **D30 成果展示與下一步：從作品集到商業化** — demo 帳號走一輪產品、數字總結（15 changes、52 E2E tests、N commits）、商業化 roadmap（Stripe 訂閱、多租戶已鋪路）、給想用 AI+SDD 的人的起步建議｜README + demo seed（commit `a3d461f`）+ booking v2 backlog

---

## 三、首次寫作者執行建議

### 賽前準備（現在～開賽）
- **開賽前囤稿至少 10 篇**。鐵人賽斷一天即失格；賽中一定有累的日子，存稿是唯一保險。現在是 7 月初，9 月開賽前近兩個月，每週寫 1–2 篇即可達標。
- **先寫 D25、D17、D28 這種素材檔已備齊的**，不要從 D1 開始寫。D1 序章等全系列骨架寫過幾篇後再回頭寫，會準得多。
- 舊 change（D5–D24 大部分）的素材檔還沒回填：寫到哪篇，再從 `openspec/changes/archive/<change>/` + `git log` + design spec 回填該篇素材檔即可，不用一次補完 13 篇。

### 文章模板（固定，不要每篇重新發明）
現有素材檔的結構就是文章結構，直接沿用：
1. **要解決什麼問題**（引用戶原話/場景最有說服力）
2. **決策與取捨**（❌ 選項 A 因為… ❌ 選項 B 因為… ✅ 選了 C）
3. **踩到的坑**（翻車現場 + 教訓一句話）
4. **一句話結論 + 可引用的數字**（「16 檔 +603/−138、一天 ship」比形容詞有力）

每篇 800–1500 字、**一篇只講一個重點**。寫超過就拆成兩天——你缺的從來不是題目。

### 標題與配圖
- 標題公式：**具體痛點 > 抽象概念**。「當本機封鎖了 5432」贏過「淺談資料庫連線架構」；「三個都沒錯的環節串成 -8 小時」贏過「時區處理最佳實踐」。
- 配圖用真的：spec 片段截圖、diff 截圖、E2E 綠燈截圖、產品畫面。不要花時間畫精美示意圖，流程圖用 mermaid 或手畫即可。
- 每篇開頭放一句「這是系列第 N 天，昨天講了…今天…」建立連續感；結尾預告明天。

### 心態
- 第一次寫，目標是**完賽**，不是每篇都精品。四週各有一篇主打（D6、D17、D25、D28），其他篇達到「清楚交代一件事」即可。
- 你的差異化不是教學（教學文很多人寫），是**真實專案的決策現場與翻車紀錄**——素材檔裡的用戶原話、被推翻的設計、失敗的形狀，這些別人寫不出來，全部保留。
