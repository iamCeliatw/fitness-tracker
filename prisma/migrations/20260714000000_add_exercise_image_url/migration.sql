-- add-exercise-thumbnails: Exercise 示範照片欄位
ALTER TABLE "Exercise" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
