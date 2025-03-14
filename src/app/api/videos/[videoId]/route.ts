import prisma from "@/backend/infrastructure/database/prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { videoId: string } }
) {
  const videoId = params.videoId;

  if (!videoId) {
    return NextResponse.json(
      { error: "Video ID is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch the video from the database
    const video = await prisma.youtubeVideoCache.findUnique({
      where: { videoId },
      include: {
        videoState: true,
        videoThemes: {
          include: {
            theme: true,
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Convert dates to ISO strings for JSON serialization
    const serializedVideo = {
      ...video,
      lastFetched: video.lastFetched.toISOString(),
      videoState: video.videoState
        ? {
            ...video.videoState,
            createdAt: video.videoState.createdAt.toISOString(),
            updatedAt: video.videoState.updatedAt.toISOString(),
          }
        : null,
      videoThemes: video.videoThemes.map((vt) => ({
        ...vt,
        createdAt: vt.createdAt.toISOString(),
        updatedAt: vt.updatedAt.toISOString(),
        theme: vt.theme
          ? {
              ...vt.theme,
              createdAt: vt.theme.createdAt.toISOString(),
              updatedAt: vt.theme.updatedAt.toISOString(),
            }
          : null,
      })),
    };

    return NextResponse.json(serializedVideo);
  } catch (error) {
    console.error("Error fetching video:", error);
    return NextResponse.json(
      { error: "Failed to fetch video details" },
      { status: 500 }
    );
  }
}
