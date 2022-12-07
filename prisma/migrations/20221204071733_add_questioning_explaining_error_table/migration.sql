-- AlterTable
ALTER TABLE "UserCompleteExam" ADD COLUMN     "score" INTEGER;

-- CreateTable
CREATE TABLE "Questioning" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "questioningAudio" TEXT NOT NULL,
    "questioningImage" TEXT[],
    "vote" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Questioning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Explaining" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "vote" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Explaining_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Error" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Error_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Questioning" ADD CONSTRAINT "Questioning_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Explaining" ADD CONSTRAINT "Explaining_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Error" ADD CONSTRAINT "Error_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Error" ADD CONSTRAINT "Error_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
