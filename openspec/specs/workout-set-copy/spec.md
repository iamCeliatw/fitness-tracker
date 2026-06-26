# Spec: workout-set-copy

## Purpose

Allow users to quickly copy the previous set's reps and weight values into the current set row, reducing repetitive data entry during workout logging.

---

## Requirements

### Requirement: 組數列複製按鈕
從第二組起，每個組數輸入列 SHALL 顯示複製按鈕（icon button）。點擊後 SHALL 將上一組的次數與重量填入當前組的對應欄位。

#### Scenario: 點擊複製帶入上一組數值
- **WHEN** 用戶在第 N 組（N ≥ 2）點擊複製按鈕
- **THEN** 當前組的「次數」欄位 SHALL 被填入第 N-1 組的次數值，「重量」欄位 SHALL 被填入第 N-1 組的重量值

#### Scenario: 第一組不顯示複製按鈕
- **WHEN** 動作只有一組，或用戶查看第一組的輸入列
- **THEN** 該列 SHALL NOT 顯示複製按鈕

#### Scenario: 上一組無數值時複製後欄位為空
- **WHEN** 用戶在第 N 組點擊複製，但第 N-1 組次數與重量皆為空
- **THEN** 當前組欄位被清空（值為空字串），不報錯
