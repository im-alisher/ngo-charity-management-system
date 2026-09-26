-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF', 'VIEWER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'VIEWER';

-- The account that existed before roles were introduced owns this system, so
-- it is promoted to ADMIN. Everyone created afterwards defaults to VIEWER.
UPDATE "users" SET "role" = 'ADMIN';
