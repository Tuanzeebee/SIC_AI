-- AlterTable
ALTER TABLE "student_gpa"."PredictedScore" ADD COLUMN     "PredictedconvertedNumericScore" DOUBLE PRECISION,
ADD COLUMN     "PredictedconvertedScore" TEXT;

-- AlterTable
ALTER TABLE "student_gpa"."PredictionInputReverse" ALTER COLUMN "rawScore" DROP NOT NULL;
