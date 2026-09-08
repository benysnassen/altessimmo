-- CreateEnum
CREATE TYPE "ContactHorizon" AS ENUM ('IMMEDIATE', 'SIX_MONTHS', 'EXPLORING');

-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "horizon" "ContactHorizon",
ADD COLUMN     "sourcePage" TEXT;

