/*
  Warnings:

  - You are about to drop the column `aiSuggestion` on the `Failure` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AiStatus" AS ENUM ('NOT_STARTED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Failure" DROP COLUMN "aiSuggestion",
ADD COLUMN     "aiAnalyzedAt" TIMESTAMP(3),
ADD COLUMN     "aiResult" JSONB,
ADD COLUMN     "aiStatus" "AiStatus" NOT NULL DEFAULT 'NOT_STARTED';
