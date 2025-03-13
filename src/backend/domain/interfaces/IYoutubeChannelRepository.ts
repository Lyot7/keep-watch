import { YoutubeChannel } from "@/backend/domain/models/YoutubeChannel";

export interface IYoutubeChannelRepository {
  findById(id: string): Promise<YoutubeChannel | null>;
  findByChannelId(channelId: string): Promise<YoutubeChannel | null>;
  findAll(): Promise<YoutubeChannel[]>;
  findActive(): Promise<YoutubeChannel[]>;
  create(channel: Omit<YoutubeChannel, "id">): Promise<YoutubeChannel>;
  update(id: string, channel: Partial<YoutubeChannel>): Promise<YoutubeChannel>;
  delete(id: string): Promise<boolean>;
}
