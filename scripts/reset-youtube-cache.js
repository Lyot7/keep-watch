import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

/**
 * Script pour vider le cache des vidéos YouTube et forcer un nouveau chargement
 * Cela permettra de récupérer les vidéos plus anciennes maintenant que les limites ont été supprimées
 */
async function resetYoutubeCache() {
  try {
    console.log("🧹 Début de la réinitialisation du cache YouTube...");

    // 1. Supprimer toutes les entrées de la table youtubeVideoCache
    const deletedVideos = await prisma.youtubeVideoCache.deleteMany({});
    console.log(`✅ ${deletedVideos.count} vidéos supprimées du cache`);

    // 2. Mettre à jour la date de dernière mise à jour des chaînes pour forcer une actualisation
    const channels = await prisma.youtubeChannel.findMany();

    for (const channel of channels) {
      // Réinitialiser la date de dernière mise à jour à une date très ancienne
      await prisma.youtubeChannel.update({
        where: { id: channel.id },
        data: { lastUpdated: new Date(0) }, // 1970-01-01, ce qui forcera une actualisation
      });

      console.log(
        `✅ Canal ${channel.title} (${channel.channelId}) marqué pour actualisation`
      );
    }

    console.log(
      "\n✨ Réinitialisation terminée ! Vous pouvez maintenant redémarrer l'application pour récupérer toutes les vidéos."
    );
    console.log(
      "ℹ️ Lorsque vous redémarrez l'application, toutes les vidéos seront récupérées à nouveau, y compris les plus anciennes."
    );
  } catch (error) {
    console.error("❌ Erreur lors de la réinitialisation du cache:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
resetYoutubeCache();
