ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "defaultVariantId" TEXT;

UPDATE "Product"
SET "defaultVariantId" = "variants"->0->>'id'
WHERE "defaultVariantId" IS NULL;

CREATE INDEX IF NOT EXISTS "Product_storeId_createdAt_idx"
ON "Product"("storeId", "createdAt");

CREATE INDEX IF NOT EXISTS "Product_storeId_maxPrice_idx"
ON "Product"("storeId", "maxPrice");

CREATE INDEX IF NOT EXISTS "Product_storeId_title_idx"
ON "Product"("storeId", "title");

CREATE INDEX IF NOT EXISTS "Event_storeId_sessionId_timestamp_idx"
ON "Event"("storeId", "sessionId", "timestamp");

CREATE INDEX IF NOT EXISTS "Event_storeId_customerId_timestamp_idx"
ON "Event"("storeId", "customerId", "timestamp");

CREATE INDEX IF NOT EXISTS "Event_storeId_type_timestamp_idx"
ON "Event"("storeId", "type", "timestamp");

CREATE INDEX IF NOT EXISTS "Product_attributes_gin_idx"
ON "Product" USING GIN ("attributes");
