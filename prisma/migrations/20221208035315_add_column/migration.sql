/*
  Warnings:

  - You are about to drop the column `userId` on the `Explaining` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Explaining` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Explaining" DROP CONSTRAINT "Explaining_userId_fkey";

-- AlterTable
ALTER TABLE "Explaining" DROP COLUMN "userId",
ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Explaining" ADD CONSTRAINT "Explaining_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
