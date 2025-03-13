export interface YoutubeVideoCache {
  id: string;
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  videoUrl: string;
  duration: string;
  durationSeconds: number;
  theme: string | null;
  state: string;
  viewCount: number | null;
  likeCount: number | null;
  lastFetched: string | Date;
}
