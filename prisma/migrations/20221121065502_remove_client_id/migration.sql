/*
  Warnings:

  - You are about to drop the column `clientId` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `Part` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `Question` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "clientId",
ALTER COLUMN "value" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Exam" ALTER COLUMN "isPublic" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Part" DROP COLUMN "clientId";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "clientId",
ALTER COLUMN "title" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
