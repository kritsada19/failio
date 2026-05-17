/*
  Warnings:

  - You are about to drop the `AiUsage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AiUsage" DROP CONSTRAINT "AiUsage_userId_fkey";

-- DropTable
DROP TABLE "AiUsage";
