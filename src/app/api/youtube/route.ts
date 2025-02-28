import { getYoutubeVideos } from "@/app/utils/youtube";
import { NextResponse } from "next/server";

/**
 * GET handler for YouTube videos
 * This is a route handler for the Next.js App Router
 */
export async function GET() {
  try {
    const videos = await getYoutubeVideos();
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error in YouTube API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube videos" },
      { status: 500 }
    );
  }
}
