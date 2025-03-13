import { YoutubeVideoCache } from "@/backend/domain/models/YoutubeVideoCache";

export interface IYoutubeApiClient {
  fetchChannelVideos(
    channelId: string
  ): Promise<
    Omit<
      YoutubeVideoCache,
      "id" | "lastFetched" | "videoState" | "videoThemes"
    >[]
  >;
  fetchVideoDetails(
    videoId: string
  ): Promise<Omit<
    YoutubeVideoCache,
    "id" | "lastFetched" | "videoState" | "videoThemes"
  > | null>;
  searchVideos(
    query: string
  ): Promise<
    Omit<
      YoutubeVideoCache,
      "id" | "lastFetched" | "videoState" | "videoThemes"
    >[]
  >;
}
