-- DropForeignKey
ALTER TABLE "UserFavoriteExam" DROP CONSTRAINT "UserFavoriteExam_examId_fkey";

-- DropForeignKey
ALTER TABLE "UserFavoriteExam" DROP CONSTRAINT "UserFavoriteExam_userId_fkey";

-- AddForeignKey
ALTER TABLE "UserFavoriteExam" ADD CONSTRAINT "UserFavoriteExam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavoriteExam" ADD CONSTRAINT "UserFavoriteExam_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
