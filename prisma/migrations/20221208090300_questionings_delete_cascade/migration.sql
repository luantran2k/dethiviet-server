-- DropForeignKey
ALTER TABLE "Explaining" DROP CONSTRAINT "Explaining_questioningId_fkey";

-- AddForeignKey
ALTER TABLE "Explaining" ADD CONSTRAINT "Explaining_questioningId_fkey" FOREIGN KEY ("questioningId") REFERENCES "Questioning"("id") ON DELETE CASCADE ON UPDATE CASCADE;
