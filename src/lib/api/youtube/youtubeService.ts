import {
  PrismaClient,
  YoutubeChannel,
  YoutubeVideoCache,
} from "@prisma/client";

const prisma = new PrismaClient();

export class YoutubeService {
  /**
   * Ajoute ou met à jour une chaîne YouTube dans la base de données
   */
  static async upsertChannel(channelData: {
    channelId: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    subscriberCount?: number;
  }): Promise<YoutubeChannel> {
    return prisma.youtubeChannel.upsert({
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
   * Ajoute ou met à jour une vidéo YouTube dans la base de données
   */
  static async upsertVideo(videoData: {
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
    // S'assurer que la chaîne existe
    await this.upsertChannel({
      channelId: videoData.channelId,
      title: videoData.channelTitle,
    });

    return prisma.youtubeVideoCache.upsert({
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
   * Récupère les vidéos en fonction de l'état
   */
  static async getVideosByState(state: string): Promise<YoutubeVideoCache[]> {
    return prisma.youtubeVideoCache.findMany({
      where: { state },
      orderBy: { publishedAt: "desc" },
    });
  }

  /**
   * Met à jour l'état d'une vidéo
   */
  static async updateVideoState(videoId: string, state: string): Promise<void> {
    // Mettre à jour l'état dans la table VideoState
    await prisma.videoState.upsert({
      where: { videoId },
      update: { state },
      create: {
        videoId,
        state,
      },
    });

    // Mettre à jour l'état dans la cache des vidéos
    await prisma.youtubeVideoCache.update({
      where: { videoId },
      data: { state },
    });
  }

  /**
   * Récupère tous les thèmes disponibles
   */
  static async getAllThemes() {
    return prisma.theme.findMany({
      orderBy: { name: "asc" },
    });
  }

  /**
   * Ajoute un thème à une vidéo
   */
  static async addThemeToVideo(videoId: string, themeName: string) {
    // Créer ou récupérer le thème
    const theme = await prisma.theme.upsert({
      where: { name: themeName },
      update: {},
      create: {
        name: themeName,
      },
    });

    // Associer le thème à la vidéo
    return prisma.videoTheme.upsert({
      where: {
        videoId_themeId: {
          videoId,
          themeId: theme.id,
        },
      },
      update: {},
      create: {
        videoId,
        themeId: theme.id,
      },
    });
  }
}
