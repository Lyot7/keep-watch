import prisma from "@/backend/infrastructure/database/prisma/client";
import { YoutubeVideoCache } from "@/shared/types/YoutubeVideoCache";
import { NextApiRequest, NextApiResponse } from "next";

type VideoQueryParams = {
  state?: string;
  channelId?: string;
};

type ErrorResponse = {
  error: string;
  details?: string;
};

// Define a type for database video with Date
type DbYoutubeVideoCache = Omit<YoutubeVideoCache, "lastFetched"> & {
  lastFetched: Date;
};

// Helper to serialize dates to ISO strings for JSON response
const serializeVideo = (video: DbYoutubeVideoCache): YoutubeVideoCache => ({
  ...video,
  lastFetched: video.lastFetched.toISOString(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<YoutubeVideoCache[] | ErrorResponse>
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ error: "Method not allowed" } as ErrorResponse);
  }

  try {
    const { state = "A voir !", channelId } = req.query as VideoQueryParams;

    // Build the query conditions
    const whereConditions: Record<string, string> = {};

    if (state) {
      whereConditions.state = state;
    }

    if (channelId) {
      whereConditions.channelId = channelId;
    }

    // Fetch videos with the specified state
    const videos = await prisma.youtubeVideoCache.findMany({
      where: whereConditions,
      orderBy: {
        publishedAt: "desc",
      },
      take: 100,
    });

    // Serialize the dates for JSON response
    const serializedVideos = videos.map((video) =>
      serializeVideo(video as DbYoutubeVideoCache)
    );

    return res.status(200).json(serializedVideos);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    console.error("Error fetching videos:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: errorMessage,
    } as ErrorResponse);
  }
}
