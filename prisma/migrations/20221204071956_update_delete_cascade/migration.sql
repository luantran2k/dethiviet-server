/*
  Warnings:

  - Added the required column `questioningId` to the `Explaining` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Error" DROP CONSTRAINT "Error_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Error" DROP CONSTRAINT "Error_userId_fkey";

-- DropForeignKey
ALTER TABLE "Explaining" DROP CONSTRAINT "Explaining_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Questioning" DROP CONSTRAINT "Questioning_ownerId_fkey";

-- AlterTable
ALTER TABLE "Explaining" ADD COLUMN     "questioningId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Questioning" ADD CONSTRAINT "Questioning_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Explaining" ADD CONSTRAINT "Explaining_questioningId_fkey" FOREIGN KEY ("questioningId") REFERENCES "Questioning"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Explaining" ADD CONSTRAINT "Explaining_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Error" ADD CONSTRAINT "Error_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Error" ADD CONSTRAINT "Error_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
