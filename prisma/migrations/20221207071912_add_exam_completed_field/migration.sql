/*
  Warnings:

  - You are about to drop the column `partsWithAnswer` on the `UserCompleteExam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserCompleteExam" DROP COLUMN "partsWithAnswer",
ADD COLUMN     "examCompleted" JSONB NOT NULL DEFAULT '{}';
