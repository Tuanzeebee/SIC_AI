-- AlterTable
ALTER TABLE "student_gpa"."PredictionInputReverse" ALTER COLUMN "partTimeHours" DROP NOT NULL,
ALTER COLUMN "financialSupport" DROP NOT NULL,
ALTER COLUMN "emotionalSupport" DROP NOT NULL,
ALTER COLUMN "financialSupportXPartTime" DROP NOT NULL,
ALTER COLUMN "rawScoreXPartTime" DROP NOT NULL,
ALTER COLUMN "rawScoreXFinancial" DROP NOT NULL,
ALTER COLUMN "rawScoreXEmotional" DROP NOT NULL,
ALTER COLUMN "rawScoreXPartTimeFinancial" DROP NOT NULL,
ALTER COLUMN "predictedWeeklyStudyHours" DROP NOT NULL,
ALTER COLUMN "predictedAttendancePercentage" DROP NOT NULL;

-- AlterTable
ALTER TABLE "student_gpa"."PredictionInputScore" ALTER COLUMN "weeklyStudyHours" DROP NOT NULL,
ALTER COLUMN "attendancePercentage" DROP NOT NULL,
ALTER COLUMN "partTimeHours" DROP NOT NULL,
ALTER COLUMN "financialSupport" DROP NOT NULL,
ALTER COLUMN "emotionalSupport" DROP NOT NULL,
ALTER COLUMN "studyHoursXAttendance" DROP NOT NULL,
ALTER COLUMN "studyHoursXPartTime" DROP NOT NULL,
ALTER COLUMN "financialSupportXPartTime" DROP NOT NULL,
ALTER COLUMN "attendanceXEmotionalSupport" DROP NOT NULL,
ALTER COLUMN "fullInteractionFeature" DROP NOT NULL;
