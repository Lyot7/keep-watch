import { YoutubeVideoCache } from "@/backend/domain/models/YoutubeVideoCache";

export interface IYoutubeVideoCacheRepository {
  findById(id: string): Promise<YoutubeVideoCache | null>;
  findByVideoId(videoId: string): Promise<YoutubeVideoCache | null>;
  findByChannelId(channelId: string): Promise<YoutubeVideoCache[]>;
  findByState(state: string): Promise<YoutubeVideoCache[]>;
  findAll(): Promise<YoutubeVideoCache[]>;
  create(video: Omit<YoutubeVideoCache, "id">): Promise<YoutubeVideoCache>;
  update(
    id: string,
    video: Partial<YoutubeVideoCache>
  ): Promise<YoutubeVideoCache>;
  updateState(videoId: string, state: string): Promise<YoutubeVideoCache>;
  delete(id: string): Promise<boolean>;
}
