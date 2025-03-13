import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

// Initialiser Prisma
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Sécuriser l'API - cette route ne devrait être accessible qu'en mode développement ou via une clé d'API en production
  if (process.env.NODE_ENV === "production") {
    // En production, vérifier une clé d'API ou un secret
    const apiKey = req.headers["x-api-key"];
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ message: "Non autorisé" });
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  try {
    // Migrer les états "Vu" vers "Recommander"
    const vuToRecommander = await prisma.videoState.updateMany({
      where: {
        state: "Vu",
      },
      data: {
        state: "Recommander",
      },
    });

    // Migrer les états "🤯" vers "Impressionnant"
    const wowToImpressionnant = await prisma.videoState.updateMany({
      where: {
        state: "🤯",
      },
      data: {
        state: "Impressionnant",
      },
    });

    // Retourner le nombre de mises à jour effectuées
    return res.status(200).json({
      success: true,
      migratedStates: {
        vuToRecommander: vuToRecommander.count,
        wowToImpressionnant: wowToImpressionnant.count,
        total: vuToRecommander.count + wowToImpressionnant.count,
      },
      message: "Migration des états de vidéos terminée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la migration des états de vidéos:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la migration des états de vidéos",
      error: error instanceof Error ? error.message : "Erreur inconnue",
    });
  }
}
