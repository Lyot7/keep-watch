import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videoId, state, duration, durationSeconds } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    if (!state) {
      return NextResponse.json({ error: "State is required" }, { status: 400 });
    }

    // Check if the video exists
    const video = await prisma.youtubeVideoCache.findUnique({
      where: { videoId },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Check if there's an existing video state
    let videoState = await prisma.videoState.findUnique({
      where: { videoId },
    });

    if (videoState) {
      // Update existing video state
      videoState = await prisma.videoState.update({
        where: { videoId },
        data: {
          state,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new video state
      videoState = await prisma.videoState.create({
        data: {
          videoId,
          state,
          duration,
          durationSeconds,
        },
      });
    }

    // Also update the state in the YoutubeVideoCache
    const updatedVideo = await prisma.youtubeVideoCache.update({
      where: { videoId },
      data: { state },
    });

    console.log("State updated in database:", {
      videoId,
      oldState: video.state,
      newState: state,
      videoStateObj: videoState.state,
      updatedVideoObj: updatedVideo.state,
    });

    // Serialize dates for JSON response
    const serializedState = {
      ...videoState,
      createdAt: videoState.createdAt.toISOString(),
      updatedAt: videoState.updatedAt.toISOString(),
      // Include the state directly at top level for easier access
      state: state,
    };

    return NextResponse.json(serializedState);
  } catch (error) {
    console.error("Error updating video state:", error);
    return NextResponse.json(
      { error: "Failed to update video state" },
      { status: 500 }
    );
  }
}
