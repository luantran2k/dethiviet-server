/*
  Warnings:

  - The `vote` column on the `Explaining` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `vote` column on the `Questioning` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Explaining" DROP COLUMN "vote",
ADD COLUMN     "vote" INTEGER[];

-- AlterTable
ALTER TABLE "Questioning" DROP COLUMN "vote",
ADD COLUMN     "vote" INTEGER[];
