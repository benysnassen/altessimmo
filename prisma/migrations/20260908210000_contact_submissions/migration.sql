-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "message" TEXT,
    "budget" TEXT,
    "estimation" TEXT,
    "horizon" "ContactHorizon",
    "sourcePage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_submissions_contactId_createdAt_idx" ON "contact_submissions"("contactId", "createdAt");

-- AddForeignKey
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
