-- CreateTable
CREATE TABLE "AnalystPost" (
    "id" TEXT NOT NULL,
    "character" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "reasoning" TEXT,
    "symbols" TEXT[],
    "eventType" TEXT,
    "timeframe" TEXT NOT NULL,
    "longCount" INTEGER NOT NULL DEFAULT 0,
    "shortCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalystPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPosition" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HumanIndicator" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "longPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shortPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalVotes" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HumanIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserPosition_postId_idx" ON "UserPosition"("postId");

-- CreateIndex
CREATE INDEX "UserPosition_userId_idx" ON "UserPosition"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPosition_userId_postId_key" ON "UserPosition"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "HumanIndicator_postId_key" ON "HumanIndicator"("postId");

-- CreateIndex
CREATE INDEX "HumanIndicator_postId_idx" ON "HumanIndicator"("postId");

-- AddForeignKey
ALTER TABLE "UserPosition" ADD CONSTRAINT "UserPosition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPosition" ADD CONSTRAINT "UserPosition_postId_fkey" FOREIGN KEY ("postId") REFERENCES "AnalystPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanIndicator" ADD CONSTRAINT "HumanIndicator_postId_fkey" FOREIGN KEY ("postId") REFERENCES "AnalystPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
