/*
  Warnings:

  - The `questionIds` column on the `Part` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Part" DROP COLUMN "questionIds",
ADD COLUMN     "questionIds" INTEGER[];
