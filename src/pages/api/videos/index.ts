import { NextApiRequest, NextApiResponse } from "next";

// Temporary in-memory storage until we implement a proper database
let videoStates = [
  {
    videoId: "example1",
    state: "À voir",
    duration: "10:30",
    durationSeconds: 630,
  },
  {
    videoId: "example2",
    state: "Impressionnant",
    duration: "15:45",
    durationSeconds: 945,
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    return res.status(200).json(videoStates);
  }

  if (req.method === "POST") {
    const { videoId, state, duration, durationSeconds } = req.body;

    const existingIndex = videoStates.findIndex((v) => v.videoId === videoId);

    if (existingIndex >= 0) {
      videoStates[existingIndex] = {
        videoId,
        state,
        duration,
        durationSeconds,
      };
    } else {
      videoStates.push({ videoId, state, duration, durationSeconds });
    }

    return res.status(200).json(videoStates);
  }

  return res.status(405).json({ message: "Method not allowed" });
}
