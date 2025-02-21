-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentIntent" TEXT,
ALTER COLUMN "shippingAddress" SET DATA TYPE TEXT;
