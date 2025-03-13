import { IYoutubeApiClient } from "@/backend/domain/interfaces/IYoutubeApiClient";
import { IYoutubeChannelRepository } from "@/backend/domain/interfaces/IYoutubeChannelRepository";
import { IYoutubeVideoCacheRepository } from "@/backend/domain/interfaces/IYoutubeVideoCacheRepository";
import { YoutubeVideoCache } from "@/backend/domain/models/YoutubeVideoCache";

export class FetchYoutubeChannelVideos {
  constructor(
    private channelRepository: IYoutubeChannelRepository,
    private videoCacheRepository: IYoutubeVideoCacheRepository,
    private youtubeApiClient: IYoutubeApiClient
  ) {}

  async execute(channelId: string): Promise<YoutubeVideoCache[]> {
    // 1. Get the channel from the repository
    const channel = await this.channelRepository.findByChannelId(channelId);

    if (!channel) {
      throw new Error(`Channel with ID ${channelId} not found`);
    }

    if (!channel.isActive) {
      throw new Error(`Channel with ID ${channelId} is not active`);
    }

    // 2. Fetch videos from YouTube API
    const videos = await this.youtubeApiClient.fetchChannelVideos(channelId);

    // 3. Save videos to cache
    const savedVideos: YoutubeVideoCache[] = [];

    for (const video of videos) {
      // Check if video already exists
      const existingVideo = await this.videoCacheRepository.findByVideoId(
        video.videoId
      );

      if (existingVideo) {
        // Update existing video
        const updatedVideo = await this.videoCacheRepository.update(
          existingVideo.id,
          {
            ...video,
            lastFetched: new Date(),
          }
        );
        savedVideos.push(updatedVideo);
      } else {
        // Create new video
        const newVideo = await this.videoCacheRepository.create({
          ...video,
          channelId: channel.channelId,
          lastFetched: new Date(),
        });
        savedVideos.push(newVideo);
      }
    }

    // 4. Update channel lastUpdated timestamp
    await this.channelRepository.update(channel.id, {
      lastUpdated: new Date(),
    });

    return savedVideos;
  }
}
