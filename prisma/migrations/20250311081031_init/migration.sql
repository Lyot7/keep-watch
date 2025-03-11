-- CreateTable
CREATE TABLE "YoutubeChannel" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "subscriberCount" INTEGER,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "YoutubeChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YoutubeVideoCache" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "channelTitle" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "publishedAt" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "theme" TEXT,
    "state" TEXT NOT NULL DEFAULT 'A voir !',
    "viewCount" INTEGER,
    "likeCount" INTEGER,
    "lastFetched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YoutubeVideoCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoState" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "duration" TEXT,
    "durationSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "rating" INTEGER,

    CONSTRAINT "VideoState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Theme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoTheme" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiQuotaUsage" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quotaUsed" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,

    CONSTRAINT "ApiQuotaUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeChannel_channelId_key" ON "YoutubeChannel"("channelId");

-- CreateIndex
CREATE INDEX "YoutubeChannel_channelId_idx" ON "YoutubeChannel"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeVideoCache_videoId_key" ON "YoutubeVideoCache"("videoId");

-- CreateIndex
CREATE INDEX "YoutubeVideoCache_channelId_idx" ON "YoutubeVideoCache"("channelId");

-- CreateIndex
CREATE INDEX "YoutubeVideoCache_state_idx" ON "YoutubeVideoCache"("state");

-- CreateIndex
CREATE INDEX "YoutubeVideoCache_publishedAt_idx" ON "YoutubeVideoCache"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VideoState_videoId_key" ON "VideoState"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_name_key" ON "Theme"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VideoTheme_videoId_themeId_key" ON "VideoTheme"("videoId", "themeId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiQuotaUsage_date_key" ON "ApiQuotaUsage"("date");

-- AddForeignKey
ALTER TABLE "YoutubeVideoCache" ADD CONSTRAINT "YoutubeVideoCache_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "YoutubeChannel"("channelId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoState" ADD CONSTRAINT "VideoState_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "YoutubeVideoCache"("videoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTheme" ADD CONSTRAINT "VideoTheme_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "YoutubeVideoCache"("videoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTheme" ADD CONSTRAINT "VideoTheme_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
