import { YoutubeVideo } from "@/pages/api/youtube/getYoutubeVideos";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Service pour gérer le cache des vidéos YouTube
 * Permet de réduire le nombre d'appels à l'API YouTube
 */
export class YoutubeVideoCache {
  /**
   * Vérifie si les vidéos d'une chaîne ont besoin d'être rafraîchies
   */
  static async needsRefresh(channelId: string): Promise<boolean> {
    const cacheTtlHours = parseInt(process.env.YOUTUBE_CACHE_TTL_HOURS || "24");
    const cacheTtlMs = cacheTtlHours * 60 * 60 * 1000;

    // Trouver la dernière vidéo mise en cache pour cette chaîne
    const latestVideo = await prisma.youtubeVideoCache.findFirst({
      where: { channelId },
      orderBy: { lastFetched: "desc" },
    });

    // Si pas de vidéos en cache ou cache expiré, rafraîchir
    if (!latestVideo) return true;

    const now = new Date();
    const lastFetched = new Date(latestVideo.lastFetched);
    const timeDiff = now.getTime() - lastFetched.getTime();

    return timeDiff > cacheTtlMs;
  }

  /**
   * Récupère les vidéos en cache pour une chaîne
   */
  static async getCachedVideos(channelId: string): Promise<YoutubeVideo[]> {
    const cachedVideos = await prisma.youtubeVideoCache.findMany({
      where: { channelId },
      orderBy: { publishedAt: "desc" },
    });

    return cachedVideos.map((video) => ({
      id: video.videoId,
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      channelTitle: video.channelTitle,
      publishedAt: video.publishedAt,
      videoUrl: video.videoUrl,
      duration: video.duration,
      durationSeconds: video.durationSeconds,
      theme: video.theme || undefined,
      state: video.state,
    }));
  }

  /**
   * Stocke les vidéos dans le cache
   */
  static async cacheVideos(
    videos: YoutubeVideo[],
    channelId: string
  ): Promise<void> {
    for (const video of videos) {
      await prisma.youtubeVideoCache.upsert({
        where: { videoId: video.id },
        update: {
          title: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl,
          channelTitle: video.channelTitle,
          publishedAt: video.publishedAt,
          videoUrl: video.videoUrl,
          duration: video.duration,
          durationSeconds: video.durationSeconds,
          theme: video.theme || null,
          state: video.state || "A voir !",
          lastFetched: new Date(),
        },
        create: {
          videoId: video.id,
          title: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl,
          channelTitle: video.channelTitle,
          channelId: channelId,
          publishedAt: video.publishedAt,
          videoUrl: video.videoUrl,
          duration: video.duration,
          durationSeconds: video.durationSeconds,
          theme: video.theme || null,
          state: video.state || "A voir !",
          lastFetched: new Date(),
        },
      });
    }
  }
}
