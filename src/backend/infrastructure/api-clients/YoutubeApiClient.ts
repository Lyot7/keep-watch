import { IYoutubeApiClient } from "@/backend/domain/interfaces/IYoutubeApiClient";
import { YoutubeVideoCache } from "@/backend/domain/models/YoutubeVideoCache";

// Define types for YouTube API responses
interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

interface YouTubeSearchItem {
  id: {
    kind: string;
    videoId?: string;
    channelId?: string;
    playlistId?: string;
  };
  snippet: YouTubeSnippet;
}

interface YouTubeVideoResponse {
  items: YouTubeVideoItem[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

interface YouTubeVideoItem {
  id: string;
  snippet: YouTubeSnippet;
  contentDetails: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
  };
  statistics: {
    viewCount?: string;
    likeCount?: string;
    dislikeCount?: string;
    favoriteCount?: string;
    commentCount?: string;
  };
}

interface YouTubeSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: {
    default: YouTubeThumbnail;
    medium: YouTubeThumbnail;
    high: YouTubeThumbnail;
    standard?: YouTubeThumbnail;
    maxres?: YouTubeThumbnail;
  };
  channelTitle: string;
  tags?: string[];
  categoryId?: string;
  liveBroadcastContent?: string;
  localized?: {
    title: string;
    description: string;
  };
}

interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

// Type for the video data we extract from YouTube's response
type VideoData = Omit<
  YoutubeVideoCache,
  "id" | "lastFetched" | "videoState" | "videoThemes"
>;

export class YoutubeApiClient implements IYoutubeApiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchChannelVideos(channelId: string): Promise<VideoData[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${this.apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=50`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data = (await response.json()) as YouTubeSearchResponse;

      // Transform the YouTube API response into our domain model
      const videos = await Promise.all(
        data.items
          .filter((item) => item.id.videoId !== undefined)
          .map(async (item) => {
            if (!item.id.videoId) return null;
            const videoDetails = await this.fetchVideoDetails(item.id.videoId);
            return videoDetails;
          })
      );

      return videos.filter((video): video is VideoData => video !== null);
    } catch (error) {
      console.error("Error fetching channel videos:", error);
      throw error;
    }
  }

  async fetchVideoDetails(videoId: string): Promise<VideoData | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?key=${this.apiKey}&id=${videoId}&part=snippet,contentDetails,statistics`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data = (await response.json()) as YouTubeVideoResponse;

      if (!data.items || data.items.length === 0) {
        return null;
      }

      const video = data.items[0];
      const snippet = video.snippet;
      const contentDetails = video.contentDetails;
      const statistics = video.statistics;

      // Parse duration from ISO 8601 format
      const duration = contentDetails.duration;
      const durationSeconds = this.parseDuration(duration);

      return {
        videoId,
        title: snippet.title,
        description: snippet.description,
        thumbnailUrl: snippet.thumbnails.high.url,
        channelTitle: snippet.channelTitle,
        channelId: snippet.channelId,
        publishedAt: snippet.publishedAt,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        duration,
        durationSeconds,
        state: "A voir !",
        viewCount: statistics.viewCount ? parseInt(statistics.viewCount) : null,
        likeCount: statistics.likeCount ? parseInt(statistics.likeCount) : null,
        theme: null,
      };
    } catch (error) {
      console.error("Error fetching video details:", error);
      return null;
    }
  }

  async searchVideos(query: string): Promise<VideoData[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${
          this.apiKey
        }&q=${encodeURIComponent(query)}&part=snippet&type=video&maxResults=50`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data = (await response.json()) as YouTubeSearchResponse;

      // Transform the YouTube API response into our domain model
      const videos = await Promise.all(
        data.items
          .filter((item) => item.id.videoId !== undefined)
          .map(async (item) => {
            if (!item.id.videoId) return null;
            const videoDetails = await this.fetchVideoDetails(item.id.videoId);
            return videoDetails;
          })
      );

      return videos.filter((video): video is VideoData => video !== null);
    } catch (error) {
      console.error("Error searching videos:", error);
      throw error;
    }
  }

  private parseDuration(duration: string): number {
    // Parse ISO 8601 duration format (e.g., PT1H30M15S)
    const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    if (!matches) {
      return 0;
    }

    const hours = parseInt(matches[1] || "0");
    const minutes = parseInt(matches[2] || "0");
    const seconds = parseInt(matches[3] || "0");

    return hours * 3600 + minutes * 60 + seconds;
  }
}
