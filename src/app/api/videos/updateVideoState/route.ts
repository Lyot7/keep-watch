import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// Initialize Prisma
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { videoId, state, duration, durationSeconds } = body;

    // Validation of data
    if (!videoId || !state) {
      return NextResponse.json(
        { message: "videoId and state are required" },
        { status: 400 }
      );
    }

    try {
      // Check if the VideoState table exists by executing a query
      await prisma.$queryRaw`SELECT 1 FROM "VideoState" LIMIT 1`;
    } catch (tableError) {
      console.error("VideoState table not found:", tableError);
      return NextResponse.json(
        {
          message:
            "VideoState table not available. Make sure to run prisma generate and prisma migrate.",
        },
        { status: 500 }
      );
    }

    // Find if the video already exists
    const existingVideo = await prisma.videoState.findUnique({
      where: {
        videoId: videoId,
      },
    });

    let videoState;

    if (existingVideo) {
      // Update existing video
      videoState = await prisma.videoState.update({
        where: {
          videoId: videoId,
        },
        data: {
          state: state,
          // Update duration only if provided
          ...(duration && { duration }),
          ...(durationSeconds && { durationSeconds }),
        },
      });
    } else {
      // Create a new state for the video
      videoState = await prisma.videoState.create({
        data: {
          videoId: videoId,
          state: state,
          duration: duration || null,
          durationSeconds: durationSeconds || null,
        },
      });
    }

    return NextResponse.json(videoState, { status: 200 });
  } catch (error) {
    console.error("Error updating video state:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
