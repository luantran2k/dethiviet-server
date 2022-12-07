-- AlterTable
ALTER TABLE "Explaining" ALTER COLUMN "vote" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Questioning" ALTER COLUMN "questioningAudio" DROP NOT NULL,
ALTER COLUMN "vote" SET DEFAULT 0;
