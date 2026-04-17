-- Add normalized phone fields for deduplication without breaking existing data.
ALTER TABLE "contacts" ADD COLUMN "phoneNormalized" TEXT;
ALTER TABLE "buyers" ADD COLUMN "phoneNormalized" TEXT;
ALTER TABLE "sellers" ADD COLUMN "phoneNormalized" TEXT;

-- Backfill from current phone values where possible.
UPDATE "contacts" SET "phoneNormalized" = regexp_replace("phone", '[^0-9]+', '', 'g') WHERE "phone" IS NOT NULL AND "phone" <> '';
UPDATE "buyers" SET "phoneNormalized" = regexp_replace("phone", '[^0-9]+', '', 'g') WHERE "phone" IS NOT NULL AND "phone" <> '';
UPDATE "sellers" SET "phoneNormalized" = regexp_replace("phone", '[^0-9]+', '', 'g') WHERE "phone" IS NOT NULL AND "phone" <> '';

-- If duplicates already exist, keep one normalized value and null out the rest.
WITH ranked AS (
  SELECT "id", row_number() OVER (PARTITION BY "phoneNormalized" ORDER BY "createdAt" ASC) AS rn
  FROM "buyers"
  WHERE "phoneNormalized" IS NOT NULL
)
UPDATE "buyers" b
SET "phoneNormalized" = NULL
FROM ranked r
WHERE b."id" = r."id" AND r.rn > 1;

WITH ranked AS (
  SELECT "id", row_number() OVER (PARTITION BY "phoneNormalized" ORDER BY "createdAt" ASC) AS rn
  FROM "sellers"
  WHERE "phoneNormalized" IS NOT NULL
)
UPDATE "sellers" s
SET "phoneNormalized" = NULL
FROM ranked r
WHERE s."id" = r."id" AND r.rn > 1;

WITH ranked AS (
  SELECT "id", row_number() OVER (PARTITION BY "phoneNormalized", "type" ORDER BY "createdAt" ASC) AS rn
  FROM "contacts"
  WHERE "phoneNormalized" IS NOT NULL
)
UPDATE "contacts" c
SET "phoneNormalized" = NULL
FROM ranked r
WHERE c."id" = r."id" AND r.rn > 1;

CREATE UNIQUE INDEX "contacts_phoneNormalized_key" ON "contacts"("phoneNormalized");
CREATE UNIQUE INDEX "buyers_phoneNormalized_key" ON "buyers"("phoneNormalized");
CREATE UNIQUE INDEX "sellers_phoneNormalized_key" ON "sellers"("phoneNormalized");
