import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

// Define channel IDs for Melvynx and Shubham Sharma
const CHANNELS_TO_ADD = [
  {
    channelId: "UC5HDIVwuqoIuKKw-WbQ4CvA",
    title: "Melvynx • Apprendre à coder",
    description: "Chaîne de Melvynx dédiée au développement web et mobile",
  },
  {
    channelId: "UCbTw29mcP12YlTt1EpUaVJw",
    title: "Shubham Sharma",
    description: "Chaîne de Shubham Sharma sur le développement",
  },
];

/**
 * GET /api/youtube/setup
 *
 * Setup route to add YouTube channels to the database
 */
export async function GET() {
  const prisma = new PrismaClient();

  try {
    const results = [];

    for (const channel of CHANNELS_TO_ADD) {
      // Check if channel already exists
      const existingChannel = await prisma.youtubeChannel.findUnique({
        where: { channelId: channel.channelId },
      });

      if (existingChannel) {
        results.push({
          channelId: channel.channelId,
          status: "already_exists",
          message: "Channel already exists in database",
        });
        continue;
      }

      // Add channel to database
      const newChannel = await prisma.youtubeChannel.create({
        data: {
          channelId: channel.channelId,
          title: channel.title,
          description: channel.description,
          isActive: true,
        },
      });

      results.push({
        channelId: channel.channelId,
        status: "created",
        message: "Channel added to database",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Channels setup completed",
      results,
    });
  } catch (error) {
    console.error("Error setting up channels:", error);
    return NextResponse.json(
      { error: "Failed to setup channels", details: error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
