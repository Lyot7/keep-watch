import { YoutubeVideoCache } from "@/libs/youtubeVideoCache";
import { google } from "googleapis";
import { NextResponse } from "next/server";

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

// Helper functions imported from the old Pages Router implementation
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

function formatDuration(durationSeconds: number): string {
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = Math.floor(durationSeconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Main function to fetch YouTube videos
async function fetchYoutubeVideos(): Promise<YoutubeVideo[]> {
  // Implementation from the old getYoutubeVideos.ts file
  // Use existing code but adapt for App Router

  // Return from cache if available
  const cachedVideos = await YoutubeVideoCache.getVideos();
  if (cachedVideos) {
    return cachedVideos;
  }

  try {
    // Use Google YouTube API v3
    const youtube = google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY,
    });

    // Here you would add the implementation for fetching videos
    // using the youtube API client

    // For now, returning an empty array as placeholder
    return [];
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    throw error;
  }
}

// GET handler for App Router API route
export async function GET() {
  try {
    const videos = await fetchYoutubeVideos();
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error in YouTube videos API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube videos" },
      { status: 500 }
    );
  }
}
