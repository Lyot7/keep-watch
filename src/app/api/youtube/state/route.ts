import { YoutubeApi } from "@/services/youtube/api";
import { VideoStateEnum } from "@/types/youtube";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/youtube/state
 *
 * Updates the state of a video
 * Body:
 * - videoId: string - ID of the video to update
 * - state: VideoStateEnum - new state for the video
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, state } = body;

    // Validate required fields
    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    if (!state) {
      return NextResponse.json({ error: "State is required" }, { status: 400 });
    }

    // Validate state is a valid VideoStateEnum value
    if (!Object.values(VideoStateEnum).includes(state as VideoStateEnum)) {
      return NextResponse.json(
        { error: "Invalid state value" },
        { status: 400 }
      );
    }

    const api = new YoutubeApi();

    try {
      await api.updateVideoState(videoId, state as VideoStateEnum);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error updating video state:", error);
      return NextResponse.json(
        { error: "Failed to update video state" },
        { status: 500 }
      );
    } finally {
      await api.close();
    }
  } catch (error) {
    console.error("Error parsing request body:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
