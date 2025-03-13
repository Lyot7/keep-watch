/**
 * Script to reset the YouTube video cache and force a fresh load
 * This will allow us to retrieve older videos now that limits have been removed
 *
 * Run with: docker-compose run --rm reset-cache
 */

import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function resetYoutubeCache() {
  try {
    console.log("🧹 Starting YouTube cache reset...");

    // 1. Delete all entries from the youtubeVideoCache table
    const deletedVideos = await prisma.youtubeVideoCache.deleteMany({});
    console.log(`✅ ${deletedVideos.count} videos deleted from cache`);

    // 2. Update the lastUpdated date for channels to force a refresh
    const channels = await prisma.youtubeChannel.findMany();

    for (const channel of channels) {
      // Reset the lastUpdated date to a very old date
      await prisma.youtubeChannel.update({
        where: { id: channel.id },
        data: { lastUpdated: new Date(0) }, // 1970-01-01, which will force a refresh
      });

      console.log(`✅ Channel "${channel.title}" reset to force refresh`);
    }

    console.log("\n🎉 YouTube cache successfully reset!");
    console.log(
      "📝 The next time videos are fetched, all videos will be refreshed from the YouTube API."
    );
  } catch (error) {
    console.error("❌ Error resetting YouTube cache:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset function
resetYoutubeCache();
