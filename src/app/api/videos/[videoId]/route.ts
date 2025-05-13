import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;

  if (!videoId) {
    return NextResponse.json(
      { error: "Video ID is required" },
      { status: 400 }
    );
  }

  try {
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

    // Transform dates to ISO strings for JSON serialization
    const transformedVideo = {
      ...video,
      lastFetched: video.lastFetched.toISOString(),
      videoState: video.videoState
        ? {
            ...video.videoState,
            createdAt: video.videoState.createdAt.toISOString(),
            updatedAt: video.videoState.updatedAt.toISOString(),
          }
        : null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      videoThemes: video.videoThemes.map((vt: any) => ({
        id: vt.id,
        theme: vt.theme ? {
          id: vt.theme.id,
          name: vt.theme.name,
          description: vt.theme.description,
          color: vt.theme.color,
        } : null,
      })),
    };

    return NextResponse.json(transformedVideo);
  } catch (error) {
    console.error("Error fetching video:", error);
    return NextResponse.json(
      { error: "Failed to fetch video" },
      { status: 500 }
    );
  }
}
