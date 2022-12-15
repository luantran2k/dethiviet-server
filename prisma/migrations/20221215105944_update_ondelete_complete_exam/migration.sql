-- DropForeignKey
ALTER TABLE "UserCompleteExam" DROP CONSTRAINT "UserCompleteExam_examId_fkey";

-- AddForeignKey
ALTER TABLE "UserCompleteExam" ADD CONSTRAINT "UserCompleteExam_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
