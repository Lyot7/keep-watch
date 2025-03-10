import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

/**
 * GET /api/database/setup
 *
 * Setup API endpoint to verify and initialize the database connection
 */
export async function GET() {
  const prisma = new PrismaClient();
  const results = [];

  try {
    // Check if we can connect to the database
    console.log("Testing database connection...");
    await prisma.$queryRaw`SELECT 1 as test`;
    results.push({
      task: "database_connection",
      status: "success",
      message: "Successfully connected to the database",
    });

    // Check if the YoutubeChannel table exists and has data
    const channelCount = await prisma.youtubeChannel.count();
    results.push({
      task: "channel_check",
      status: "success",
      message: `Found ${channelCount} YouTube channels in database`,
    });

    // Check if the VideoState table exists
    const videoStateCount = await prisma.videoState.count();
    results.push({
      task: "video_state_check",
      status: "success",
      message: `Found ${videoStateCount} video states in database`,
    });

    // Check database connection string being used
    const databaseUrl = process.env.DATABASE_URL || "Not set";
    // Mask password for security
    const maskedUrl = databaseUrl.replace(/:([^:@]+)@/, ":******@");

    return NextResponse.json({
      success: true,
      message: "Database connection verified successfully",
      connectionString: maskedUrl,
      results,
    });
  } catch (error) {
    console.error("Database setup check failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Database connection verification failed",
        error: error instanceof Error ? error.message : "Unknown error",
        connectionString: process.env.DATABASE_URL
          ? "Set but failed"
          : "Not set",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
