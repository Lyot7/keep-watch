/**
 * Types for YouTube-related functionality
 */

export interface YoutubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  videoUrl: string;
  duration: string; // Durée formatée de la vidéo (ex: "10:30")
  durationSeconds: number; // Durée en secondes pour le filtrage
  theme?: string; // Thème personnalisé qui sera ajouté manuellement
  state?: string; // État de visionnage (à voir, vu, etc.)
}

// Interface for YouTube channel configuration
export interface ChannelConfig {
  id: string;
  theme: string;
}

// Available video states
export enum VideoStateEnum {
  ToWatch = "A voir !",
  Impressive = "Impressionnant",
  Recommend = "Recommander",
}

// Interface for category configuration
export interface CategoryConfig {
  state: VideoStateEnum;
  title: string;
  description: string;
}

// Interface for YouTube API responses
export interface YouTubeApiItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
    channelTitle: string;
    publishedAt: string;
  };
}

// Interface for video details from YouTube API
export interface YouTubeVideoDetails {
  id: string;
  contentDetails: {
    duration: string; // Format ISO 8601 (ex: "PT10M30S")
  };
}
