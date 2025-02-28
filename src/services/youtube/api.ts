import { VideoStateEnum, YoutubeVideo } from "@/types/youtube";
import { YoutubeService } from "./service";

/**
 * YouTube API wrapper class
 * Provides a clean interface for YouTube operations
 */
export class YoutubeApi {
  private service: YoutubeService;

  constructor() {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error(
        "YouTube API key is not defined in environment variables"
      );
    }
    this.service = new YoutubeService(apiKey);
  }

  /**
   * Fetch latest videos from a channel
   */
  async getLatestVideos(
    channelId: string,
    maxResults = 10
  ): Promise<YoutubeVideo[]> {
    try {
      return await this.service.fetchChannelVideos(channelId, maxResults);
    } catch (error) {
      console.error(
        `Error fetching latest videos for channel ${channelId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get channel details
   */
  async getChannelDetails(channelId: string) {
    try {
      return await this.service.fetchChannelDetails(channelId);
    } catch (error) {
      console.error(`Error fetching details for channel ${channelId}:`, error);
      throw error;
    }
  }

  /**
   * Get videos by state
   */
  async getVideosByState(state: VideoStateEnum): Promise<YoutubeVideo[]> {
    try {
      return await this.service.getVideosByState(state);
    } catch (error) {
      console.error(`Error fetching videos with state ${state}:`, error);
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
      await this.service.updateVideoState(videoId, state);
    } catch (error) {
      console.error(`Error updating state for video ${videoId}:`, error);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  async close(): Promise<void> {
    await this.service.close();
  }
}
