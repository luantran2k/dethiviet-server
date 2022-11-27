-- CreateTable
CREATE TABLE "UsercompleteExam" (
    "userId" INTEGER NOT NULL,
    "examId" INTEGER NOT NULL,
    "completeAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsercompleteExam_pkey" PRIMARY KEY ("userId","examId")
);

-- AddForeignKey
ALTER TABLE "UsercompleteExam" ADD CONSTRAINT "UsercompleteExam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsercompleteExam" ADD CONSTRAINT "UsercompleteExam_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
