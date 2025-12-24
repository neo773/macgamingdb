-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "details" TEXT,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aggregatedPerformance" TEXT,
    "reviewCount" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "MacConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GameReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playMethod" TEXT NOT NULL,
    "translationLayer" TEXT,
    "performance" TEXT NOT NULL,
    "fps" INTEGER,
    "graphicsSettings" TEXT,
    "resolution" TEXT,
    "chipset" TEXT NOT NULL,
    "chipsetVariant" TEXT NOT NULL,
    "macConfigId" TEXT,
    "notes" TEXT,
    "screenshots" TEXT,
    "softwareVersion" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GameReview_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GameReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GameReview_macConfigId_fkey" FOREIGN KEY ("macConfigId") REFERENCES "MacConfig" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expiresAt" DATETIME NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" DATETIME,
    "refreshTokenExpiresAt" DATETIME,
    "scope" TEXT,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME,
    "updatedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "Game_aggregatedPerformance_id_idx" ON "Game"("aggregatedPerformance", "id");

-- CreateIndex
CREATE INDEX "Game_reviewCount_idx" ON "Game"("reviewCount");

-- CreateIndex
CREATE INDEX "Game_aggregatedPerformance_reviewCount_idx" ON "Game"("aggregatedPerformance", "reviewCount");

-- CreateIndex
CREATE UNIQUE INDEX "MacConfig_identifier_key" ON "MacConfig"("identifier");

-- CreateIndex
CREATE INDEX "GameReview_gameId_chipset_idx" ON "GameReview"("gameId", "chipset");

-- CreateIndex
CREATE INDEX "GameReview_gameId_playMethod_idx" ON "GameReview"("gameId", "playMethod");

-- CreateIndex
CREATE INDEX "GameReview_gameId_chipset_chipsetVariant_idx" ON "GameReview"("gameId", "chipset", "chipsetVariant");

-- CreateIndex
CREATE INDEX "GameReview_gameId_chipset_playMethod_idx" ON "GameReview"("gameId", "chipset", "playMethod");

-- CreateIndex
CREATE INDEX "GameReview_macConfigId_idx" ON "GameReview"("macConfigId");

-- CreateIndex
CREATE INDEX "GameReview_chipset_chipsetVariant_playMethod_performance_idx" ON "GameReview"("chipset", "chipsetVariant", "playMethod", "performance");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");
