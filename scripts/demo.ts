/**
 * Script de démonstration pour le service YouTube avec PostgreSQL
 *
 * Ce script:
 * 1. Ajoute une chaîne YouTube en base de données
 * 2. Ajoute quelques vidéos
 * 3. Récupère et affiche les vidéos
 * 4. Met à jour l'état d'une vidéo
 * 5. Ajoute un thème à une vidéo
 *
 * Exécuter avec: npx ts-node scripts/demo.ts
 */

import { YoutubeService } from "../src/lib/api/youtube/youtubeService";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

const prisma = new PrismaClient();

async function runDemo() {
  console.log(
    "🚀 Démarrage de la démonstration du service YouTube avec PostgreSQL...\n"
  );

  try {
    // 1. Ajouter une chaîne YouTube
    console.log("📺 Ajout d'une chaîne YouTube...");
    const channel = await YoutubeService.upsertChannel({
      channelId: "UCWJvQParwDmFaXefhpAKXlQ", // Fireship
      title: "Fireship",
      description: "High-intensity ⚡ code tutorials and tech news",
      thumbnailUrl:
        "https://yt3.googleusercontent.com/ytc/AMLnZu80d66aj0mK3KEyMfpdGFyrVWdV5tfezE17IwRipQ=s176-c-k-c0x00ffffff-no-rj",
      subscriberCount: 2000000,
    });
    console.log(`✅ Chaîne ajoutée: ${channel.title}\n`);

    // 2. Ajouter quelques vidéos
    console.log("🎬 Ajout de vidéos YouTube...");

    const video1 = await YoutubeService.upsertVideo({
      videoId: "rZ41y93P2Qo",
      title: "Next.js in 100 Seconds",
      description:
        "Next.js is a React framework for building full-stack web applications...",
      thumbnailUrl: "https://i.ytimg.com/vi/rZ41y93P2Qo/hqdefault.jpg",
      channelTitle: "Fireship",
      channelId: "UCWJvQParwDmFaXefhpAKXlQ",
      publishedAt: "2023-05-15T14:00:00Z",
      duration: "2:47",
      durationSeconds: 167,
    });

    const video2 = await YoutubeService.upsertVideo({
      videoId: "DHjZnJRK_S8",
      title: "PostgreSQL in 100 Seconds",
      description:
        "PostgreSQL is a powerful open-source relational database...",
      thumbnailUrl: "https://i.ytimg.com/vi/DHjZnJRK_S8/hqdefault.jpg",
      channelTitle: "Fireship",
      channelId: "UCWJvQParwDmFaXefhpAKXlQ",
      publishedAt: "2023-03-10T15:00:00Z",
      duration: "2:15",
      durationSeconds: 135,
      state: "Vu",
    });

    console.log(`✅ ${2} vidéos ajoutées\n`);

    // 3. Récupérer et afficher les vidéos avec l'état "A voir !"
    console.log("🔍 Récupération des vidéos à voir...");
    const videosToWatch = await YoutubeService.getVideosByState("A voir !");
    console.log(`📋 Vidéos à voir (${videosToWatch.length}):`);
    for (const video of videosToWatch) {
      console.log(`   - ${video.title} (${video.duration})`);
    }
    console.log("");

    // 4. Mettre à jour l'état d'une vidéo
    console.log("✏️ Mise à jour de l'état d'une vidéo...");
    await YoutubeService.updateVideoState(video1.videoId, "🤯");
    console.log(`✅ État de la vidéo "${video1.title}" mis à jour vers "🤯"\n`);

    // 5. Ajouter un thème à une vidéo
    console.log("🏷️ Ajout d'un thème à une vidéo...");
    await YoutubeService.addThemeToVideo(video1.videoId, "React");
    await YoutubeService.addThemeToVideo(video1.videoId, "Next.js");
    await YoutubeService.addThemeToVideo(video2.videoId, "Database");
    console.log(`✅ Thèmes ajoutés aux vidéos\n`);

    // 6. Récupérer tous les thèmes
    console.log("📊 Récupération de tous les thèmes...");
    const themes = await YoutubeService.getAllThemes();
    console.log(`📋 Thèmes disponibles (${themes.length}):`);
    for (const theme of themes) {
      console.log(`   - ${theme.name}`);
    }

    console.log("\n✨ Démonstration terminée avec succès!");
    console.log(
      "📝 Vous pouvez maintenant utiliser le service YoutubeService pour interagir avec votre base de données."
    );
  } catch (error) {
    console.error("❌ Erreur lors de la démonstration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la démonstration
runDemo();
