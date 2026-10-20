CREATE TYPE "RoleCode" AS ENUM ('USER', 'ANCHOR', 'REVIEWER', 'ADMIN');
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'LOCKED', 'DISABLED');
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'OFFLINE');
CREATE TYPE "LiveStatus" AS ENUM ('CREATED', 'LIVE', 'RECONNECTING', 'ENDED');
CREATE TYPE "LedgerDirection" AS ENUM ('CREDIT', 'DEBIT');

CREATE TABLE "User" ("id" TEXT NOT NULL, "username" TEXT NOT NULL, "displayName" TEXT NOT NULL, "passwordHash" TEXT NOT NULL, "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE', "avatarUrl" TEXT, "bio" TEXT, "failedLoginCount" INTEGER NOT NULL DEFAULT 0, "lockedUntil" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Role" ("id" TEXT NOT NULL, "code" "RoleCode" NOT NULL, "name" TEXT NOT NULL, "permissions" TEXT[], CONSTRAINT "Role_pkey" PRIMARY KEY ("id"));
CREATE TABLE "UserRole" ("userId" TEXT NOT NULL, "roleId" TEXT NOT NULL, CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId", "roleId"));
CREATE TABLE "Wallet" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "balance" INTEGER NOT NULL DEFAULT 0, "version" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id"));
CREATE TABLE "LedgerEntry" ("id" TEXT NOT NULL, "walletId" TEXT NOT NULL, "direction" "LedgerDirection" NOT NULL, "amount" INTEGER NOT NULL, "balanceAfter" INTEGER NOT NULL, "reason" TEXT NOT NULL, "idempotencyKey" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Circle" ("id" TEXT NOT NULL, "slug" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT NOT NULL, "entryCoins" INTEGER NOT NULL DEFAULT 0, "ownerId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Circle_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Post" ("id" TEXT NOT NULL, "authorId" TEXT NOT NULL, "circleId" TEXT, "title" TEXT NOT NULL, "body" TEXT NOT NULL, "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Post_pkey" PRIMARY KEY ("id"));
CREATE TABLE "LiveRoom" ("id" TEXT NOT NULL, "anchorId" TEXT NOT NULL, "title" TEXT NOT NULL, "status" "LiveStatus" NOT NULL DEFAULT 'CREATED', "viewerCoins" INTEGER NOT NULL DEFAULT 0, "secondViewCoins" INTEGER NOT NULL DEFAULT 0, "streamKey" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "LiveRoom_pkey" PRIMARY KEY ("id"));
CREATE TABLE "RefreshToken" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "tokenHash" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL, "revokedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id"));
CREATE TABLE "AuditLog" ("id" TEXT NOT NULL, "actorId" TEXT, "action" TEXT NOT NULL, "entityType" TEXT NOT NULL, "entityId" TEXT, "before" JSONB, "after" JSONB, "ipAddress" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"));
CREATE TABLE "SystemSetting" ("key" TEXT NOT NULL, "value" JSONB NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key"));

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");
CREATE UNIQUE INDEX "LedgerEntry_idempotencyKey_key" ON "LedgerEntry"("idempotencyKey");
CREATE UNIQUE INDEX "Circle_slug_key" ON "Circle"("slug");
CREATE UNIQUE INDEX "LiveRoom_streamKey_key" ON "LiveRoom"("streamKey");
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Circle" ADD CONSTRAINT "Circle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Post" ADD CONSTRAINT "Post_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LiveRoom" ADD CONSTRAINT "LiveRoom_anchorId_fkey" FOREIGN KEY ("anchorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
