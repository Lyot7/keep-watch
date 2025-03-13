import { YoutubeVideo } from "@/frontend/pages/api/youtube/getYoutubeVideos";
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

    // Get the most recent video from our cache
    const latestCachedVideo = await prisma.youtubeVideoCache.findFirst({
      where: { channelId },
      orderBy: { publishedAt: "desc" },
      select: { publishedAt: true },
    });

    if (!latestCachedVideo) return true;

    // Check if cache TTL has expired
    const now = new Date();
    const lastFetched = new Date(latestCachedVideo.publishedAt);
    const timeDiff = now.getTime() - lastFetched.getTime();

    if (timeDiff > cacheTtlMs) {
      // If cache is old, check latest video from YouTube API
      const apiKey = process.env.YOUTUBE_API_KEY;

      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&order=date&maxResults=1&type=video`
        );

        if (!response.ok) {
          console.log(`YouTube API error, using cache: ${response.statusText}`);
          return false;
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
          console.log("No new videos found, using cache");
          return false;
        }

        const latestYouTubeVideo = data.items[0].snippet.publishedAt;
        const latestYouTubeDate = new Date(latestYouTubeVideo);

        // Compare dates to see if there are new videos
        return latestYouTubeDate > lastFetched;
      } catch (error) {
        console.error("Error checking for new videos:", error);
        return false; // On error, use cache
      }
    }

    return false;
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
    // Ensure the channel exists first
    await prisma.youtubeChannel.upsert({
      where: { channelId },
      update: {
        lastUpdated: new Date(),
      },
      create: {
        channelId,
        title: videos[0]?.channelTitle || "Unknown Channel",
        lastUpdated: new Date(),
      },
    });

    // Now cache the videos
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
