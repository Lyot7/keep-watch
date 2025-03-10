/**
 * YouTube API utility functions
 */
import { YoutubeApi } from "@/services/youtube/api";
import { YoutubeVideo } from "@/types/youtube";

// Define channel IDs for Melvynx and Shubham Sharma
const MELVYNX_CHANNEL_ID = "UC5HDIVwuqoIuKKw-WbQ4CvA"; // Melvynx channel ID
const SHUBHAM_SHARMA_CHANNEL_ID = "UCbTw29mcP12YlTt1EpUaVJw"; // Shubham Sharma channel ID

/**
 * Fetch YouTube videos from Melvynx and Shubham Sharma channels
 */
export async function getYoutubeVideos(): Promise<YoutubeVideo[]> {
  try {
    const api = new YoutubeApi();

    try {
      // Fetch videos from both channels
      const [melvynxVideos, shubhamVideos] = await Promise.all([
        api.getLatestVideos(MELVYNX_CHANNEL_ID, 10),
        api.getLatestVideos(SHUBHAM_SHARMA_CHANNEL_ID, 10),
      ]);

      // Combine both results
      const combinedVideos = [...melvynxVideos, ...shubhamVideos];

      // Sort by published date (newest first)
      return combinedVideos.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    } finally {
      // Always close the API connection
      await api.close();
    }
  } catch (error) {
    console.error("Error fetching videos from specific channels:", error);

    // Return empty array in case of failure instead of hard-coding sample data
    return [];
  }
}
