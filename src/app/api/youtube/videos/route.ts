import { YoutubeApi } from "@/services/youtube/api";
import { VideoStateEnum } from "@/types/youtube";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/youtube/videos
 *
 * Gets videos filtered by state
 * Query parameters:
 * - state: VideoStateEnum - filter videos by state
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");

  if (!state) {
    return NextResponse.json(
      { error: "State parameter is required" },
      { status: 400 }
    );
  }

  // Validate state is a valid VideoStateEnum value
  if (!Object.values(VideoStateEnum).includes(state as VideoStateEnum)) {
    return NextResponse.json(
      { error: "Invalid state parameter" },
      { status: 400 }
    );
  }

  const api = new YoutubeApi();

  try {
    const videos = await api.getVideosByState(state as VideoStateEnum);
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching videos by state:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  } finally {
    await api.close();
  }
}
