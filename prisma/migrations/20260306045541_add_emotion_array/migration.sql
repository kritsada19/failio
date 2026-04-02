/*
  Warnings:

  - You are about to drop the column `emotionId` on the `Failure` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Failure" DROP CONSTRAINT "Failure_emotionId_fkey";

-- AlterTable
ALTER TABLE "Failure" DROP COLUMN "emotionId";

-- CreateTable
CREATE TABLE "_EmotionToFailure" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EmotionToFailure_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EmotionToFailure_B_index" ON "_EmotionToFailure"("B");

-- AddForeignKey
ALTER TABLE "_EmotionToFailure" ADD CONSTRAINT "_EmotionToFailure_A_fkey" FOREIGN KEY ("A") REFERENCES "Emotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmotionToFailure" ADD CONSTRAINT "_EmotionToFailure_B_fkey" FOREIGN KEY ("B") REFERENCES "Failure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
