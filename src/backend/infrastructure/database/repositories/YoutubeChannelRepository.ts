import { IYoutubeChannelRepository } from "@/backend/domain/interfaces/IYoutubeChannelRepository";
import { YoutubeChannel } from "@/backend/domain/models/YoutubeChannel";
import prisma from "@/backend/infrastructure/database/prisma/client";

export class YoutubeChannelRepository implements IYoutubeChannelRepository {
  async findById(id: string): Promise<YoutubeChannel | null> {
    const channel = await prisma.youtubeChannel.findUnique({
      where: { id },
    });
    return channel;
  }

  async findByChannelId(channelId: string): Promise<YoutubeChannel | null> {
    const channel = await prisma.youtubeChannel.findUnique({
      where: { channelId },
    });
    return channel;
  }

  async findAll(): Promise<YoutubeChannel[]> {
    const channels = await prisma.youtubeChannel.findMany();
    return channels;
  }

  async findActive(): Promise<YoutubeChannel[]> {
    const channels = await prisma.youtubeChannel.findMany({
      where: { isActive: true },
    });
    return channels;
  }

  async create(channel: Omit<YoutubeChannel, "id">): Promise<YoutubeChannel> {
    const newChannel = await prisma.youtubeChannel.create({
      data: channel,
    });
    return newChannel;
  }

  async update(
    id: string,
    channel: Partial<YoutubeChannel>
  ): Promise<YoutubeChannel> {
    const updatedChannel = await prisma.youtubeChannel.update({
      where: { id },
      data: channel,
    });
    return updatedChannel;
  }

  async delete(id: string): Promise<boolean> {
    await prisma.youtubeChannel.delete({
      where: { id },
    });
    return true;
  }
}
