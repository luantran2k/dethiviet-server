-- AlterTable
ALTER TABLE "UserCompleteExam" ADD COLUMN     "partsWithAnswer" JSONB NOT NULL DEFAULT '{}';
