/**
 * Seed script to add initial YouTube channels to the database
 *
 * This script is used to set up initial YouTube channels in a new database.
 * Run with: node scripts/seed-channels.js
 */

// Use ESM syntax
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// List of initial YouTube channels to track
const initialChannels = [
  {
    channelId: "UC5HDIVwuqoIuKKw-WbQ4CvA",
    title: "Melvynx",
    thumbnailUrl:
      "https://yt3.googleusercontent.com/ytc/APkrFKb--NH6RwAGHYsD3KfxX-SAgWgIHrjR5E4Jb5SDSQ=s176-c-k-c0x00ffffff-no-rj",
  },
  {
    channelId: "UCbTw29mcP12YlTt1EpUaVJw",
    title: "Shubham Sharma",
    thumbnailUrl:
      "https://yt3.googleusercontent.com/ytc/APkrFKb--NH6RwAGHYsD3KfxX-SAgWgIHrjR5E4Jb5SDSQ=s176-c-k-c0x00ffffff-no-rj",
  },
  {
    channelId: "UCX7Y2qWriXpqocGr97tQzqg",
    title: "Leo Duff",
    thumbnailUrl:
      "https://yt3.googleusercontent.com/ytc/APkrFKb--NH6RwAGHYsD3KfxX-SAgWgIHrjR5E4Jb5SDSQ=s176-c-k-c0x00ffffff-no-rj",
  },
];

/**
 * Seeds the database with initial YouTube channels
 */
async function seedChannels() {
  console.log("Starting to seed YouTube channels...");

  try {
    // Get all existing channel IDs
    const existingChannels = await prisma.youtubeChannel.findMany({
      select: { channelId: true },
    });
    const existingChannelIds = new Set(
      existingChannels.map((channel) => channel.channelId)
    );

    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    // Process each channel
    for (const channel of initialChannels) {
      if (existingChannelIds.has(channel.channelId)) {
        // Update existing channel
        await prisma.youtubeChannel.update({
          where: { channelId: channel.channelId },
          data: {
            title: channel.title,
            thumbnailUrl: channel.thumbnailUrl,
            lastUpdated: new Date(),
          },
        });
        updatedCount++;
        console.log(`Updated channel: ${channel.title}`);
      } else {
        // Create new channel
        await prisma.youtubeChannel.create({
          data: channel,
        });
        addedCount++;
        console.log(`Added channel: ${channel.title}`);
      }
    }

    console.log("\nSeeding completed:");
    console.log(`- Added: ${addedCount} channels`);
    console.log(`- Updated: ${updatedCount} channels`);
    console.log(`- Skipped: ${skippedCount} channels`);
    console.log(`- Total processed: ${initialChannels.length} channels`);
  } catch (error) {
    console.error("Error seeding channels:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the seeding function
seedChannels();
