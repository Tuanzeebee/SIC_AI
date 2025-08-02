/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `SurveyAnalysisResult` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SurveyAnalysisResult_userId_key" ON "student_gpa"."SurveyAnalysisResult"("userId");
