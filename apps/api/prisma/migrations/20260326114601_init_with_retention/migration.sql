-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "coinType" TEXT NOT NULL DEFAULT 'FREE',
ADD COLUMN     "iapTransactionId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "freeCoins" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "paidCoins" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "DailyStreak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "maxStreak" INTEGER NOT NULL DEFAULT 0,
    "lastCheckinAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyMission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "reward" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyMission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IapReceipt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "originalTransactionId" TEXT,
    "purchaseToken" TEXT,
    "environment" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "coinAmount" INTEGER NOT NULL,
    "priceKrw" INTEGER NOT NULL,
    "receiptData" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IapReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IapProduct" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coinAmount" INTEGER NOT NULL,
    "priceKrw" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IapProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyStreak_userId_key" ON "DailyStreak"("userId");

-- CreateIndex
CREATE INDEX "DailyMission_userId_date_idx" ON "DailyMission"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyMission_userId_date_type_key" ON "DailyMission"("userId", "date", "type");

-- CreateIndex
CREATE UNIQUE INDEX "IapReceipt_transactionId_key" ON "IapReceipt"("transactionId");

-- CreateIndex
CREATE INDEX "IapReceipt_userId_createdAt_idx" ON "IapReceipt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "IapReceipt_platform_productId_idx" ON "IapReceipt"("platform", "productId");

-- CreateIndex
CREATE INDEX "IapReceipt_status_idx" ON "IapReceipt"("status");

-- CreateIndex
CREATE UNIQUE INDEX "IapProduct_productId_key" ON "IapProduct"("productId");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- AddForeignKey
ALTER TABLE "DailyStreak" ADD CONSTRAINT "DailyStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMission" ADD CONSTRAINT "DailyMission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IapReceipt" ADD CONSTRAINT "IapReceipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
