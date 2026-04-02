-- DropForeignKey
ALTER TABLE "Failure" DROP CONSTRAINT "Failure_categoryId_fkey";

-- AlterTable
ALTER TABLE "Failure" ALTER COLUMN "categoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Failure" ADD CONSTRAINT "Failure_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
