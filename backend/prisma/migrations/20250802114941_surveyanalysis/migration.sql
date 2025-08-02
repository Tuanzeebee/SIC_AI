-- CreateTable
CREATE TABLE "student_gpa"."SurveyAnalysisResult" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "emotionalLevel" INTEGER NOT NULL,
    "financialLevel" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyAnalysisResult_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "student_gpa"."SurveyAnalysisResult" ADD CONSTRAINT "SurveyAnalysisResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "student_gpa"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
