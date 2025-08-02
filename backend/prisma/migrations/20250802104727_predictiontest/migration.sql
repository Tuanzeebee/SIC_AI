-- CreateEnum
CREATE TYPE "student_gpa"."QuestionCategory" AS ENUM ('EMOTIONAL', 'FINANCIAL', 'GENERAL');

-- CreateTable
CREATE TABLE "student_gpa"."SurveyQuestion" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "category" "student_gpa"."QuestionCategory" NOT NULL,
    "options" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_gpa"."SurveyResponse" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_gpa"."SurveyAnswer" (
    "id" SERIAL NOT NULL,
    "responseId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "selectedOption" TEXT NOT NULL,

    CONSTRAINT "SurveyAnswer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "student_gpa"."SurveyResponse" ADD CONSTRAINT "SurveyResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "student_gpa"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_gpa"."SurveyAnswer" ADD CONSTRAINT "SurveyAnswer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "student_gpa"."SurveyResponse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_gpa"."SurveyAnswer" ADD CONSTRAINT "SurveyAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "student_gpa"."SurveyQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
