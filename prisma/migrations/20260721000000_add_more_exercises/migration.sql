-- Add more exercises (batch 2) — safe to run multiple times (WHERE NOT EXISTS guard)
-- Run in Supabase SQL Editor

INSERT INTO "Exercise" (id, name, "nameEn", "nameJa", "muscleGroup", category, "imageUrl", "isCustom", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  v.ename,
  v.name_en,
  v.name_ja,
  v.muscle_group::"MuscleGroup",
  v.cat::"ExerciseCategory",
  NULL,
  false,
  NOW(),
  NOW()
FROM (VALUES
  -- CHEST
  ('啞鈴臥推',       'Dumbbell Bench Press',        'ダンベルベンチプレス',                       'CHEST',     'STRENGTH'),
  ('伏地挺身',       'Push-up',                     'プッシュアップ',                             'CHEST',     'STRENGTH'),
  ('滑輪夾胸',       'Cable Chest Fly',             'ケーブルチェストフライ',                     'CHEST',     'STRENGTH'),
  -- BACK
  ('單臂啞鈴划船',   'Single Arm Dumbbell Row',     'ワンアームダンベルロウ',                     'BACK',      'STRENGTH'),
  ('臉拉',           'Face Pull',                   'フェイスプル',                               'BACK',      'STRENGTH'),
  ('超人式',         'Superman',                    'スーパーマン',                               'BACK',      'STRENGTH'),
  -- SHOULDERS
  ('啞鈴肩推',       'Dumbbell Shoulder Press',     'ダンベルショルダープレス',                   'SHOULDERS', 'STRENGTH'),
  ('阿諾德推舉',     'Arnold Press',                'アーノルドプレス',                           'SHOULDERS', 'STRENGTH'),
  ('俯身側平舉',     'Rear Delt Fly',               'リアデルトフライ',                           'SHOULDERS', 'STRENGTH'),
  ('上半身啞鈴繞環', 'Dumbbell Around the World',   'ダンベルアラウンドザワールド',               'SHOULDERS', 'STRENGTH'),
  -- ARMS
  ('啞鈴彎舉',       'Dumbbell Curl',               'ダンベルカール',                             'ARMS',      'STRENGTH'),
  ('上斜彎舉',       'Incline Dumbbell Curl',       'インクラインダンベルカール',                 'ARMS',      'STRENGTH'),
  ('集中彎舉',       'Concentration Curl',          'コンセントレーションカール',                 'ARMS',      'STRENGTH'),
  ('頸後三頭伸展',   'Overhead Triceps Extension',  'オーバーヘッドトライセプスエクステンション', 'ARMS',      'STRENGTH'),
  ('雙槓撐體',       'Dips',                        'ディップス',                                 'ARMS',      'STRENGTH'),
  ('窄距伏地挺身',   'Diamond Push-up',             'ダイヤモンドプッシュアップ',                 'ARMS',      'STRENGTH'),
  -- LEGS
  ('保加利亞分腿蹲', 'Bulgarian Split Squat',       'ブルガリアンスプリットスクワット',           'LEGS',      'STRENGTH'),
  ('弓步蹲',         'Lunges',                      'ランジ',                                     'LEGS',      'STRENGTH'),
  ('羅馬尼亞硬舉',   'Romanian Deadlift',           'ルーマニアンデッドリフト',                   'LEGS',      'STRENGTH'),
  ('相撲深蹲',       'Sumo Squat',                  'スモウスクワット',                           'LEGS',      'STRENGTH'),
  ('臀推',           'Hip Thrust',                  'ヒップスラスト',                             'LEGS',      'STRENGTH'),
  ('小腿提踵',       'Calf Raise',                  'カーフレイズ',                               'LEGS',      'STRENGTH'),
  ('壺鈴深蹲',       'Goblet Squat',                'ゴブレットスクワット',                       'LEGS',      'STRENGTH'),
  -- CORE
  ('捲腹',           'Crunches',                    'クランチ',                                   'CORE',      'STRENGTH'),
  ('懸吊舉腿',       'Hanging Leg Raise',           'ハンギングレッグレイズ',                     'CORE',      'STRENGTH'),
  ('側棒式',         'Side Plank',                  'サイドプランク',                             'CORE',      'STRENGTH'),
  ('俄羅斯轉體',     'Russian Twist',               'ロシアンツイスト',                           'CORE',      'STRENGTH'),
  ('死蟲',           'Dead Bug',                    'デッドバグ',                                 'CORE',      'STRENGTH'),
  -- FULL_BODY
  ('壺鈴擺盪',       'Kettlebell Swing',            'ケトルベルスイング',                         'FULL_BODY', 'STRENGTH'),
  ('波比跳',         'Burpee',                      'バーピー',                                   'FULL_BODY', 'CARDIO'),
  ('農夫走路',       'Farmer''s Walk',              'ファーマーズウォーク',                       'FULL_BODY', 'STRENGTH'),
  ('土耳其起立',     'Turkish Get-up',              'ターキッシュゲットアップ',                   'FULL_BODY', 'STRENGTH'),
  -- CARDIO
  ('跳繩',           'Jump Rope',                   'なわとび',                                   'CARDIO',    'CARDIO'),
  ('飛輪',           'Stationary Bike',             'エアロバイク',                               'CARDIO',    'CARDIO'),
  ('划船機',         'Rowing Machine',              'ローイングマシン',                           'CARDIO',    'CARDIO'),
  ('橢圓機',         'Elliptical Trainer',          'エリプティカル',                             'CARDIO',    'CARDIO')
) AS v(ename, name_en, name_ja, muscle_group, cat)
WHERE NOT EXISTS (
  SELECT 1 FROM "Exercise" e WHERE e.name = v.ename AND e."isCustom" = false
);
