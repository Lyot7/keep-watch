// Define the interfaces inline to avoid circular dependencies
export interface VideoState {
  id: string;
  videoId: string;
  state: string;
  duration?: string;
  durationSeconds?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  notes?: string;
  rating?: number;
}

export interface VideoTheme {
  id: string;
  videoId: string;
  themeId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  theme?: Theme;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

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
  videoState?: VideoState;
  videoThemes?: VideoTheme[];
}
