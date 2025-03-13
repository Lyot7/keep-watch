import { IYoutubeChannelRepository } from "@/backend/domain/interfaces/IYoutubeChannelRepository";
import { YoutubeChannel } from "@/backend/domain/models/YoutubeChannel";

export class YoutubeChannelService {
  constructor(private channelRepository: IYoutubeChannelRepository) {}

  async getChannelById(id: string): Promise<YoutubeChannel | null> {
    return this.channelRepository.findById(id);
  }

  async getChannelByChannelId(
    channelId: string
  ): Promise<YoutubeChannel | null> {
    return this.channelRepository.findByChannelId(channelId);
  }

  async getAllChannels(): Promise<YoutubeChannel[]> {
    return this.channelRepository.findAll();
  }

  async getActiveChannels(): Promise<YoutubeChannel[]> {
    return this.channelRepository.findActive();
  }

  async createChannel(
    channelData: Omit<YoutubeChannel, "id">
  ): Promise<YoutubeChannel> {
    return this.channelRepository.create(channelData);
  }

  async updateChannel(
    id: string,
    channelData: Partial<YoutubeChannel>
  ): Promise<YoutubeChannel> {
    return this.channelRepository.update(id, channelData);
  }

  async deleteChannel(id: string): Promise<boolean> {
    return this.channelRepository.delete(id);
  }

  async toggleChannelActive(id: string): Promise<YoutubeChannel> {
    const channel = await this.channelRepository.findById(id);
    if (!channel) {
      throw new Error(`Channel with id ${id} not found`);
    }

    return this.channelRepository.update(id, { isActive: !channel.isActive });
  }
}
