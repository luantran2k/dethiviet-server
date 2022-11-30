/*
  Warnings:

  - You are about to drop the column `questionIds` on the `Exam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "questionIds";

-- AlterTable
ALTER TABLE "Part" ADD COLUMN     "questionIds" TEXT[];
