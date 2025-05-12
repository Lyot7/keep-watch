import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Coûts des opérations de l'API YouTube en unités de quota
export const API_COSTS = {
  SEARCH: 100, // Coût par requête de recherche
  VIDEO_DETAILS: 1, // Coût par vidéo pour les détails
};

/**
 * Service pour gérer et suivre l'utilisation du quota de l'API YouTube
 * (Quota control disabled - only tracks usage for information)
 */
export class ApiQuotaService {
  /**
   * Always returns true - quota control disabled
   */
  static async hasAvailableQuota(
    operationType: keyof typeof API_COSTS,
    count: number = 1
  ): Promise<boolean> {
    // Always return true - no quota control
    return true;
  }

  /**
   * Tracks API usage for informational purposes only
   */
  static async trackQuotaUsage(
    operationType: keyof typeof API_COSTS,
    count: number = 1
  ): Promise<void> {
    const quotaUsed = API_COSTS[operationType] * count;

    // Get today's date at midnight UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Update quota usage for today (for informational purposes only)
    await prisma.apiQuotaUsage.upsert({
      where: { date: today },
      update: {
        quotaUsed: { increment: quotaUsed },
      },
      create: {
        date: today,
        quotaUsed: quotaUsed,
      },
    });
  }

  /**
   * Gets current usage information (for display only)
   */
  static async getCurrentUsage(): Promise<{
    used: number;
    limit: number;
    remaining: number;
  }> {
    const dailyQuotaLimit = Number.MAX_SAFE_INTEGER; // Very high value - no limit

    // Get today's date at midnight UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

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
