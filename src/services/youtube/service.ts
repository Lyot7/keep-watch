import { VideoStateEnum, YoutubeVideo } from "@/types/youtube";
import { google, youtube_v3 } from "googleapis";
import { YoutubeRepository } from "./repository";

/**
 * Service for YouTube functionality
 * Handles business logic and external API calls
 */
export class YoutubeService {
  private repository: YoutubeRepository;
  private youtube: youtube_v3.Youtube;

  constructor(apiKey: string) {
    this.repository = new YoutubeRepository();
    this.youtube = google.youtube({
      version: "v3",
      auth: apiKey,
    });
  }

  /**
   * Fetch channel details from YouTube API
   */
  async fetchChannelDetails(channelId: string) {
    try {
      const response = await this.youtube.channels.list({
        part: ["snippet", "statistics"],
        id: [channelId],
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error(`Channel with ID ${channelId} not found`);
      }

      const channel = response.data.items[0];
      const snippet = channel.snippet;
      const statistics = channel.statistics;

      // Save channel to database
      await this.repository.upsertChannel({
        channelId,
        title: snippet?.title || "",
        description: snippet?.description ?? undefined,
        thumbnailUrl: snippet?.thumbnails?.default?.url ?? undefined,
        subscriberCount: statistics?.subscriberCount
          ? parseInt(statistics.subscriberCount)
          : undefined,
      });

      return channel;
    } catch (error) {
      console.error("Error fetching channel details:", error);
      throw error;
    }
  }

  /**
   * Fetch latest videos from a channel
   */
  async fetchChannelVideos(
    channelId: string,
    maxResults: number = 10
  ): Promise<YoutubeVideo[]> {
    try {
      // Get uploads playlist ID for the channel
      const channelResponse = await this.youtube.channels.list({
        part: ["contentDetails"],
        id: [channelId],
      });

      if (
        !channelResponse.data.items ||
        channelResponse.data.items.length === 0
      ) {
        throw new Error(`Channel with ID ${channelId} not found`);
      }

      const uploadsPlaylistId =
        channelResponse.data.items[0].contentDetails?.relatedPlaylists?.uploads;

      if (!uploadsPlaylistId) {
        throw new Error("Uploads playlist not found for channel");
      }

      // Get videos from uploads playlist
      const playlistResponse = await this.youtube.playlistItems.list({
        part: ["snippet", "contentDetails"],
        playlistId: uploadsPlaylistId,
        maxResults,
      });

      if (!playlistResponse.data.items) {
        return [];
      }

      // Get detailed video information
      const videoIds = playlistResponse.data.items
        .map((item) => item.contentDetails?.videoId || "")
        .filter((id) => id !== "");

      const videosResponse = await this.youtube.videos.list({
        part: ["snippet", "contentDetails", "statistics"],
        id: videoIds,
      });

      if (!videosResponse.data.items) {
        return [];
      }

      // Process and save videos
      const videos = await Promise.all(
        videosResponse.data.items.map(async (item) => {
          if (!item.id || !item.snippet) {
            throw new Error("Missing video ID or snippet");
          }

          const snippet = item.snippet;
          const contentDetails = item.contentDetails;
          const statistics = item.statistics;

          // Parse duration
          const duration = contentDetails?.duration || "PT0S";
          const durationSeconds = this.parseDuration(duration);

          // Save video to database
          const savedVideo = await this.repository.upsertVideo({
            videoId: item.id,
            title: snippet.title || "",
            description: snippet.description || "",
            thumbnailUrl:
              snippet.thumbnails?.high?.url ||
              snippet.thumbnails?.default?.url ||
              "",
            channelTitle: snippet.channelTitle || "",
            channelId: snippet.channelId || "",
            publishedAt: snippet.publishedAt || new Date().toISOString(),
            duration,
            durationSeconds,
            viewCount: statistics?.viewCount
              ? parseInt(statistics.viewCount)
              : undefined,
            likeCount: statistics?.likeCount
              ? parseInt(statistics.likeCount)
              : undefined,
          });

          // Map to YoutubeVideo interface
          return {
            id: savedVideo.videoId,
            title: savedVideo.title,
            description: savedVideo.description,
            thumbnailUrl: savedVideo.thumbnailUrl,
            channelTitle: savedVideo.channelTitle,
            channelId: savedVideo.channelId,
            publishedAt: savedVideo.publishedAt,
            videoUrl: savedVideo.videoUrl,
            duration: savedVideo.duration,
            durationSeconds: savedVideo.durationSeconds,
            theme: savedVideo.theme ?? undefined,
            state: savedVideo.state as VideoStateEnum,
          };
        })
      );

      return videos;
    } catch (error) {
      console.error("Error fetching channel videos:", error);
      throw error;
    }
  }

  /**
   * Get videos by state
   */
  async getVideosByState(state: VideoStateEnum): Promise<YoutubeVideo[]> {
    try {
      const videos = await this.repository.getVideosByState(state);

      return videos.map((video) => ({
        id: video.videoId,
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl,
        channelTitle: video.channelTitle,
        channelId: video.channelId,
        publishedAt: video.publishedAt,
        videoUrl: video.videoUrl,
        duration: video.duration,
        durationSeconds: video.durationSeconds,
        theme: video.theme ?? undefined,
        state: video.state as VideoStateEnum,
      }));
    } catch (error) {
      console.error("Error getting videos by state:", error);
      throw error;
    }
  }

  /**
   * Update video state
   */
  async updateVideoState(
    videoId: string,
    state: VideoStateEnum
  ): Promise<void> {
    try {
      await this.repository.upsertVideoState(videoId, state);
    } catch (error) {
      console.error("Error updating video state:", error);
      throw error;
    }
  }

  /**
   * Parse ISO 8601 duration to seconds
   * @param duration ISO 8601 duration string (e.g., PT1H2M3S)
   * @returns Duration in seconds
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || "0", 10);
    const minutes = parseInt(match[2] || "0", 10);
    const seconds = parseInt(match[3] || "0", 10);

    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Clean up resources
   */
  async close(): Promise<void> {
    await this.repository.disconnect();
  }
}
