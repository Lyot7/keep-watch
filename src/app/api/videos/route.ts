import prisma from "@/backend/infrastructure/database/prisma/client";
import { NextResponse } from "next/server";

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
    const transformedVideos = videos.map((video) => ({
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
