-- Update imageUrl for batch-2 exercises
-- Run in Supabase SQL Editor after migration.sql

UPDATE "Exercise" SET "imageUrl" = '/exercises/dumbbell-bench-press.jpg'       WHERE name = '啞鈴臥推'       AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/push-up.jpg'                    WHERE name = '伏地挺身'       AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/cable-chest-fly.jpg'            WHERE name = '滑輪夾胸'       AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/single-arm-dumbbell-row.jpg'    WHERE name = '單臂啞鈴划船'   AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/face-pull.jpg'                  WHERE name = '臉拉'           AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/superman.jpg'                   WHERE name = '超人式'         AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/dumbbell-shoulder-press.jpg'    WHERE name = '啞鈴肩推'       AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/arnold-press.jpg'               WHERE name = '阿諾德推舉'     AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/rear-delt-fly.jpg'              WHERE name = '俯身側平舉'     AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/dumbbell-around-the-world.jpg'  WHERE name = '上半身啞鈴繞環' AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/dumbbell-curl.jpg'              WHERE name = '啞鈴彎舉'       AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/incline-dumbbell-curl.jpg'      WHERE name = '上斜彎舉'       AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/concentration-curl.jpg'         WHERE name = '集中彎舉'       AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/overhead-triceps-extension.jpg' WHERE name = '頸後三頭伸展'   AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/dips.jpg'                       WHERE name = '雙槓撐體'       AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/diamond-push-up.jpg'            WHERE name = '窄距伏地挺身'   AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/bulgarian-split-squat.jpg'      WHERE name = '保加利亞分腿蹲' AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/lunges.jpg'                     WHERE name = '弓步蹲'         AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/romanian-deadlift.jpg'          WHERE name = '羅馬尼亞硬舉'   AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/sumo-squat.jpg'                 WHERE name = '相撲深蹲'       AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/hip-thrust.jpg'                 WHERE name = '臀推'           AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/calf-raise.jpg'                 WHERE name = '小腿提踵'       AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/goblet-squat.jpg'               WHERE name = '壺鈴深蹲'       AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/crunches.jpg'                   WHERE name = '捲腹'           AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/hanging-leg-raise.jpg'          WHERE name = '懸吊舉腿'       AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/side-plank.jpg'                 WHERE name = '側棒式'         AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/russian-twist.jpg'              WHERE name = '俄羅斯轉體'     AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/dead-bug.jpg'                   WHERE name = '死蟲'           AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/kettlebell-swing.jpg'           WHERE name = '壺鈴擺盪'       AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/farmers-walk.jpg'               WHERE name = '農夫走路'       AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/turkish-get-up.jpg'             WHERE name = '土耳其起立'     AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/jump-rope.jpg'                  WHERE name = '跳繩'           AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/stationary-bike.jpg'            WHERE name = '飛輪'           AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/rowing-machine.jpg'             WHERE name = '划船機'         AND "isCustom" = false;
UPDATE "Exercise" SET "imageUrl" = '/exercises/elliptical-trainer.jpg'         WHERE name = '橢圓機'         AND "isCustom" = false;
-- 波比跳 (Burpee) has no matching image in the database, imageUrl stays null
