/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Explaining` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Explaining" DROP CONSTRAINT "Explaining_ownerId_fkey";

-- AlterTable
ALTER TABLE "Explaining" DROP COLUMN "ownerId",
ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Explaining" ADD CONSTRAINT "Explaining_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
