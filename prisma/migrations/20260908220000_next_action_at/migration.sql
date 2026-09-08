-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "nextActionAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "buyers" ADD COLUMN     "nextActionAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "sellers" ADD COLUMN     "nextActionAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "contacts_nextActionAt_idx" ON "contacts"("nextActionAt");

-- CreateIndex
CREATE INDEX "buyers_nextActionAt_idx" ON "buyers"("nextActionAt");

-- CreateIndex
CREATE INDEX "sellers_nextActionAt_idx" ON "sellers"("nextActionAt");
