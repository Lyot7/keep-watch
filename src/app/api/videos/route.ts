// import { NextRequest } from 'next/server';  
// import { PrismaClient } from '@prisma/client';
// import { YoutubeVideo } from '@/lib/api/youtube/getYoutubeVideos';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define type for VideoState
type VideoStateType = {
  id: string;
  videoId: string;
  state: string;
  duration?: string | null;
  durationSeconds?: number | null;
  createdAt: Date;
  updatedAt: Date;
  notes?: string | null;
  rating?: number | null;
};

// Define the type for a video with videoState
type VideoWithState = {
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
  state: string;
  theme?: string | null;
  videoState?: VideoStateType | null;
  // Use Record instead of index signature with any
  [key: string]: unknown;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");
    const limitParam = searchParams.get("limit");
    const random = searchParams.get("random") === "true";

    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    // Build the where clause based on parameters
    const where: { state?: string } = {};
    if (state) {
      where.state = state;
    }

    // Query based on parameters
    let videos;

    if (random) {
      // For random videos, we need to fetch all (or a large number) and then randomize
      videos = await prisma.youtubeVideoCache.findMany({
        where,
        include: {
          videoState: true,
        },
        take: 100, // Fetch more than needed to randomize
      });

      // Randomize the results
      videos = videos.sort(() => 0.5 - Math.random()).slice(0, limit);
    } else {
      // For regular queries, just use the limit directly and sort by newest
      videos = await prisma.youtubeVideoCache.findMany({
        where,
        include: {
          videoState: true,
        },
        take: limit,
        orderBy: {
          publishedAt: "desc", // Sort by newest first
        },
      });
    }

    // Transform the data to match the VideoState interface
    const transformedVideos = videos.map((video: VideoWithState) => ({
      id: video.id,
      videoId: video.videoId,
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      channelTitle: video.channelTitle,
      publishedAt: video.publishedAt,
      videoUrl: video.videoUrl,
      duration: video.duration,
      durationSeconds: video.durationSeconds,
      state: video.state,
      theme: video.theme,
    }));

    return NextResponse.json(transformedVideos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
