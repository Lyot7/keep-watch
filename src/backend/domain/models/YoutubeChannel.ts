export interface YoutubeChannel {
  id: string;
  channelId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  subscriberCount: number | null;
  lastUpdated: Date;
  isActive: boolean;
}
