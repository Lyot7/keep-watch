import {
  PrismaClient,
  YoutubeChannel,
  YoutubeVideoCache,
} from "@prisma/client";

// Repository layer - handles database operations
class YoutubeRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

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

  async getVideosByState(state: string): Promise<YoutubeVideoCache[]> {
    return this.prisma.youtubeVideoCache.findMany({
      where: { state },
      orderBy: { publishedAt: "desc" },
    });
  }

  async upsertVideoState(videoId: string, state: string): Promise<void> {
    // Mettre à jour l'état dans la table VideoState
    await this.prisma.videoState.upsert({
      where: { videoId },
      update: { state },
      create: {
        videoId,
        state,
      },
    });

    // Mettre à jour l'état dans la cache des vidéos
    await this.prisma.youtubeVideoCache.update({
      where: { videoId },
      data: { state },
    });
  }

  async getAllThemes() {
    return this.prisma.theme.findMany({
      orderBy: { name: "asc" },
    });
  }

  async upsertTheme(themeName: string) {
    return this.prisma.theme.upsert({
      where: { name: themeName },
      update: {},
      create: {
        name: themeName,
      },
    });
  }

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
}

// Service layer - implements business logic
export class YoutubeService {
  private repository: YoutubeRepository;

  constructor() {
    const prisma = new PrismaClient();
    this.repository = new YoutubeRepository(prisma);
  }

  /**
   * Ajoute ou met à jour une chaîne YouTube dans la base de données
   */
  async upsertChannel(channelData: {
    channelId: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    subscriberCount?: number;
  }): Promise<YoutubeChannel> {
    return this.repository.upsertChannel(channelData);
  }

  /**
   * Ajoute ou met à jour une vidéo YouTube dans la base de données
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
    // S'assurer que la chaîne existe
    await this.upsertChannel({
      channelId: videoData.channelId,
      title: videoData.channelTitle,
    });

    return this.repository.upsertVideo(videoData);
  }

  /**
   * Récupère les vidéos en fonction de l'état
   */
  async getVideosByState(state: string): Promise<YoutubeVideoCache[]> {
    return this.repository.getVideosByState(state);
  }

  /**
   * Met à jour l'état d'une vidéo
   */
  async updateVideoState(videoId: string, state: string): Promise<void> {
    await this.repository.upsertVideoState(videoId, state);
  }

  /**
   * Récupère tous les thèmes disponibles
   */
  async getAllThemes() {
    return this.repository.getAllThemes();
  }

  /**
   * Ajoute un thème à une vidéo
   */
  async addThemeToVideo(videoId: string, themeName: string) {
    // Créer ou récupérer le thème
    const theme = await this.repository.upsertTheme(themeName);

    // Associer le thème à la vidéo
    return this.repository.upsertVideoTheme(videoId, theme.id);
  }
}

// Export a singleton instance
const youtubeService = new YoutubeService();
export default youtubeService;
