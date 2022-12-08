/*
  Warnings:

  - You are about to drop the column `vote` on the `Explaining` table. All the data in the column will be lost.
  - You are about to drop the column `vote` on the `Questioning` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Explaining" DROP COLUMN "vote",
ADD COLUMN     "downVote" INTEGER[],
ADD COLUMN     "upVote" INTEGER[];

-- AlterTable
ALTER TABLE "Questioning" DROP COLUMN "vote",
ADD COLUMN     "downVote" INTEGER[],
ADD COLUMN     "upVote" INTEGER[];
