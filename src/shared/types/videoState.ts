export interface VideoState {
  videoId: string;
  state: string;
  duration: string | null;
  durationSeconds: number | null;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  channelTitle?: string;
  publishedAt?: string;
  videoUrl?: string;
  theme?: string;
}
