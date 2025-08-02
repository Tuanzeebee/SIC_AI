/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "student_gpa"."Post" DROP CONSTRAINT "Post_authorId_fkey";

-- AlterTable
ALTER TABLE "student_gpa"."User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "student_gpa"."Post";

-- CreateTable
CREATE TABLE "student_gpa"."ScoreRecord" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "studentId" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "semesterNumber" INTEGER NOT NULL,
    "courseCode" TEXT NOT NULL,
    "courseName" TEXT,
    "studyFormat" TEXT NOT NULL,
    "creditsUnit" INTEGER NOT NULL,
    "rawScore" DOUBLE PRECISION,
    "convertedNumericScore" DOUBLE PRECISION,
    "convertedScore" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoreRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_gpa"."PredictionInputReverse" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "semesterNumber" INTEGER NOT NULL,
    "courseCode" TEXT NOT NULL,
    "studyFormat" TEXT NOT NULL,
    "creditsUnit" INTEGER NOT NULL,
    "rawScore" DOUBLE PRECISION NOT NULL,
    "partTimeHours" DOUBLE PRECISION NOT NULL,
    "financialSupport" INTEGER NOT NULL,
    "emotionalSupport" INTEGER NOT NULL,
    "financialSupportXPartTime" DOUBLE PRECISION NOT NULL,
    "rawScoreXPartTime" DOUBLE PRECISION NOT NULL,
    "rawScoreXFinancial" DOUBLE PRECISION NOT NULL,
    "rawScoreXEmotional" DOUBLE PRECISION NOT NULL,
    "rawScoreXPartTimeFinancial" DOUBLE PRECISION NOT NULL,
    "predictedWeeklyStudyHours" DOUBLE PRECISION NOT NULL,
    "predictedAttendancePercentage" DOUBLE PRECISION NOT NULL,
    "mode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PredictionInputReverse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_gpa"."PredictionInputScore" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "reverseInputId" INTEGER,
    "semesterNumber" INTEGER NOT NULL,
    "courseCode" TEXT NOT NULL,
    "studyFormat" TEXT NOT NULL,
    "creditsUnit" INTEGER NOT NULL,
    "weeklyStudyHours" DOUBLE PRECISION NOT NULL,
    "attendancePercentage" DOUBLE PRECISION NOT NULL,
    "partTimeHours" DOUBLE PRECISION NOT NULL,
    "financialSupport" INTEGER NOT NULL,
    "emotionalSupport" INTEGER NOT NULL,
    "studyHoursXAttendance" DOUBLE PRECISION NOT NULL,
    "studyHoursXPartTime" DOUBLE PRECISION NOT NULL,
    "financialSupportXPartTime" DOUBLE PRECISION NOT NULL,
    "attendanceXEmotionalSupport" DOUBLE PRECISION NOT NULL,
    "fullInteractionFeature" DOUBLE PRECISION NOT NULL,
    "mode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PredictionInputScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_gpa"."PredictedScore" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "inputScoreId" INTEGER NOT NULL,
    "scoreRecordId" INTEGER,
    "predictedScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PredictedScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PredictedScore_inputScoreId_key" ON "student_gpa"."PredictedScore"("inputScoreId");

-- CreateIndex
CREATE UNIQUE INDEX "PredictedScore_scoreRecordId_key" ON "student_gpa"."PredictedScore"("scoreRecordId");

-- AddForeignKey
ALTER TABLE "student_gpa"."ScoreRecord" ADD CONSTRAINT "ScoreRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "student_gpa"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_gpa"."PredictionInputReverse" ADD CONSTRAINT "PredictionInputReverse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "student_gpa"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_gpa"."PredictionInputScore" ADD CONSTRAINT "PredictionInputScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "student_gpa"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_gpa"."PredictionInputScore" ADD CONSTRAINT "PredictionInputScore_reverseInputId_fkey" FOREIGN KEY ("reverseInputId") REFERENCES "student_gpa"."PredictionInputReverse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_gpa"."PredictedScore" ADD CONSTRAINT "PredictedScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "student_gpa"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_gpa"."PredictedScore" ADD CONSTRAINT "PredictedScore_inputScoreId_fkey" FOREIGN KEY ("inputScoreId") REFERENCES "student_gpa"."PredictionInputScore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_gpa"."PredictedScore" ADD CONSTRAINT "PredictedScore_scoreRecordId_fkey" FOREIGN KEY ("scoreRecordId") REFERENCES "student_gpa"."ScoreRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
