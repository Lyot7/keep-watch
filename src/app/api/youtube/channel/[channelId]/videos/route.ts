import { YoutubeApi } from "@/services/youtube/api";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/youtube/channel/[channelId]/videos
 *
 * Fetches latest videos from a specific YouTube channel
 * Path parameters:
 * - channelId: string - ID of the YouTube channel
 * Query parameters:
 * - maxResults: number - maximum number of videos to return
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  const { channelId } = params;
  const { searchParams } = new URL(request.url);
  const maxResults = searchParams.get("maxResults")
    ? parseInt(searchParams.get("maxResults") as string, 10)
    : 10;

  if (!channelId) {
    return NextResponse.json(
      { error: "Channel ID is required" },
      { status: 400 }
    );
  }

  const api = new YoutubeApi();

  try {
    const videos = await api.getLatestVideos(channelId, maxResults);
    return NextResponse.json(videos);
  } catch (error) {
    console.error(`Error fetching videos for channel ${channelId}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch videos from channel" },
      { status: 500 }
    );
  } finally {
    await api.close();
  }
}
