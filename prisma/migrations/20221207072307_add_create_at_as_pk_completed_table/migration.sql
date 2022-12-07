/*
  Warnings:

  - The primary key for the `UserCompleteExam` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "UserCompleteExam" DROP CONSTRAINT "UserCompleteExam_pkey",
ADD CONSTRAINT "UserCompleteExam_pkey" PRIMARY KEY ("userId", "examId", "completeAt");
