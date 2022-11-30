-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "isOriginal" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "questionIds" TEXT[],
ADD COLUMN     "securityCode" TEXT;
