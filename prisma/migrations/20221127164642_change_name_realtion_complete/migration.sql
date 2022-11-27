/*
  Warnings:

  - You are about to drop the `UsercompleteExam` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UsercompleteExam" DROP CONSTRAINT "UsercompleteExam_examId_fkey";

-- DropForeignKey
ALTER TABLE "UsercompleteExam" DROP CONSTRAINT "UsercompleteExam_userId_fkey";

-- DropTable
DROP TABLE "UsercompleteExam";

-- CreateTable
CREATE TABLE "UserCompleteExam" (
    "userId" INTEGER NOT NULL,
    "examId" INTEGER NOT NULL,
    "completeAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCompleteExam_pkey" PRIMARY KEY ("userId","examId")
);

-- AddForeignKey
ALTER TABLE "UserCompleteExam" ADD CONSTRAINT "UserCompleteExam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompleteExam" ADD CONSTRAINT "UserCompleteExam_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
