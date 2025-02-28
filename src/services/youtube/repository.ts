import {
  PrismaClient,
  YoutubeChannel,
  YoutubeVideoCache,
} from "@prisma/client";

/**
 * Repository for YouTube data access
 * Handles all database operations related to YouTube content
 */
export class YoutubeRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient = new PrismaClient()) {
    this.prisma = prisma;
  }

  /**
   * Add or update a YouTube channel in the database
   */
  async upsertChannel(channelData: {
    channelId: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    subscriberCount?: number;
  }): Promise<YoutubeChannel> {
    return this.prisma.youtubeChannel.upsert({
      where: { channelId: channelData.channelId },
      update: {
        title: channelData.title,
        description: channelData.description,
        thumbnailUrl: channelData.thumbnailUrl,
        subscriberCount: channelData.subscriberCount,
        lastUpdated: new Date(),
      },
      create: {
        channelId: channelData.channelId,
        title: channelData.title,
        description: channelData.description || null,
        thumbnailUrl: channelData.thumbnailUrl || null,
        subscriberCount: channelData.subscriberCount || null,
        lastUpdated: new Date(),
      },
    });
  }

  /**
   * Add or update a YouTube video in the database
   */
  async upsertVideo(videoData: {
    videoId: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    channelTitle: string;
    channelId: string;
    publishedAt: string;
    duration: string;
    durationSeconds: number;
    viewCount?: number;
    likeCount?: number;
    theme?: string;
    state?: string;
  }): Promise<YoutubeVideoCache> {
    return this.prisma.youtubeVideoCache.upsert({
      where: { videoId: videoData.videoId },
      update: {
        title: videoData.title,
        description: videoData.description,
        thumbnailUrl: videoData.thumbnailUrl,
        channelTitle: videoData.channelTitle,
        publishedAt: videoData.publishedAt,
        videoUrl: `https://www.youtube.com/watch?v=${videoData.videoId}`,
        duration: videoData.duration,
        durationSeconds: videoData.durationSeconds,
        viewCount: videoData.viewCount || null,
        likeCount: videoData.likeCount || null,
        theme: videoData.theme || null,
        state: videoData.state || "A voir !",
        lastFetched: new Date(),
      },
      create: {
        videoId: videoData.videoId,
        title: videoData.title,
        description: videoData.description,
        thumbnailUrl: videoData.thumbnailUrl,
        channelTitle: videoData.channelTitle,
        channelId: videoData.channelId,
        publishedAt: videoData.publishedAt,
        videoUrl: `https://www.youtube.com/watch?v=${videoData.videoId}`,
        duration: videoData.duration,
        durationSeconds: videoData.durationSeconds,
        viewCount: videoData.viewCount || null,
        likeCount: videoData.likeCount || null,
        theme: videoData.theme || null,
        state: videoData.state || "A voir !",
        lastFetched: new Date(),
      },
    });
  }

  /**
   * Get videos by state
   */
  async getVideosByState(state: string): Promise<YoutubeVideoCache[]> {
    return this.prisma.youtubeVideoCache.findMany({
      where: { state },
      orderBy: { publishedAt: "desc" },
    });
  }

  /**
   * Update the state of a video
   */
  async upsertVideoState(videoId: string, state: string): Promise<void> {
    // Update state in VideoState table
    await this.prisma.videoState.upsert({
      where: { videoId },
      update: { state },
      create: {
        videoId,
        state,
      },
    });

    // Update state in video cache
    await this.prisma.youtubeVideoCache.update({
      where: { videoId },
      data: { state },
    });
  }

  /**
   * Get all themes
   */
  async getAllThemes() {
    return this.prisma.theme.findMany({
      orderBy: { name: "asc" },
    });
  }

  /**
   * Add or update a theme
   */
  async upsertTheme(themeName: string) {
    return this.prisma.theme.upsert({
      where: { name: themeName },
      update: {},
      create: {
        name: themeName,
      },
    });
  }

  /**
   * Add or update a video-theme association
   */
  async upsertVideoTheme(videoId: string, themeId: string) {
    return this.prisma.videoTheme.upsert({
      where: {
        videoId_themeId: {
          videoId,
          themeId,
        },
      },
      update: {},
      create: {
        videoId,
        themeId,
      },
    });
  }

  /**
   * Clean up Prisma connection
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
