-- AlterTable
ALTER TABLE "Answer" ALTER COLUMN "value" SET DEFAULT '',
ALTER COLUMN "isTrue" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Exam" ALTER COLUMN "examName" SET DEFAULT '',
ALTER COLUMN "description" SET DEFAULT '',
ALTER COLUMN "subjectName" SET DEFAULT '',
ALTER COLUMN "grade" SET DEFAULT '',
ALTER COLUMN "publishers" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Part" ALTER COLUMN "description" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "title" SET DEFAULT '',
ALTER COLUMN "description" SET DEFAULT '',
ALTER COLUMN "explain" SET DEFAULT '';
