-- CreateEnum
CREATE TYPE "SellerVerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PayoutSchedule" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER', 'INVENTORY', 'PAYOUT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailQueue" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "SellerVerificationStatus" NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessAddress" JSONB NOT NULL,
    "taxId" TEXT NOT NULL,
    "bankInfo" JSONB NOT NULL,
    "payoutSchedule" "PayoutSchedule" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerSettings" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "notificationPrefs" JSONB NOT NULL,
    "autoRestock" BOOLEAN NOT NULL DEFAULT false,
    "minStockAlert" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerAnalytics" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "period" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerNotification" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Seller_userId_key" ON "Seller"("userId");

-- CreateIndex
CREATE INDEX "Seller_status_idx" ON "Seller"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SellerSettings_sellerId_key" ON "SellerSettings"("sellerId");

-- CreateIndex
CREATE INDEX "SellerAnalytics_sellerId_idx" ON "SellerAnalytics"("sellerId");

-- CreateIndex
CREATE INDEX "SellerAnalytics_period_idx" ON "SellerAnalytics"("period");

-- CreateIndex
CREATE INDEX "SellerNotification_sellerId_idx" ON "SellerNotification"("sellerId");

-- CreateIndex
CREATE INDEX "SellerNotification_type_idx" ON "SellerNotification"("type");

-- CreateIndex
CREATE INDEX "SellerNotification_read_idx" ON "SellerNotification"("read");

-- AddForeignKey
ALTER TABLE "Seller" ADD CONSTRAINT "Seller_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerSettings" ADD CONSTRAINT "SellerSettings_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerAnalytics" ADD CONSTRAINT "SellerAnalytics_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerNotification" ADD CONSTRAINT "SellerNotification_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
