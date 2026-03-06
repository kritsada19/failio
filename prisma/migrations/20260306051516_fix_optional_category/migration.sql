/*
  Warnings:

  - Made the column `categoryId` on table `Failure` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Failure" DROP CONSTRAINT "Failure_categoryId_fkey";

-- AlterTable
ALTER TABLE "Failure" ALTER COLUMN "categoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Failure" ADD CONSTRAINT "Failure_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
