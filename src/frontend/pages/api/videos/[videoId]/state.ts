import { VideoState } from "@/backend/domain/models/YoutubeVideoCache";
import prisma from "@/backend/infrastructure/database/prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface UpdateStateRequestBody {
  state: string;
}

type ErrorResponse = {
  error: string;
  details?: string;
};

// Define a type that covers both possible input types
type VideoStateWithDateVariants = Omit<
  VideoState,
  "createdAt" | "updatedAt"
> & {
  createdAt: string | Date;
  updatedAt: string | Date;
};

// Helper to serialize dates to ISO strings for JSON response
const serializeVideoState = (
  state: VideoStateWithDateVariants
): VideoState => ({
  ...state,
  createdAt:
    state.createdAt instanceof Date
      ? state.createdAt.toISOString()
      : state.createdAt,
  updatedAt:
    state.updatedAt instanceof Date
      ? state.updatedAt.toISOString()
      : state.updatedAt,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VideoState | ErrorResponse>
) {
  const { videoId } = req.query;

  if (!videoId || typeof videoId !== "string") {
    return res
      .status(400)
      .json({ error: "Video ID is required" } as ErrorResponse);
  }

  if (req.method === "PUT") {
    try {
      const { state } = req.body as UpdateStateRequestBody;

      if (!state) {
        return res
          .status(400)
          .json({ error: "State is required" } as ErrorResponse);
      }

      // First check if the video exists
      const video = await prisma.youtubeVideoCache.findUnique({
        where: { videoId },
      });

      if (!video) {
        return res
          .status(404)
          .json({ error: "Video not found" } as ErrorResponse);
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
            duration: video.duration,
            durationSeconds: video.durationSeconds,
          },
        });
      }

      // Also update the state in the YoutubeVideoCache
      await prisma.youtubeVideoCache.update({
        where: { videoId },
        data: { state },
      });

      // Serialize the dates for JSON response
      const serializedState = serializeVideoState(
        videoState as VideoStateWithDateVariants
      );

      return res.status(200).json(serializedState);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";

      console.error("Error updating video state:", error);
      return res.status(500).json({
        error: "Internal server error",
        details: errorMessage,
      } as ErrorResponse);
    }
  }

  return res.status(405).json({ error: "Method not allowed" } as ErrorResponse);
}
