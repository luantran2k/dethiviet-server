-- AlterTable
ALTER TABLE "Part" ADD COLUMN     "partAudio" TEXT;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "questionAudio" TEXT,
ADD COLUMN     "questionImages" TEXT[];
