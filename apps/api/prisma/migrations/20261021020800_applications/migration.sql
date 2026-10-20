CREATE TYPE "ApplicationType" AS ENUM ('ACCOUNT_MERGE', 'JOIN_US');
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'PROCESSING', 'APPROVED', 'REJECTED');
CREATE TABLE "Application" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "type" "ApplicationType" NOT NULL, "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED', "payload" JSONB NOT NULL, "remark" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Application_pkey" PRIMARY KEY ("id"));
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
