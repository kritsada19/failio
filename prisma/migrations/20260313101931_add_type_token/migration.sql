-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('EMAIL_VERIFY', 'PASSWORD_RESET');

-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "type" "TokenType" NOT NULL DEFAULT 'EMAIL_VERIFY';
