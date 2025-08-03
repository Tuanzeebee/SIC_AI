/*
  Warnings:

  - Added the required column `year` to the `PredictionInputReverse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `PredictionInputScore` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "student_gpa"."PredictionInputReverse" ADD COLUMN     "year" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "student_gpa"."PredictionInputScore" ADD COLUMN     "year" TEXT NOT NULL;
