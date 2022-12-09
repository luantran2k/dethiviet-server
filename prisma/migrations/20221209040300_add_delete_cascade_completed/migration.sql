-- DropForeignKey
ALTER TABLE "UserCompleteExam" DROP CONSTRAINT "UserCompleteExam_examId_fkey";

-- DropForeignKey
ALTER TABLE "UserCompleteExam" DROP CONSTRAINT "UserCompleteExam_userId_fkey";

-- AddForeignKey
ALTER TABLE "UserCompleteExam" ADD CONSTRAINT "UserCompleteExam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompleteExam" ADD CONSTRAINT "UserCompleteExam_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
