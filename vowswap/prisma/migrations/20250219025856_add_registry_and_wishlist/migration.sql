/*
  Warnings:

  - You are about to drop the column `emailsSent` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `paymentIntent` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `trackingNumber` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `isVisible` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `Product` table. All the data in the column will be lost.
  - The `status` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `privacyStatus` column on the `Registry` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Registry` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `priority` column on the `RegistryItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `RegistryItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `isActive` on the `Seller` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Seller` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Seller` table. All the data in the column will be lost.
  - You are about to drop the column `storeName` on the `Seller` table. All the data in the column will be lost.
  - You are about to drop the column `stripeAccountId` on the `Seller` table. All the data in the column will be lost.
  - You are about to drop the column `totalRevenue` on the `Seller` table. All the data in the column will be lost.
  - You are about to drop the column `totalSales` on the `Seller` table. All the data in the column will be lost.
  - You are about to drop the column `verificationStatus` on the `Seller` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hashedPassword` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Wishlist` table. All the data in the column will be lost.
  - You are about to drop the column `privacyStatus` on the `Wishlist` table. All the data in the column will be lost.
  - The `priority` column on the `WishlistItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AdminAction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CartItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderStatusHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SellerAnalytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SellerNotification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SellerSettings` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sellerId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `shippingAddress` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `eventLocation` on table `Registry` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `businessName` to the `Seller` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Wishlist` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_userId_fkey";

-- DropForeignKey
ALTER TABLE "AdminAction" DROP CONSTRAINT "AdminAction_userId_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_userId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "OrderStatusHistory" DROP CONSTRAINT "OrderStatusHistory_orderId_fkey";

-- DropForeignKey
ALTER TABLE "SellerAnalytics" DROP CONSTRAINT "SellerAnalytics_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "SellerNotification" DROP CONSTRAINT "SellerNotification_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "SellerSettings" DROP CONSTRAINT "SellerSettings_sellerId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "emailsSent",
DROP COLUMN "notes",
DROP COLUMN "paymentIntent",
DROP COLUMN "paymentStatus",
DROP COLUMN "trackingNumber",
ADD COLUMN     "paymentDetails" JSONB,
ADD COLUMN     "sellerId" TEXT NOT NULL,
DROP COLUMN "shippingAddress",
ADD COLUMN     "shippingAddress" JSONB NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "isVisible",
DROP COLUMN "viewCount",
ALTER COLUMN "inventory" DROP DEFAULT,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Registry" ALTER COLUMN "eventType" DROP DEFAULT,
DROP COLUMN "privacyStatus",
ADD COLUMN     "privacyStatus" TEXT NOT NULL DEFAULT 'PUBLIC',
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "eventLocation" SET NOT NULL;

-- AlterTable
ALTER TABLE "RegistryItem" ALTER COLUMN "quantity" SET DEFAULT 1,
DROP COLUMN "priority",
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'LOW',
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "Seller" DROP COLUMN "isActive",
DROP COLUMN "phoneNumber",
DROP COLUMN "rating",
DROP COLUMN "storeName",
DROP COLUMN "stripeAccountId",
DROP COLUMN "totalRevenue",
DROP COLUMN "totalSales",
DROP COLUMN "verificationStatus",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "businessName" TEXT NOT NULL,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "hashedPassword",
DROP COLUMN "role",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Wishlist" DROP COLUMN "name",
DROP COLUMN "privacyStatus",
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WishlistItem" DROP COLUMN "priority",
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'LOW';

-- DropTable
DROP TABLE "Address";

-- DropTable
DROP TABLE "AdminAction";

-- DropTable
DROP TABLE "CartItem";

-- DropTable
DROP TABLE "OrderStatusHistory";

-- DropTable
DROP TABLE "SellerAnalytics";

-- DropTable
DROP TABLE "SellerNotification";

-- DropTable
DROP TABLE "SellerSettings";

-- DropEnum
DROP TYPE "ItemStatus";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "OrderStatus";

-- DropEnum
DROP TYPE "PayoutSchedule";

-- DropEnum
DROP TYPE "Priority";

-- DropEnum
DROP TYPE "PrivacyStatus";

-- DropEnum
DROP TYPE "ProductStatus";

-- DropEnum
DROP TYPE "RegistryStatus";

-- DropEnum
DROP TYPE "SellerVerificationStatus";

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
