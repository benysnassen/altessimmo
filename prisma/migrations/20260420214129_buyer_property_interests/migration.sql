-- CreateTable
CREATE TABLE "buyer_property_interests" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "note" TEXT,
    "snapshotPrice" TEXT,
    "snapshotRooms" INTEGER,
    "snapshotLocation" TEXT,
    "snapshotNeighborhood" TEXT,
    "snapshotPropertyType" TEXT,
    "snapshotSurface" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "buyer_property_interests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "buyer_property_interests_buyerId_propertyId_key" ON "buyer_property_interests"("buyerId", "propertyId");

-- AddForeignKey
ALTER TABLE "buyer_property_interests" ADD CONSTRAINT "buyer_property_interests_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_property_interests" ADD CONSTRAINT "buyer_property_interests_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
