-- add-exercise-thumbnails: 內建 23 筆動作補 imageUrl（依 name 對應，只動全域內建）
UPDATE "Exercise" SET "imageUrl" = v.url
FROM (VALUES
  ('槓鈴臥推', '/exercises/barbell-bench-press.jpg'),
  ('上斜臥推', '/exercises/incline-bench-press.jpg'),
  ('下斜臥推', '/exercises/decline-bench-press.jpg'),
  ('啞鈴飛鳥', '/exercises/dumbbell-flyes.jpg'),
  ('引體向上', '/exercises/pullups.jpg'),
  ('槓鈴划船', '/exercises/bent-over-barbell-row.jpg'),
  ('滑輪下拉', '/exercises/lat-pulldown.jpg'),
  ('坐姿划船', '/exercises/seated-cable-rows.jpg'),
  ('肩推', '/exercises/shoulder-press.jpg'),
  ('側平舉', '/exercises/side-lateral-raise.jpg'),
  ('前平舉', '/exercises/front-raise.jpg'),
  ('槓鈴彎舉', '/exercises/barbell-curl.jpg'),
  ('錘式彎舉', '/exercises/hammer-curls.jpg'),
  ('三頭下拉', '/exercises/triceps-pushdown.jpg'),
  ('法式推舉', '/exercises/skullcrusher.jpg'),
  ('深蹲', '/exercises/squat.jpg'),
  ('硬舉', '/exercises/deadlift.jpg'),
  ('腿推', '/exercises/leg-press.jpg'),
  ('腿彎舉', '/exercises/lying-leg-curls.jpg'),
  ('腿伸展', '/exercises/leg-extensions.jpg'),
  ('棒式支撐', '/exercises/plank.jpg'),
  ('仰臥起坐', '/exercises/sit-up.jpg'),
  ('跑步機', '/exercises/treadmill.jpg')
) AS v(name, url)
WHERE "Exercise".name = v.name
  AND "Exercise"."isCustom" = false
  AND "Exercise"."orgId" IS NULL;
