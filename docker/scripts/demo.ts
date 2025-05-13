/**
 * Demo script for YouTube Service with PostgreSQL
 *
 * This script:
 * 1. Adds a YouTube channel to the database
 * 2. Adds some videos
 * 3. Retrieves and displays videos
 * 4. Updates a video's state
 * 5. Adds themes to videos
 *
 * Run with: docker-compose run --rm demo
 */

import { YoutubeService } from "../../src/lib/api/youtube/youtubeService";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function runDemo() {
  console.log("🚀 Starting the YouTube with PostgreSQL demonstration...\n");

  try {
    // 1. Add a YouTube channel
    console.log("📺 Adding a YouTube channel...");
    const channel = await YoutubeService.upsertChannel({
      channelId: "UCWJvQParwDmFaXefhpAKXlQ", // Fireship
      title: "Fireship",
      description: "High-intensity ⚡ code tutorials and tech news",
      thumbnailUrl:
        "https://yt3.googleusercontent.com/ytc/AMLnZu80d66aj0mK3KEyMfpdGFyrVWdV5tfezE17IwRipQ=s176-c-k-c0x00ffffff-no-rj",
      subscriberCount: 2000000,
    });
    console.log(`✅ Channel added: ${channel.title}\n`);

    // 2. Add some videos
    console.log("🎬 Adding YouTube videos...");

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

    console.log(`✅ ${2} videos added\n`);

    // 3. Retrieve and display videos with state "A voir !"
    console.log("🔍 Retrieving videos to watch...");
    const videosToWatch = await YoutubeService.getVideosByState("A voir !");
    console.log(`📋 Videos to watch (${videosToWatch.length}):`);
    for (const video of videosToWatch) {
      console.log(`   - ${video.title} (${video.duration})`);
    }
    console.log("");

    // 4. Update a video's state
    console.log("✏️ Updating a video's state...");
    await YoutubeService.updateVideoState(video1.videoId, "🤯");
    console.log(`✅ Video state for "${video1.title}" updated to "🤯"\n`);

    // 5. Add themes to videos
    console.log("🏷️ Adding themes to videos...");
    await YoutubeService.addThemeToVideo(video1.videoId, "React");
    await YoutubeService.addThemeToVideo(video1.videoId, "Next.js");
    await YoutubeService.addThemeToVideo(video2.videoId, "Database");
    console.log(`✅ Themes added to videos\n`);

    // 6. Retrieve all themes
    console.log("📊 Retrieving all themes...");
    const themes = await YoutubeService.getAllThemes();
    console.log(`📋 Available themes (${themes.length}):`);
    for (const theme of themes) {
      console.log(`   - ${theme.name}`);
    }

    console.log("\n✨ Demo completed successfully!");
    console.log(
      "📝 You can now use the YoutubeService to interact with your database."
    );
  } catch (error) {
    console.error("❌ Error during demonstration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the demo
runDemo();
