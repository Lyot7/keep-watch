import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Coûts des opérations de l'API YouTube en unités de quota
export const API_COSTS = {
  SEARCH: 100, // Coût par requête de recherche
  VIDEO_DETAILS: 1, // Coût par vidéo pour les détails
};

/**
 * Service pour gérer et suivre l'utilisation du quota de l'API YouTube
 */
export class ApiQuotaService {
  /**
   * Vérifie si suffisamment de quota est disponible pour l'opération demandée
   */
  static async hasAvailableQuota(
    operationType: keyof typeof API_COSTS,
    count: number = 1
  ): Promise<boolean> {
    const quotaNeeded = API_COSTS[operationType] * count;
    const dailyQuotaLimit = parseInt(
      process.env.YOUTUBE_DAILY_QUOTA_LIMIT || "8000"
    );
    const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD

    // Récupérer ou créer l'entrée pour aujourd'hui
    let usage = await prisma.apiQuotaUsage.findUnique({
      where: { date: today },
    });

    if (!usage) {
      usage = await prisma.apiQuotaUsage.create({
        data: { date: today, quotaUsed: 0, requestCount: 0 },
      });
    }

    // Vérifier si le quota disponible est suffisant
    return usage.quotaUsed + quotaNeeded <= dailyQuotaLimit;
  }

  /**
   * Enregistre l'utilisation du quota après une opération API
   */
  static async trackQuotaUsage(
    operationType: keyof typeof API_COSTS,
    count: number = 1
  ): Promise<void> {
    const quotaUsed = API_COSTS[operationType] * count;
    const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD

    // Mettre à jour l'utilisation du quota pour aujourd'hui
    await prisma.apiQuotaUsage.upsert({
      where: { date: today },
      update: {
        quotaUsed: { increment: quotaUsed },
        requestCount: { increment: 1 },
        lastUpdated: new Date(),
      },
      create: {
        date: today,
        quotaUsed: quotaUsed,
        requestCount: 1,
        lastUpdated: new Date(),
      },
    });
  }

  /**
   * Récupère l'utilisation actuelle du quota pour aujourd'hui
   */
  static async getCurrentUsage(): Promise<{
    used: number;
    limit: number;
    remaining: number;
  }> {
    const dailyQuotaLimit = parseInt(
      process.env.YOUTUBE_DAILY_QUOTA_LIMIT || "8000"
    );
    const today = new Date().toISOString().split("T")[0];

    const usage = await prisma.apiQuotaUsage.findUnique({
      where: { date: today },
    });

    const quotaUsed = usage?.quotaUsed || 0;

    return {
      used: quotaUsed,
      limit: dailyQuotaLimit,
      remaining: dailyQuotaLimit - quotaUsed,
    };
  }
}
