import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

// Initialiser Prisma
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Vérifier si la méthode est POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { videoId, state, duration, durationSeconds } = req.body;

    // Validation des données
    if (!videoId || !state) {
      return res
        .status(400)
        .json({ message: "videoId and state are required" });
    }

    try {
      // Vérifier si la table VideoState existe en exécutant une requête
      await prisma.$queryRaw`SELECT 1 FROM "VideoState" LIMIT 1`;
    } catch (tableError) {
      console.error("VideoState table not found:", tableError);
      return res.status(500).json({
        message:
          "VideoState table not available. Make sure to run prisma generate and prisma migrate.",
      });
    }

    // Trouver si la vidéo existe déjà
    const existingVideo = await prisma.videoState.findUnique({
      where: {
        videoId: videoId,
      },
    });

    let videoState;

    if (existingVideo) {
      // Mettre à jour la vidéo existante
      videoState = await prisma.videoState.update({
        where: {
          videoId: videoId,
        },
        data: {
          state: state,
          // Mettre à jour la durée seulement si elle est fournie
          ...(duration && { duration }),
          ...(durationSeconds && { durationSeconds }),
        },
      });
    } else {
      // Créer un nouvel état pour la vidéo
      videoState = await prisma.videoState.create({
        data: {
          videoId: videoId,
          state: state,
          duration: duration || null,
          durationSeconds: durationSeconds || null,
        },
      });
    }

    return res.status(200).json(videoState);
  } catch (error) {
    console.error("Error updating video state:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
